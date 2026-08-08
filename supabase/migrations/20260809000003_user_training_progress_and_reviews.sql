-- F1-I26: user, training, progress, AI review tables

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  preferred_language text not null default 'ru',
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or length(trim(display_name)) between 1 and 80
  ),
  constraint profiles_preferred_language_whitelist check (preferred_language in ('ru', 'ko'))
);

create table public.ai_generation_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references auth.users (id) on delete set null,
  purpose text not null,
  model text not null,
  prompt_template_version text not null,
  input_hash text not null,
  status public.ai_generation_status not null default 'queued',
  request_count integer not null default 1,
  token_input integer,
  token_output integer,
  estimated_cost numeric(12, 6),
  latency_ms integer,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_generation_requests_request_count_positive check (request_count > 0)
);

alter table public.generated_exercises
  add constraint generated_exercises_generation_request_id_fkey
  foreign key (generation_request_id)
  references public.ai_generation_requests (id)
  on delete set null;

create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  mode text not null,
  difficulty public.exercise_difficulty,
  status public.training_session_status not null default 'active',
  current_index integer not null default 0,
  content_version text not null,
  random_seed text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  idempotency_key text not null,
  constraint training_sessions_user_idempotency_unique unique (user_id, idempotency_key),
  constraint training_sessions_content_version_semver check (public.is_semver(content_version)),
  constraint training_sessions_current_index_nonnegative check (current_index >= 0),
  constraint training_sessions_completed_at_valid check (
    completed_at is null or completed_at >= started_at
  )
);

create table public.session_exercises (
  session_id uuid not null references public.training_sessions (id) on delete restrict,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position integer not null,
  exercise_version text not null,
  snapshot_payload jsonb,
  primary key (session_id, position),
  constraint session_exercises_session_exercise_position_unique unique (session_id, exercise_id, position),
  constraint session_exercises_position_nonnegative check (position >= 0),
  constraint session_exercises_exercise_version_semver check (public.is_semver(exercise_version))
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  attempt_number integer not null,
  raw_answer jsonb not null,
  normalized_answer jsonb not null,
  is_correct boolean not null,
  score numeric(5, 4) not null,
  reason_code text not null,
  answer_version text not null,
  idempotency_key text not null,
  answered_at timestamptz not null default now(),
  duration_ms integer,
  constraint attempts_user_idempotency_unique unique (user_id, idempotency_key),
  constraint attempts_score_range check (score >= 0 and score <= 1),
  constraint attempts_attempt_number_positive check (attempt_number > 0),
  constraint attempts_answer_version_semver check (public.is_semver(answer_version))
);

create table public.mistake_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.attempts (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  primary_topic_id uuid not null references public.grammar_topics (id) on delete restrict,
  concept_key text not null,
  error_type text not null,
  created_at timestamptz not null default now()
);

create table public.review_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  exercise_id uuid references public.exercises (id) on delete set null,
  concept_key text not null,
  status public.review_queue_status not null default 'due',
  due_at timestamptz not null default now(),
  interval_stage integer not null default 0,
  consecutive_correct integer not null default 0,
  last_attempt_id uuid references public.attempts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_queue_user_module_concept_unique unique (user_id, module_id, concept_key),
  constraint review_queue_interval_stage_nonnegative check (interval_stage >= 0),
  constraint review_queue_consecutive_correct_nonnegative check (consecutive_correct >= 0)
);

create table public.user_topic_progress (
  user_id uuid not null references auth.users (id) on delete restrict,
  topic_id uuid not null references public.grammar_topics (id) on delete restrict,
  attempts_count integer not null default 0,
  correct_count integer not null default 0,
  accuracy numeric(5, 4) not null default 0,
  mastery_status public.mastery_status not null default 'not_started',
  last_practiced_at timestamptz,
  content_version text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id),
  constraint user_topic_progress_counts_nonnegative check (
    attempts_count >= 0 and correct_count >= 0 and correct_count <= attempts_count
  ),
  constraint user_topic_progress_accuracy_range check (accuracy >= 0 and accuracy <= 1),
  constraint user_topic_progress_content_version_semver check (public.is_semver(content_version))
);

create table public.user_module_progress (
  user_id uuid not null references auth.users (id) on delete restrict,
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  attempts_count integer not null default 0,
  correct_count integer not null default 0,
  accuracy numeric(5, 4) not null default 0,
  completed_sessions integer not null default 0,
  mastery_status public.mastery_status not null default 'not_started',
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id),
  constraint user_module_progress_counts_nonnegative check (
    attempts_count >= 0
    and correct_count >= 0
    and correct_count <= attempts_count
    and completed_sessions >= 0
  ),
  constraint user_module_progress_accuracy_range check (accuracy >= 0 and accuracy <= 1)
);

create table public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_type public.content_review_entity_type not null,
  entity_id uuid not null,
  content_version text not null,
  reviewer_user_id uuid references auth.users (id) on delete set null,
  reviewer_label text not null,
  decision public.content_review_decision not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint content_reviews_content_version_semver check (public.is_semver(content_version))
);
