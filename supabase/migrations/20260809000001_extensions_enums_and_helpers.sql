-- F1-I26: extensions, enum domains, shared helpers

create extension if not exists pgcrypto with schema extensions;

-- Content lifecycle (modules, topics, dictionary, pairs)
create type public.content_lifecycle_status as enum (
  'draft',
  'reviewed',
  'published',
  'archived'
);

create type public.exercise_lifecycle_status as enum (
  'draft',
  'reviewed',
  'approved',
  'rejected',
  'archived'
);

create type public.exercise_source as enum ('manual', 'ai');

create type public.exercise_difficulty as enum ('easy', 'medium', 'hard');

create type public.exercise_type as enum (
  'free-response',
  'meaning-choice',
  'honorific-choice',
  'plain-choice',
  'matching-translation',
  'matching-honorific',
  'fill-blank'
);

create type public.exercise_topic_role as enum ('primary', 'secondary');

create type public.honorific_relation_type as enum ('exact', 'contextual');

create type public.training_session_status as enum ('active', 'completed', 'abandoned');

create type public.review_queue_status as enum ('due', 'scheduled', 'mastered', 'suspended');

create type public.mastery_status as enum ('not_started', 'learning', 'practiced');

create type public.ai_generation_status as enum (
  'queued',
  'running',
  'succeeded',
  'failed',
  'timed_out'
);

create type public.generated_validation_status as enum ('pending', 'valid', 'invalid');

create type public.generated_content_status as enum (
  'generated',
  'reviewed',
  'approved',
  'rejected',
  'promoted'
);

create type public.content_review_decision as enum ('reviewed', 'approved', 'rejected');

create type public.content_review_entity_type as enum (
  'learning_module',
  'grammar_topic',
  'dictionary_entry',
  'honorific_pair',
  'exercise'
);

create type public.accepted_answer_review_status as enum ('pending', 'approved', 'rejected');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_semver(text)
returns boolean
language sql
immutable
as $$
  select $1 ~ '^[0-9]+\.[0-9]+\.[0-9]+$';
$$;
