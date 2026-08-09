-- F2-I23: reversible archive of sample-module after curriculum publish.
begin;

update public.learning_modules
set status = 'archived'
where slug = 'sample-module'
  and status <> 'archived';

update public.grammar_topics
set status = 'archived'
where module_id = (select id from public.learning_modules where slug = 'sample-module')
  and status <> 'archived';

update public.reading_passages
set status = 'archived'
where primary_module_id = (select id from public.learning_modules where slug = 'sample-module')
  and status <> 'archived';

commit;
