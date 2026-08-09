update public.grammar_topics
set code = trim(both '-' from regexp_replace(lower(trim(code)), '[^a-z0-9]+', '-', 'g'))
where code !~ '^[a-z0-9]+(-[a-z0-9]+)*$';

alter table public.grammar_topics
  add constraint grammar_topics_code_slug check (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

update public.accepted_answers as answer
set review_status = 'approved'
from public.exercises as exercise
where answer.exercise_id = exercise.id
  and answer.review_status = 'pending'
  and exercise.status = 'approved'
  and exercise.type in ('free-response', 'fill-blank');
