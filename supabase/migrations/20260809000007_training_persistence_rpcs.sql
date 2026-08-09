-- F1-I30: atomic training attempt + completion RPCs

alter table public.training_sessions
  add column if not exists complete_idempotency_key text;

create unique index if not exists training_sessions_user_complete_idempotency_idx
  on public.training_sessions (user_id, complete_idempotency_key)
  where complete_idempotency_key is not null;

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
  p_mistake_error_type text default null
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

  update public.training_sessions
  set current_index = v_position + 1,
      last_activity_at = now()
  where id = p_session_id;

  return v_attempt;
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

  return v_session;
end;
$$;

revoke all on function public.submit_training_attempt(
  uuid,
  uuid,
  text,
  jsonb,
  jsonb,
  boolean,
  numeric,
  text,
  text,
  integer,
  uuid,
  uuid,
  text,
  text
) from public;

revoke all on function public.complete_training_session(uuid, text, timestamptz) from public;

grant execute on function public.submit_training_attempt(
  uuid,
  uuid,
  text,
  jsonb,
  jsonb,
  boolean,
  numeric,
  text,
  text,
  integer,
  uuid,
  uuid,
  text,
  text
) to authenticated;

grant execute on function public.complete_training_session(uuid, text, timestamptz) to authenticated;
