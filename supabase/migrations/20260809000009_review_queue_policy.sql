-- F1-I32: nullable due_at for mastered items + review transitions inside attempt RPC

alter table public.review_queue
  alter column due_at drop not null;

create or replace function public.approved_exercise_exists_for_concept(
  p_module_id uuid,
  p_concept_key text
)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.exercises e
    where e.module_id = p_module_id
      and e.logical_id = p_concept_key
      and e.status = 'approved'
  );
$$;

create or replace function public.apply_review_queue_after_attempt(
  p_user_id uuid,
  p_session_mode text,
  p_module_id uuid,
  p_concept_key text,
  p_exercise_id uuid,
  p_attempt_id uuid,
  p_is_correct boolean,
  p_now timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_approved boolean;
  v_item public.review_queue;
  v_next_stage integer;
  v_next_due timestamptz;
  v_next_status public.review_queue_status;
  v_consecutive integer;
begin
  if p_concept_key is null or p_module_id is null then
    return;
  end if;

  v_approved := public.approved_exercise_exists_for_concept(p_module_id, p_concept_key);

  if p_session_mode = 'practice' then
    if p_is_correct then
      return;
    end if;

    insert into public.review_queue (
      user_id,
      module_id,
      exercise_id,
      concept_key,
      status,
      due_at,
      interval_stage,
      consecutive_correct,
      last_attempt_id
    )
    values (
      p_user_id,
      p_module_id,
      p_exercise_id,
      p_concept_key,
      case when v_approved then 'due'::public.review_queue_status else 'suspended'::public.review_queue_status end,
      p_now,
      0,
      0,
      p_attempt_id
    )
    on conflict (user_id, module_id, concept_key) do update
    set
      exercise_id = excluded.exercise_id,
      status = excluded.status,
      due_at = excluded.due_at,
      interval_stage = 0,
      consecutive_correct = 0,
      last_attempt_id = excluded.last_attempt_id,
      updated_at = p_now;

    return;
  end if;

  if p_session_mode <> 'review' then
    return;
  end if;

  select *
  into v_item
  from public.review_queue
  where user_id = p_user_id
    and module_id = p_module_id
    and concept_key = p_concept_key
  for update;

  if not v_approved then
    if found then
      update public.review_queue
      set
        status = 'suspended',
        exercise_id = p_exercise_id,
        last_attempt_id = p_attempt_id,
        updated_at = p_now
      where id = v_item.id;
    else
      insert into public.review_queue (
        user_id, module_id, exercise_id, concept_key, status, due_at,
        interval_stage, consecutive_correct, last_attempt_id
      )
      values (
        p_user_id, p_module_id, p_exercise_id, p_concept_key, 'suspended', p_now,
        0, 0, p_attempt_id
      );
    end if;

    return;
  end if;

  if not p_is_correct then
    if found then
      update public.review_queue
      set
        status = 'due',
        due_at = p_now,
        interval_stage = 0,
        consecutive_correct = 0,
        exercise_id = p_exercise_id,
        last_attempt_id = p_attempt_id,
        updated_at = p_now
      where id = v_item.id;
    else
      insert into public.review_queue (
        user_id, module_id, exercise_id, concept_key, status, due_at,
        interval_stage, consecutive_correct, last_attempt_id
      )
      values (
        p_user_id, p_module_id, p_exercise_id, p_concept_key, 'due', p_now,
        0, 0, p_attempt_id
      );
    end if;

    return;
  end if;

  -- review correct
  if not found then
    return;
  end if;

  v_consecutive := v_item.consecutive_correct + 1;

  if v_item.interval_stage >= 3 then
    v_next_status := 'mastered';
    v_next_stage := 3;
    v_next_due := null;
  elsif v_item.interval_stage = 0 then
    v_next_status := 'scheduled';
    v_next_stage := 1;
    v_next_due := p_now + interval '1 day';
  elsif v_item.interval_stage = 1 then
    v_next_status := 'scheduled';
    v_next_stage := 2;
    v_next_due := p_now + interval '3 days';
  else
    v_next_status := 'scheduled';
    v_next_stage := 3;
    v_next_due := p_now + interval '7 days';
  end if;

  update public.review_queue
  set
    status = v_next_status,
    interval_stage = v_next_stage,
    consecutive_correct = v_consecutive,
    due_at = v_next_due,
    exercise_id = p_exercise_id,
    last_attempt_id = p_attempt_id,
    updated_at = p_now
  where id = v_item.id;
end;
$$;

create or replace function public.sync_review_queue_availability(
  p_now timestamptz default now()
)
returns setof public.review_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  update public.review_queue rq
  set
    status = 'suspended',
    updated_at = p_now
  where rq.user_id = v_user_id
    and rq.status in ('due', 'scheduled')
    and not public.approved_exercise_exists_for_concept(rq.module_id, rq.concept_key);

  return query
  select *
  from public.review_queue rq
  where rq.user_id = v_user_id
    and (
      rq.status = 'due'
      or (rq.status = 'scheduled' and rq.due_at is not null and rq.due_at <= p_now)
    )
  order by rq.due_at asc nulls last, rq.created_at asc, rq.id asc;
end;
$$;

revoke all on function public.approved_exercise_exists_for_concept(uuid, text) from public;
revoke all on function public.apply_review_queue_after_attempt(
  uuid, text, uuid, text, uuid, uuid, boolean, timestamptz
) from public;
revoke all on function public.sync_review_queue_availability(timestamptz) from public;

grant execute on function public.sync_review_queue_availability(timestamptz) to authenticated;

-- Drop the previous signature so PostgREST does not see an ambiguous overload.
drop function if exists public.submit_training_attempt(
  uuid, uuid, text, jsonb, jsonb, boolean, numeric, text, text, integer, uuid, uuid, text, text
);

create or replace function public.submit_training_attempt(
  p_session_id uuid,
  p_exercise_id uuid,
  p_idempotency_key text,
  p_raw_answer jsonb,
  p_normalized_answer jsonb,
  p_is_correct boolean,
  p_score numeric,
  p_reason_code text,
  p_answer_version text,
  p_duration_ms integer default null,
  p_mistake_module_id uuid default null,
  p_mistake_primary_topic_id uuid default null,
  p_mistake_concept_key text default null,
  p_mistake_error_type text default null,
  p_now timestamptz default now()
)
returns public.attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.training_sessions;
  v_attempt public.attempts;
  v_position integer;
  v_attempt_number integer;
  v_logical_id text;
  v_module_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select *
  into v_attempt
  from public.attempts
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key;

  if found then
    return v_attempt;
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

  if v_session.status <> 'active' then
    raise exception 'session not active' using errcode = 'P0001';
  end if;

  select count(*)::integer
  into v_position
  from public.attempts
  where session_id = p_session_id;

  select se.exercise_id
  into strict v_attempt.exercise_id
  from public.session_exercises se
  where se.session_id = p_session_id
    and se.position = v_position;

  if v_attempt.exercise_id <> p_exercise_id then
    raise exception 'exercise not in session at current position' using errcode = 'P0001';
  end if;

  v_attempt_number := v_position + 1;

  insert into public.attempts (
    session_id,
    user_id,
    exercise_id,
    attempt_number,
    raw_answer,
    normalized_answer,
    is_correct,
    score,
    reason_code,
    answer_version,
    idempotency_key,
    duration_ms
  )
  values (
    p_session_id,
    v_user_id,
    p_exercise_id,
    v_attempt_number,
    p_raw_answer,
    p_normalized_answer,
    p_is_correct,
    p_score,
    p_reason_code,
    p_answer_version,
    p_idempotency_key,
    p_duration_ms
  )
  returning *
  into v_attempt;

  if not p_is_correct
    and p_mistake_module_id is not null
    and p_mistake_primary_topic_id is not null
    and p_mistake_concept_key is not null
    and p_mistake_error_type is not null then
    insert into public.mistake_events (
      attempt_id,
      user_id,
      exercise_id,
      module_id,
      primary_topic_id,
      concept_key,
      error_type
    )
    values (
      v_attempt.id,
      v_user_id,
      p_exercise_id,
      p_mistake_module_id,
      p_mistake_primary_topic_id,
      p_mistake_concept_key,
      p_mistake_error_type
    );
  end if;

  select e.logical_id, e.module_id
  into v_logical_id, v_module_id
  from public.exercises e
  where e.id = p_exercise_id;

  perform public.apply_review_queue_after_attempt(
    v_user_id,
    v_session.mode,
    coalesce(p_mistake_module_id, v_module_id),
    coalesce(p_mistake_concept_key, v_logical_id),
    p_exercise_id,
    v_attempt.id,
    p_is_correct,
    p_now
  );

  update public.training_sessions
  set current_index = v_position + 1,
      last_activity_at = p_now
  where id = p_session_id;

  return v_attempt;
end;
$$;

revoke all on function public.submit_training_attempt(
  uuid, uuid, text, jsonb, jsonb, boolean, numeric, text, text, integer, uuid, uuid, text, text, timestamptz
) from public;

grant execute on function public.submit_training_attempt(
  uuid, uuid, text, jsonb, jsonb, boolean, numeric, text, text, integer, uuid, uuid, text, text, timestamptz
) to authenticated;
