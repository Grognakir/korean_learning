-- F2-I19: skill progress refresh + skill-prefixed concept keys with legacy fallback.

alter table public.mistake_events
  alter column primary_topic_id drop not null;

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
      and e.status = 'approved'
      and (
        e.logical_id = p_concept_key
        or (
          position(':' in p_concept_key) > 0
          and split_part(p_concept_key, ':', 1) in ('grammar', 'vocabulary', 'reading')
          and e.learning_skill = split_part(p_concept_key, ':', 1)::public.learning_skill
          and (
            e.logical_id = substr(p_concept_key, position(':' in p_concept_key) + 1)
            or (
              e.learning_skill = 'grammar'
              and exists (
                select 1
                from public.exercise_topics et
                join public.grammar_topics gt on gt.id = et.topic_id
                where et.exercise_id = e.id
                  and et.role = 'primary'
                  and gt.logical_id = substr(p_concept_key, position(':' in p_concept_key) + 1)
              )
            )
            or (
              e.learning_skill = 'reading'
              and exists (
                select 1
                from public.reading_passages rp
                where rp.id = e.reading_passage_id
                  and rp.logical_id = substr(p_concept_key, position(':' in p_concept_key) + 1)
              )
            )
            or (
              e.learning_skill = 'vocabulary'
              and exists (
                select 1
                from public.exercise_dictionary_entries ede
                join public.dictionary_entries de on de.id = ede.dictionary_entry_id
                where ede.exercise_id = e.id
                  and de.logical_id = substr(p_concept_key, position(':' in p_concept_key) + 1)
              )
            )
          )
        )
      )
  );
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

  insert into public.user_skill_progress (
    user_id,
    module_id,
    learning_skill,
    attempts,
    correct,
    accuracy,
    mastery,
    last_practiced_at
  )
  select
    p_user_id,
    v_module_id,
    ssa.learning_skill,
    ssa.attempt_count,
    ssa.correct_count,
    ssa.correct_count::numeric / ssa.attempt_count::numeric,
    public.compute_topic_mastery_status(ssa.attempt_count, ssa.correct_count),
    p_completed_at
  from (
    select
      e.learning_skill,
      count(*)::integer as attempt_count,
      count(*) filter (where a.is_correct)::integer as correct_count
    from public.attempts a
    join public.exercises e on e.id = a.exercise_id
    where a.session_id = p_session_id
      and a.user_id = p_user_id
    group by e.learning_skill
  ) ssa
  on conflict (user_id, module_id, learning_skill) do update
  set
    attempts = user_skill_progress.attempts + excluded.attempts,
    correct = user_skill_progress.correct + excluded.correct,
    accuracy = (user_skill_progress.correct + excluded.correct)::numeric
      / (user_skill_progress.attempts + excluded.attempts)::numeric,
    mastery = public.compute_topic_mastery_status(
      user_skill_progress.attempts + excluded.attempts,
      user_skill_progress.correct + excluded.correct
    ),
    last_practiced_at = excluded.last_practiced_at,
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
  delete from public.user_skill_progress where user_id = p_user_id;

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

-- Allow vocab/reading mistakes without a grammar topic while still writing review keys.
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

create or replace function public.resolve_approved_exercises_for_concepts(
  p_module_id uuid,
  p_concept_keys text[]
)
returns table (
  concept_key text,
  exercise_id uuid,
  content_version text
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (keys.concept_key)
    keys.concept_key,
    e.id as exercise_id,
    e.content_version
  from unnest(p_concept_keys) as keys(concept_key)
  join public.exercises e
    on e.module_id = p_module_id
   and e.status = 'approved'
   and (
     e.logical_id = keys.concept_key
     or (
       position(':' in keys.concept_key) > 0
       and split_part(keys.concept_key, ':', 1) in ('grammar', 'vocabulary', 'reading')
       and e.learning_skill = split_part(keys.concept_key, ':', 1)::public.learning_skill
       and (
         e.logical_id = substr(keys.concept_key, position(':' in keys.concept_key) + 1)
         or (
           e.learning_skill = 'grammar'
           and exists (
             select 1
             from public.exercise_topics et
             join public.grammar_topics gt on gt.id = et.topic_id
             where et.exercise_id = e.id
               and et.role = 'primary'
               and gt.logical_id = substr(keys.concept_key, position(':' in keys.concept_key) + 1)
           )
         )
         or (
           e.learning_skill = 'reading'
           and exists (
             select 1
             from public.reading_passages rp
             where rp.id = e.reading_passage_id
               and rp.logical_id = substr(keys.concept_key, position(':' in keys.concept_key) + 1)
           )
         )
         or (
           e.learning_skill = 'vocabulary'
           and exists (
             select 1
             from public.exercise_dictionary_entries ede
             join public.dictionary_entries de on de.id = ede.dictionary_entry_id
             where ede.exercise_id = e.id
               and de.logical_id = substr(keys.concept_key, position(':' in keys.concept_key) + 1)
           )
         )
       )
     )
   )
  order by keys.concept_key, e.content_version desc, e.id asc;
$$;

revoke all on function public.resolve_approved_exercises_for_concepts(uuid, text[]) from public;
grant execute on function public.resolve_approved_exercises_for_concepts(uuid, text[]) to authenticated;
