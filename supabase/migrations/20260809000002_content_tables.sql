-- F1-I26: content tables

create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  level text not null,
  title_ko text not null,
  title_ru text not null,
  description_ru text not null,
  status public.content_lifecycle_status not null default 'draft',
  content_version text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_modules_slug_unique unique (slug),
  constraint learning_modules_slug_version_unique unique (slug, content_version),
  constraint learning_modules_content_version_semver check (public.is_semver(content_version)),
  constraint learning_modules_sort_order_nonnegative check (sort_order >= 0),
  constraint learning_modules_level_nonempty check (length(trim(level)) > 0)
);

create table public.grammar_topics (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  code text not null,
  title text not null,
  summary_ru text not null,
  rule_payload jsonb not null default '{}'::jsonb,
  level text not null,
  status public.content_lifecycle_status not null default 'draft',
  sort_order integer not null default 0,
  content_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grammar_topics_module_code_version_unique unique (module_id, code, content_version),
  constraint grammar_topics_content_version_semver check (public.is_semver(content_version)),
  constraint grammar_topics_sort_order_nonnegative check (sort_order >= 0)
);

create table public.dictionary_entries (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  lemma_ko text not null,
  normalized_lemma_ko text not null,
  part_of_speech text not null,
  meanings_ru jsonb not null,
  usage_note_ru text,
  status public.content_lifecycle_status not null default 'draft',
  content_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dictionary_entries_module_lemma_pos_version_unique unique (
    module_id,
    normalized_lemma_ko,
    part_of_speech,
    content_version
  ),
  constraint dictionary_entries_content_version_semver check (public.is_semver(content_version)),
  constraint dictionary_entries_meanings_nonempty check (jsonb_array_length(meanings_ru) > 0)
);

create table public.honorific_pairs (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  plain_entry_id uuid not null references public.dictionary_entries (id) on delete restrict,
  honorific_entry_id uuid not null references public.dictionary_entries (id) on delete restrict,
  relation_type public.honorific_relation_type not null default 'exact',
  usage_note_ru text,
  status public.content_lifecycle_status not null default 'draft',
  content_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint honorific_pairs_plain_honorific_distinct check (plain_entry_id <> honorific_entry_id),
  constraint honorific_pairs_content_version_semver check (public.is_semver(content_version))
);

create table public.generated_exercises (
  id uuid primary key default gen_random_uuid(),
  generation_request_id uuid,
  candidate_payload jsonb not null,
  schema_version text not null,
  validation_status public.generated_validation_status not null default 'pending',
  content_status public.generated_content_status not null default 'generated',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  logical_id text not null,
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  primary_topic_id uuid not null references public.grammar_topics (id) on delete restrict,
  type public.exercise_type not null,
  difficulty public.exercise_difficulty not null,
  prompt_ko text,
  prompt_ru text,
  payload jsonb not null default '{}'::jsonb,
  explanation_ru text not null,
  status public.exercise_lifecycle_status not null default 'draft',
  content_version text not null,
  source public.exercise_source not null default 'manual',
  source_generation_id uuid unique references public.generated_exercises (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercises_logical_id_version_unique unique (logical_id, content_version),
  constraint exercises_content_version_semver check (public.is_semver(content_version)),
  constraint exercises_prompt_present check (prompt_ko is not null or prompt_ru is not null),
  constraint exercises_approved_requires_explanation check (
    status <> 'approved' or length(trim(explanation_ru)) > 0
  ),
  constraint exercises_ai_source_generation check (
    (source = 'manual' and source_generation_id is null)
    or (source = 'ai' and source_generation_id is not null)
  )
);

create table public.exercise_topics (
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  topic_id uuid not null references public.grammar_topics (id) on delete restrict,
  role public.exercise_topic_role not null default 'secondary',
  primary key (exercise_id, topic_id)
);

create table public.exercise_options (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  option_key text not null,
  label_ko text,
  label_ru text,
  value_payload jsonb not null default '{}'::jsonb,
  is_correct boolean not null default false,
  explanation_ru text,
  sort_order integer not null default 0,
  constraint exercise_options_exercise_key_unique unique (exercise_id, option_key),
  constraint exercise_options_label_present check (label_ko is not null or label_ru is not null),
  constraint exercise_options_sort_order_nonnegative check (sort_order >= 0)
);

create table public.accepted_answers (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  raw_value text not null,
  normalized_value text not null,
  is_canonical boolean not null default false,
  variant_note_ru text,
  review_status public.accepted_answer_review_status not null default 'approved',
  created_at timestamptz not null default now(),
  constraint accepted_answers_exercise_normalized_unique unique (exercise_id, normalized_value)
);
