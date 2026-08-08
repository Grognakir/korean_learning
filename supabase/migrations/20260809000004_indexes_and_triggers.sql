-- F1-I26: indexes and updated_at triggers

create index learning_modules_status_sort_order_idx
  on public.learning_modules (status, sort_order);

create index grammar_topics_module_status_sort_order_idx
  on public.grammar_topics (module_id, status, sort_order);

create index dictionary_entries_module_status_idx
  on public.dictionary_entries (module_id, status);

create index dictionary_entries_normalized_lemma_idx
  on public.dictionary_entries (normalized_lemma_ko);

create index honorific_pairs_module_status_idx
  on public.honorific_pairs (module_id, status);

create index honorific_pairs_plain_entry_idx on public.honorific_pairs (plain_entry_id);
create index honorific_pairs_honorific_entry_idx on public.honorific_pairs (honorific_entry_id);

create index exercises_module_status_type_difficulty_idx
  on public.exercises (module_id, status, type, difficulty);

create index exercises_primary_topic_idx on public.exercises (primary_topic_id);
create index exercises_logical_id_idx on public.exercises (logical_id);

create index exercise_topics_topic_idx on public.exercise_topics (topic_id);
create index exercise_options_exercise_sort_order_idx
  on public.exercise_options (exercise_id, sort_order);

create index accepted_answers_exercise_idx on public.accepted_answers (exercise_id);

create index training_sessions_user_status_last_activity_idx
  on public.training_sessions (user_id, status, last_activity_at desc);

create index training_sessions_module_idx on public.training_sessions (module_id);

create index attempts_session_order_idx on public.attempts (session_id, attempt_number);
create index attempts_user_exercise_answered_at_idx
  on public.attempts (user_id, exercise_id, answered_at desc);

create index attempts_wrong_partial_idx
  on public.attempts (user_id, exercise_id)
  where is_correct = false;

create index mistake_events_user_created_at_idx
  on public.mistake_events (user_id, created_at desc);

create index mistake_events_user_concept_idx on public.mistake_events (user_id, concept_key);

create index review_queue_user_status_due_at_idx
  on public.review_queue (user_id, status, due_at);

create index review_queue_exercise_idx on public.review_queue (exercise_id);

create index user_topic_progress_user_last_practiced_idx
  on public.user_topic_progress (user_id, last_practiced_at desc);

create index content_reviews_entity_version_idx
  on public.content_reviews (entity_type, entity_id, content_version);

create index content_reviews_decision_created_at_idx
  on public.content_reviews (decision, created_at desc);

create index ai_generation_requests_requester_created_at_idx
  on public.ai_generation_requests (requested_by, created_at desc);

create index generated_exercises_status_created_at_idx
  on public.generated_exercises (content_status, created_at desc);

create trigger set_learning_modules_updated_at
  before update on public.learning_modules
  for each row execute function public.set_updated_at();

create trigger set_grammar_topics_updated_at
  before update on public.grammar_topics
  for each row execute function public.set_updated_at();

create trigger set_dictionary_entries_updated_at
  before update on public.dictionary_entries
  for each row execute function public.set_updated_at();

create trigger set_honorific_pairs_updated_at
  before update on public.honorific_pairs
  for each row execute function public.set_updated_at();

create trigger set_exercises_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_review_queue_updated_at
  before update on public.review_queue
  for each row execute function public.set_updated_at();

create trigger set_user_topic_progress_updated_at
  before update on public.user_topic_progress
  for each row execute function public.set_updated_at();

create trigger set_user_module_progress_updated_at
  before update on public.user_module_progress
  for each row execute function public.set_updated_at();

create trigger set_ai_generation_requests_updated_at
  before update on public.ai_generation_requests
  for each row execute function public.set_updated_at();

create trigger set_generated_exercises_updated_at
  before update on public.generated_exercises
  for each row execute function public.set_updated_at();

-- Expose public schema objects to Supabase Data API roles (RLS policies are added in F1-I27).
grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select on all tables in schema public to anon, authenticated;

grant all on all sequences in schema public to postgres, service_role;
grant usage, select on all sequences in schema public to anon, authenticated;

grant execute on all functions in schema public to postgres, service_role, anon, authenticated;

alter default privileges in schema public
  grant all on tables to postgres, service_role;

alter default privileges in schema public
  grant select on tables to anon, authenticated;

alter default privileges in schema public
  grant all on sequences to postgres, service_role;

alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;

alter default privileges in schema public
  grant execute on functions to postgres, service_role, anon, authenticated;
