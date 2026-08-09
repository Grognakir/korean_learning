-- F2-I03: forward-only curriculum schema for grammar/vocabulary/reading skills

create type public.learning_skill as enum ('grammar', 'vocabulary', 'reading');

create type public.dictionary_module_role as enum ('primary', 'secondary', 'review');

create type public.exercise_dictionary_role as enum ('target', 'distractor', 'context');

create type public.content_confidence as enum ('high', 'medium', 'low');

alter type public.exercise_type add value if not exists 'single-choice';

alter type public.content_review_entity_type add value if not exists 'reading_passage';
alter type public.content_review_entity_type add value if not exists 'content_source';

-- learning_modules.unit_number
alter table public.learning_modules
  add column unit_number smallint null;

alter table public.learning_modules
  add constraint learning_modules_unit_number_range
  check (unit_number is null or (unit_number >= 1 and unit_number <= 16));

create unique index learning_modules_unit_number_level1_unique
  on public.learning_modules (unit_number)
  where unit_number is not null and level = '1급';

-- grammar_topics query fields + logical_id
alter table public.grammar_topics
  add column logical_id text,
  add column pattern_ko text,
  add column category text,
  add column usage_key text null;

update public.grammar_topics
set
  logical_id = 'grammar.sample.' || code,
  pattern_ko = title,
  category = 'sample'
where logical_id is null;

alter table public.grammar_topics
  alter column logical_id set not null,
  alter column pattern_ko set not null,
  alter column category set not null;

alter table public.grammar_topics
  add constraint grammar_topics_logical_id_version_unique unique (logical_id, content_version);

-- dictionary_entries sense identity
alter table public.dictionary_entries
  add column logical_id text,
  add column sense_key text,
  add column transliteration text null,
  add column level text null;

alter table public.dictionary_entries
  drop constraint dictionary_entries_module_lemma_pos_version_unique;

-- Empty today; enforce NOT NULL for future rows.
alter table public.dictionary_entries
  alter column logical_id set not null,
  alter column sense_key set not null;

alter table public.dictionary_entries
  add constraint dictionary_entries_logical_id_version_unique unique (logical_id, content_version);

alter table public.dictionary_entries
  add constraint dictionary_entries_sense_key_nonempty check (length(trim(sense_key)) > 0);

-- exercises skill + reading passage + nullable topic
alter table public.exercises
  add column learning_skill public.learning_skill not null default 'grammar',
  add column reading_passage_id uuid null;

alter table public.exercises
  alter column primary_topic_id drop not null;

alter table public.exercises
  add constraint exercises_skill_grammar_requires_topic check (
    learning_skill <> 'grammar' or primary_topic_id is not null
  );

alter table public.exercises
  add constraint exercises_skill_reading_requires_passage check (
    learning_skill <> 'reading' or reading_passage_id is not null
  );

-- New tables
create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  kind text not null,
  display_label text not null,
  derived boolean not null default false,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_sources_source_key_unique unique (source_key),
  constraint content_sources_source_key_nonempty check (length(trim(source_key)) > 0),
  constraint content_sources_no_absolute_path check (
    note is null
    or (
      note !~ '^(/|[A-Za-z]:[\\/]|~[\\/])'
      and note not ilike '%/Users/%'
      and note not ilike '%\\Users\\%'
    )
  )
);

create table public.reading_passages (
  id uuid primary key default gen_random_uuid(),
  logical_id text not null,
  primary_module_id uuid not null references public.learning_modules (id) on delete restrict,
  title_ko text not null,
  title_ru text not null,
  body_ko text not null,
  translation_ru text null,
  payload jsonb not null default '{}'::jsonb,
  status public.content_lifecycle_status not null default 'draft',
  content_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reading_passages_logical_id_version_unique unique (logical_id, content_version),
  constraint reading_passages_content_version_semver check (public.is_semver(content_version)),
  constraint reading_passages_body_nonempty check (length(trim(body_ko)) > 0)
);

alter table public.exercises
  add constraint exercises_reading_passage_id_fkey
  foreign key (reading_passage_id) references public.reading_passages (id) on delete restrict;

create table public.dictionary_entry_modules (
  entry_id uuid not null references public.dictionary_entries (id) on delete restrict,
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  role public.dictionary_module_role not null default 'primary',
  sort_order integer not null default 0,
  primary key (entry_id, module_id),
  constraint dictionary_entry_modules_sort_order_nonnegative check (sort_order >= 0)
);

create table public.exercise_dictionary_entries (
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  dictionary_entry_id uuid not null references public.dictionary_entries (id) on delete restrict,
  role public.exercise_dictionary_role not null default 'target',
  primary key (exercise_id, dictionary_entry_id)
);

create index exercise_dictionary_entries_entry_idx
  on public.exercise_dictionary_entries (dictionary_entry_id);

create table public.content_provenance (
  id uuid primary key default gen_random_uuid(),
  entity_type public.content_review_entity_type not null,
  entity_logical_id text not null,
  content_version text not null,
  source_id uuid not null references public.content_sources (id) on delete restrict,
  locator text not null,
  record_hash text not null,
  confidence public.content_confidence not null default 'medium',
  review_state public.content_lifecycle_status not null default 'draft',
  note text null,
  created_at timestamptz not null default now(),
  constraint content_provenance_content_version_semver check (public.is_semver(content_version)),
  constraint content_provenance_locator_nonempty check (length(trim(locator)) > 0),
  constraint content_provenance_hash_nonempty check (length(trim(record_hash)) > 0),
  constraint content_provenance_no_absolute_path check (
    note is null
    or (
      note !~ '^(/|[A-Za-z]:[\\/]|~[\\/])'
      and note not ilike '%/Users/%'
      and note not ilike '%\\Users\\%'
    )
  )
);

create index content_provenance_entity_idx
  on public.content_provenance (entity_type, entity_logical_id, content_version);

create table public.user_skill_progress (
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  module_id uuid not null references public.learning_modules (id) on delete restrict,
  learning_skill public.learning_skill not null,
  attempts integer not null default 0,
  correct integer not null default 0,
  accuracy numeric(5, 4) not null default 0,
  mastery public.mastery_status not null default 'not_started',
  last_practiced_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id, learning_skill),
  constraint user_skill_progress_attempts_nonnegative check (attempts >= 0),
  constraint user_skill_progress_correct_nonnegative check (correct >= 0),
  constraint user_skill_progress_correct_lte_attempts check (correct <= attempts),
  constraint user_skill_progress_accuracy_range check (accuracy >= 0 and accuracy <= 1)
);

create or replace function public.enforce_exercise_skill_targets()
returns trigger
language plpgsql
as $$
begin
  if new.learning_skill = 'grammar' and new.primary_topic_id is null then
    raise exception 'grammar exercises require primary_topic_id';
  end if;

  if new.learning_skill = 'reading' and new.reading_passage_id is null then
    raise exception 'reading exercises require reading_passage_id';
  end if;

  if new.learning_skill = 'vocabulary' then
    if not exists (
      select 1
      from public.exercise_dictionary_entries ede
      where ede.exercise_id = new.id
        and ede.role = 'target'
    ) then
      raise exception 'vocabulary exercises require at least one target dictionary entry';
    end if;
  end if;

  return new;
end;
$$;

-- Constraint trigger runs after row exists so junction inserts can happen in same statement
-- via deferred check on vocabulary; use AFTER INSERT/UPDATE deferred.
create constraint trigger exercises_skill_targets_check
  after insert or update on public.exercises
  deferrable initially deferred
  for each row
  execute function public.enforce_exercise_skill_targets();

create trigger content_sources_set_updated_at
  before update on public.content_sources
  for each row execute function public.set_updated_at();

create trigger reading_passages_set_updated_at
  before update on public.reading_passages
  for each row execute function public.set_updated_at();

create trigger user_skill_progress_set_updated_at
  before update on public.user_skill_progress
  for each row execute function public.set_updated_at();

-- RLS helpers
create or replace function public.is_published_reading_passage(p_passage_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.reading_passages p
    inner join public.learning_modules m on m.id = p.primary_module_id
    where p.id = p_passage_id
      and p.status = 'published'
      and m.status = 'published'
  );
$$;

alter table public.content_sources enable row level security;
alter table public.reading_passages enable row level security;
alter table public.dictionary_entry_modules enable row level security;
alter table public.exercise_dictionary_entries enable row level security;
alter table public.content_provenance enable row level security;
alter table public.user_skill_progress enable row level security;

create policy reading_passages_public_read
  on public.reading_passages
  for select
  to anon, authenticated
  using (
    status = 'published'
    and public.is_published_module(primary_module_id)
  );

create policy dictionary_entry_modules_public_read
  on public.dictionary_entry_modules
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.dictionary_entries d
      where d.id = entry_id
        and d.status = 'published'
        and public.is_published_module(d.module_id)
    )
    and public.is_published_module(module_id)
  );

create policy exercise_dictionary_entries_public_read
  on public.exercise_dictionary_entries
  for select
  to anon, authenticated
  using (public.is_public_exercise(exercise_id));

create policy content_sources_service_role_all
  on public.content_sources
  for all
  to service_role
  using (true)
  with check (true);

create policy content_provenance_service_role_all
  on public.content_provenance
  for all
  to service_role
  using (true)
  with check (true);

create policy user_skill_progress_owner_select
  on public.user_skill_progress
  for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.reading_passages to anon, authenticated;
grant select on public.dictionary_entry_modules to anon, authenticated;
grant select on public.exercise_dictionary_entries to anon, authenticated;
grant select on public.user_skill_progress to authenticated;

-- Seed canonical source metadata (no private paths)
insert into public.content_sources (source_key, kind, display_label, derived, note)
values
  ('curriculum-topics', 'canonical-authoring', 'Curriculum topics (1급)', false, 'docs/CURRICULUM_TOPICS.md'),
  ('curriculum-grammar', 'canonical-authoring', 'Curriculum grammar (1급)', false, 'docs/CURRICULUM_GRAMMAR.md'),
  ('curriculum-vocabulary', 'canonical-authoring', 'Curriculum vocabulary (1급)', false, 'docs/CURRICULUM_VOCABULARY.md'),
  ('curriculum-texts', 'canonical-authoring', 'Curriculum reading texts (1급)', false, 'docs/CURRICULUM_TEXTS.md')
on conflict (source_key) do nothing;
