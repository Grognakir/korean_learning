-- F1-I31: learning progress aggregates refresh on session completion

create or replace function public.compute_topic_mastery_status(
  p_attempts_count integer,
  p_correct_count integer
)
returns public.mastery_status
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(p_attempts_count, 0) <= 0 then 'not_started'::public.mastery_status
    when p_attempts_count >= 3
      and (p_correct_count::numeric / p_attempts_count::numeric) >= 0.8
      then 'practiced'::public.mastery_status
    else 'learning'::public.mastery_status
  end;
$$;

create or replace function public.compute_module_mastery_status(
  p_user_id uuid,
  p_module_id uuid,
  p_module_attempts_count integer
)
returns public.mastery_status
language plpgsql
stable
set search_path = public
as $$
declare
  v_published_topics integer;
  v_practiced_topics integer;
begin
  if coalesce(p_module_attempts_count, 0) <= 0 then
    return 'not_started';
  end if;

  select count(*)::integer
  into v_published_topics
  from public.grammar_topics gt
  where gt.module_id = p_module_id
    and gt.status = 'published';

  if v_published_topics = 0 then
    return 'learning';
  end if;

  select count(*)::integer
  into v_practiced_topics
  from public.grammar_topics gt
  join public.user_topic_progress utp
    on utp.topic_id = gt.id
   and utp.user_id = p_user_id
  where gt.module_id = p_module_id
    and gt.status = 'published'
    and utp.mastery_status = 'practiced';

  if v_practiced_topics = v_published_topics then
    return 'practiced';
  end if;

  return 'learning';
end;
$$;

create or replace function public.refresh_user_progress_for_session(
  p_session_id uuid,
  p_user_id uuid,
  p_completed_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_module_id uuid;
  v_session_attempts integer;
  v_session_correct integer;
begin
  select module_id
  into v_module_id
  from public.training_sessions
  where id = p_session_id
    and user_id = p_user_id;

  if not found then
    raise exception 'session not found' using errcode = 'P0002';
  end if;

  insert into public.user_topic_progress (
    user_id,
    topic_id,
    attempts_count,
    correct_count,
    accuracy,
    mastery_status,
    last_practiced_at,
    content_version
  )
  select
    p_user_id,
    sta.topic_id,
    sta.attempt_count,
    sta.correct_count,
    sta.correct_count::numeric / sta.attempt_count::numeric,
    public.compute_topic_mastery_status(sta.attempt_count, sta.correct_count),
    p_completed_at,
    sta.content_version
  from (
    select
      et.topic_id,
      count(*)::integer as attempt_count,
      count(*) filter (where a.is_correct)::integer as correct_count,
      max(a.answer_version) as content_version
    from public.attempts a
    join public.exercise_topics et
      on et.exercise_id = a.exercise_id
     and et.role = 'primary'
    where a.session_id = p_session_id
      and a.user_id = p_user_id
    group by et.topic_id
  ) sta
  on conflict (user_id, topic_id) do update
  set
    attempts_count = user_topic_progress.attempts_count + excluded.attempts_count,
    correct_count = user_topic_progress.correct_count + excluded.correct_count,
    accuracy = (user_topic_progress.correct_count + excluded.correct_count)::numeric
      / (user_topic_progress.attempts_count + excluded.attempts_count)::numeric,
    mastery_status = public.compute_topic_mastery_status(
      user_topic_progress.attempts_count + excluded.attempts_count,
      user_topic_progress.correct_count + excluded.correct_count
    ),
    last_practiced_at = excluded.last_practiced_at,
    content_version = excluded.content_version,
    updated_at = now();

  select
    count(*)::integer,
    count(*) filter (where is_correct)::integer
  into v_session_attempts, v_session_correct
  from public.attempts
  where session_id = p_session_id
    and user_id = p_user_id;

  insert into public.user_module_progress (
    user_id,
    module_id,
    attempts_count,
    correct_count,
    accuracy,
    completed_sessions,
    mastery_status,
    last_practiced_at
  )
  values (
    p_user_id,
    v_module_id,
    v_session_attempts,
    v_session_correct,
    case
      when v_session_attempts > 0 then v_session_correct::numeric / v_session_attempts::numeric
      else 0
    end,
    1,
    'learning',
    p_completed_at
  )
  on conflict (user_id, module_id) do update
  set
    attempts_count = user_module_progress.attempts_count + excluded.attempts_count,
    correct_count = user_module_progress.correct_count + excluded.correct_count,
    accuracy = (user_module_progress.correct_count + excluded.correct_count)::numeric
      / (user_module_progress.attempts_count + excluded.attempts_count)::numeric,
    completed_sessions = user_module_progress.completed_sessions + 1,
    last_practiced_at = excluded.last_practiced_at,
    mastery_status = public.compute_module_mastery_status(
      p_user_id,
      v_module_id,
      user_module_progress.attempts_count + excluded.attempts_count
    ),
    updated_at = now();
end;
$$;

create or replace function public.rebuild_user_progress(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session record;
begin
  if p_user_id is null then
    raise exception 'user id required' using errcode = '22023';
  end if;

  delete from public.user_topic_progress where user_id = p_user_id;
  delete from public.user_module_progress where user_id = p_user_id;

  for v_session in
    select id, completed_at
    from public.training_sessions
    where user_id = p_user_id
      and status = 'completed'
      and completed_at is not null
    order by completed_at asc, id asc
  loop
    perform public.refresh_user_progress_for_session(
      v_session.id,
      p_user_id,
      v_session.completed_at
    );
  end loop;
end;
$$;

create or replace function public.complete_training_session(
  p_session_id uuid,
  p_idempotency_key text,
  p_completed_at timestamptz default now()
)
returns public.training_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.training_sessions;
  v_expected_attempts integer;
  v_actual_attempts integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select *
  into v_session
  from public.training_sessions
  where id = p_session_id
    and user_id = v_user_id
  for update;

  if not found then
    raise exception 'session not found' using errcode = 'P0002';
  end if;

  if v_session.complete_idempotency_key = p_idempotency_key then
    return v_session;
  end if;

  if v_session.status = 'completed' then
    raise exception 'session already completed' using errcode = 'P0001';
  end if;

  if v_session.status <> 'active' then
    raise exception 'session not active' using errcode = 'P0001';
  end if;

  select count(*)::integer
  into v_expected_attempts
  from public.session_exercises
  where session_id = p_session_id;

  select count(*)::integer
  into v_actual_attempts
  from public.attempts
  where session_id = p_session_id;

  if v_actual_attempts <> v_expected_attempts then
    raise exception 'session attempts incomplete' using errcode = 'P0001';
  end if;

  update public.training_sessions
  set status = 'completed',
      completed_at = p_completed_at,
      complete_idempotency_key = p_idempotency_key,
      last_activity_at = p_completed_at
  where id = p_session_id
  returning *
  into v_session;

  perform public.refresh_user_progress_for_session(
    p_session_id,
    v_user_id,
    p_completed_at
  );

  return v_session;
end;
$$;

revoke all on function public.compute_topic_mastery_status(integer, integer) from public;
revoke all on function public.compute_module_mastery_status(uuid, uuid, integer) from public;
revoke all on function public.refresh_user_progress_for_session(uuid, uuid, timestamptz) from public;
revoke all on function public.rebuild_user_progress(uuid) from public;

grant execute on function public.compute_topic_mastery_status(integer, integer) to authenticated;
grant execute on function public.refresh_user_progress_for_session(uuid, uuid, timestamptz) to authenticated;

grant execute on function public.rebuild_user_progress(uuid) to service_role;
