-- F1-I27: row level security, public content views, tightened grants

create or replace function public.is_published_module(p_module_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_modules m
    where m.id = p_module_id
      and m.status = 'published'
  );
$$;

create or replace function public.is_published_topic(p_topic_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.grammar_topics t
    inner join public.learning_modules m on m.id = t.module_id
    where t.id = p_topic_id
      and t.status = 'published'
      and m.status = 'published'
  );
$$;

create or replace function public.is_public_exercise(p_exercise_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.exercises e
    inner join public.learning_modules m on m.id = e.module_id
    where e.id = p_exercise_id
      and e.status = 'approved'
      and m.status = 'published'
  );
$$;

create or replace function public.owns_training_session(p_session_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.training_sessions ts
    where ts.id = p_session_id
      and ts.user_id = (select auth.uid())
  );
$$;

create view public.exercise_options_public
with (security_barrier = true) as
select
  eo.id,
  eo.exercise_id,
  eo.option_key,
  eo.label_ko,
  eo.label_ru,
  eo.value_payload,
  eo.explanation_ru,
  eo.sort_order
from public.exercise_options eo
where public.is_public_exercise(eo.exercise_id);

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

-- Content tables
alter table public.learning_modules enable row level security;
alter table public.grammar_topics enable row level security;
alter table public.dictionary_entries enable row level security;
alter table public.honorific_pairs enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_topics enable row level security;
alter table public.exercise_options enable row level security;
alter table public.accepted_answers enable row level security;

create policy learning_modules_public_read
  on public.learning_modules
  for select
  to anon, authenticated
  using (status = 'published');

create policy grammar_topics_public_read
  on public.grammar_topics
  for select
  to anon, authenticated
  using (
    status = 'published'
    and public.is_published_module(module_id)
  );

create policy dictionary_entries_public_read
  on public.dictionary_entries
  for select
  to anon, authenticated
  using (
    status = 'published'
    and public.is_published_module(module_id)
  );

create policy honorific_pairs_public_read
  on public.honorific_pairs
  for select
  to anon, authenticated
  using (
    status = 'published'
    and public.is_published_module(module_id)
  );

create policy exercises_public_read
  on public.exercises
  for select
  to anon, authenticated
  using (
    status = 'approved'
    and public.is_published_module(module_id)
  );

create policy exercise_topics_public_read
  on public.exercise_topics
  for select
  to anon, authenticated
  using (public.is_public_exercise(exercise_id));

-- Direct reads are blocked; public clients must use exercise_options_public.
create policy exercise_options_service_role_all
  on public.exercise_options
  for all
  to service_role
  using (true)
  with check (true);

create policy accepted_answers_service_role_all
  on public.accepted_answers
  for all
  to service_role
  using (true)
  with check (true);

grant select on public.learning_modules to anon, authenticated;
grant select on public.grammar_topics to anon, authenticated;
grant select on public.dictionary_entries to anon, authenticated;
grant select on public.honorific_pairs to anon, authenticated;
grant select on public.exercises to anon, authenticated;
grant select on public.exercise_topics to anon, authenticated;
grant select on public.exercise_options_public to anon, authenticated;

-- User-owned tables
alter table public.profiles enable row level security;
alter table public.training_sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.attempts enable row level security;
alter table public.mistake_events enable row level security;
alter table public.review_queue enable row level security;
alter table public.user_topic_progress enable row level security;
alter table public.user_module_progress enable row level security;

create policy profiles_owner_select
  on public.profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy profiles_owner_insert
  on public.profiles
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy profiles_owner_update
  on public.profiles
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy training_sessions_owner_select
  on public.training_sessions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy training_sessions_owner_insert
  on public.training_sessions
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.is_published_module(module_id)
  );

create policy training_sessions_owner_update
  on public.training_sessions
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.is_published_module(module_id)
  );

create policy training_sessions_owner_delete
  on public.training_sessions
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create policy session_exercises_owner_select
  on public.session_exercises
  for select
  to authenticated
  using (public.owns_training_session(session_id));

create policy session_exercises_owner_insert
  on public.session_exercises
  for insert
  to authenticated
  with check (
    public.owns_training_session(session_id)
    and public.is_public_exercise(exercise_id)
  );

create policy session_exercises_owner_update
  on public.session_exercises
  for update
  to authenticated
  using (public.owns_training_session(session_id))
  with check (
    public.owns_training_session(session_id)
    and public.is_public_exercise(exercise_id)
  );

create policy session_exercises_owner_delete
  on public.session_exercises
  for delete
  to authenticated
  using (public.owns_training_session(session_id));

create policy attempts_owner_select
  on public.attempts
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy mistake_events_owner_select
  on public.mistake_events
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy review_queue_owner_select
  on public.review_queue
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy user_topic_progress_owner_select
  on public.user_topic_progress
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy user_module_progress_owner_select
  on public.user_module_progress
  for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.training_sessions to authenticated;
grant select, insert, update, delete on public.session_exercises to authenticated;
grant select on public.attempts to authenticated;
grant select on public.mistake_events to authenticated;
grant select on public.review_queue to authenticated;
grant select on public.user_topic_progress to authenticated;
grant select on public.user_module_progress to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- Server/admin-only tables
alter table public.ai_generation_requests enable row level security;
alter table public.generated_exercises enable row level security;
alter table public.content_reviews enable row level security;

create policy ai_generation_requests_service_role_all
  on public.ai_generation_requests
  for all
  to service_role
  using (true)
  with check (true);

create policy generated_exercises_service_role_all
  on public.generated_exercises
  for all
  to service_role
  using (true)
  with check (true);

create policy content_reviews_service_role_all
  on public.content_reviews
  for all
  to service_role
  using (true)
  with check (true);
