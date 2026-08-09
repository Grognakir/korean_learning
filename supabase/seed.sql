-- Deterministic dev seed for sample module (F1-I26). Do not import honorifics preview.
begin;

insert into public.learning_modules (
  id, slug, level, title_ko, title_ru, description_ru, status, content_version, sort_order
) values (
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  'sample-module',
  '1급',
  '한국어 첫걸음',
  'Первые шаги в корейском',
  'Познакомьтесь с корейским письмом и базовыми выражениями в коротких темах.',
  'published',
  '1.0.0',
  10
);

insert into public.grammar_topics (
  id, module_id, code, title, summary_ru, rule_payload, level, status, sort_order, content_version,
  logical_id, pattern_ko, category, usage_key
) values (
  'd8b1e1e2-97d8-4413-a890-730f85b32b51',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  'hangul-basics',
  'Основы хангыля',
  'Базовые буквы и принцип построения корейского слога.',
  '{"titleKo":"한글 기초","summaryKo":"한글의 기본 글자와 음절 구조를 살펴봅니다."}'::jsonb,
  '1급',
  'published',
  10,
  '1.0.0',
  'grammar.sample.hangul-basics',
  '한글 기초',
  'sample',
  null
);

insert into public.grammar_topics (
  id, module_id, code, title, summary_ru, rule_payload, level, status, sort_order, content_version,
  logical_id, pattern_ko, category, usage_key
) values (
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  'first-phrases',
  'Первые выражения',
  'Приветствия и простые фразы для знакомства.',
  '{"titleKo":"첫 표현","summaryKo":"인사와 간단한 자기소개 표현을 배웁니다."}'::jsonb,
  '1급',
  'published',
  20,
  '1.0.0',
  'grammar.sample.first-phrases',
  '첫 표현',
  'sample',
  null
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  '0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a',
  'write-greeting',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'free-response',
  'easy',
  null,
  'Напишите по-корейски «Здравствуйте».',
  '{"answerLanguage":"ko","acceptedAnswerIds":["canonical"]}'::jsonb,
  '안녕하세요 — нейтрально-вежливое приветствие.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.accepted_answers (
  id, exercise_id, raw_value, normalized_value, is_canonical, review_status
) values (
  gen_random_uuid(),
  '0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a',
  '안녕하세요',
  '안녕하세요',
  true,
  'approved'
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  '0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  'd4c697dc-2255-48d2-9d3f-0ed624c9c2da',
  'write-thanks',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'free-response',
  'easy',
  null,
  'Напишите по-корейски «Спасибо».',
  '{"answerLanguage":"ko","acceptedAnswerIds":["canonical"]}'::jsonb,
  '감사합니다 — формальное выражение благодарности.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('d4c697dc-2255-48d2-9d3f-0ed624c9c2da', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.accepted_answers (
  id, exercise_id, raw_value, normalized_value, is_canonical, review_status
) values (
  gen_random_uuid(),
  'd4c697dc-2255-48d2-9d3f-0ed624c9c2da',
  '감사합니다',
  '감사합니다',
  true,
  'approved'
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  'd4c697dc-2255-48d2-9d3f-0ed624c9c2da',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  '39c0c607-38a1-4a70-8e2a-e14061871ded',
  'choose-home-meaning',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  'd8b1e1e2-97d8-4413-a890-730f85b32b51',
  'grammar',
  null,
  'meaning-choice',
  'easy',
  '집',
  'Выберите значение слова.',
  '{"correctOptionId":"home","optionIds":["home","school"]}'::jsonb,
  '집 означает «дом».',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('39c0c607-38a1-4a70-8e2a-e14061871ded', 'd8b1e1e2-97d8-4413-a890-730f85b32b51', 'primary')
on conflict do nothing;

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  '39c0c607-38a1-4a70-8e2a-e14061871ded',
  'home',
  null,
  'дом',
  '{}'::jsonb,
  true,
  0
);

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  '39c0c607-38a1-4a70-8e2a-e14061871ded',
  'school',
  null,
  'школа',
  '{}'::jsonb,
  false,
  1
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  '39c0c607-38a1-4a70-8e2a-e14061871ded',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  'eaaf766c-82f8-4a41-b89a-9a275b8148ec',
  'choose-school-meaning',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  'd8b1e1e2-97d8-4413-a890-730f85b32b51',
  'grammar',
  null,
  'meaning-choice',
  'easy',
  '학교',
  'Выберите значение слова.',
  '{"correctOptionId":"school","optionIds":["home","school"]}'::jsonb,
  '학교 означает «школа».',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('eaaf766c-82f8-4a41-b89a-9a275b8148ec', 'd8b1e1e2-97d8-4413-a890-730f85b32b51', 'primary')
on conflict do nothing;

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  'eaaf766c-82f8-4a41-b89a-9a275b8148ec',
  'home',
  null,
  'дом',
  '{}'::jsonb,
  false,
  0
);

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  'eaaf766c-82f8-4a41-b89a-9a275b8148ec',
  'school',
  null,
  'школа',
  '{}'::jsonb,
  true,
  1
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  'eaaf766c-82f8-4a41-b89a-9a275b8148ec',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  'f61a206d-6e89-4728-b11f-2412bca08885',
  'choose-honorific-speech',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'honorific-choice',
  'easy',
  '말',
  'Выберите уважительный эквивалент.',
  '{"correctOptionId":"speech","optionIds":["speech","meal"]}'::jsonb,
  'Уважительная форма для 말 — 말씀.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('f61a206d-6e89-4728-b11f-2412bca08885', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  'f61a206d-6e89-4728-b11f-2412bca08885',
  'speech',
  '말씀',
  null,
  '{}'::jsonb,
  true,
  0
);

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  'f61a206d-6e89-4728-b11f-2412bca08885',
  'meal',
  '진지',
  null,
  '{}'::jsonb,
  false,
  1
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  'f61a206d-6e89-4728-b11f-2412bca08885',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  '4a6b8c63-75bc-4e7e-a1cc-1674bd7d04b8',
  'choose-honorific-meal',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'honorific-choice',
  'easy',
  '밥',
  'Выберите уважительный эквивалент.',
  '{"correctOptionId":"meal","optionIds":["speech","meal"]}'::jsonb,
  'Уважительная форма для 밥 — 진지.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('4a6b8c63-75bc-4e7e-a1cc-1674bd7d04b8', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  '4a6b8c63-75bc-4e7e-a1cc-1674bd7d04b8',
  'speech',
  '말씀',
  null,
  '{}'::jsonb,
  false,
  0
);

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  '4a6b8c63-75bc-4e7e-a1cc-1674bd7d04b8',
  'meal',
  '진지',
  null,
  '{}'::jsonb,
  true,
  1
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  '4a6b8c63-75bc-4e7e-a1cc-1674bd7d04b8',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  'e9ac3a32-e348-4272-aed8-7c9589c4680a',
  'choose-plain-speech',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'plain-choice',
  'easy',
  '말씀',
  'Выберите обычный эквивалент.',
  '{"correctOptionId":"speech","optionIds":["speech","meal"]}'::jsonb,
  'Обычная форма для 말씀 — 말.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('e9ac3a32-e348-4272-aed8-7c9589c4680a', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  'e9ac3a32-e348-4272-aed8-7c9589c4680a',
  'speech',
  '말',
  null,
  '{}'::jsonb,
  true,
  0
);

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  'e9ac3a32-e348-4272-aed8-7c9589c4680a',
  'meal',
  '밥',
  null,
  '{}'::jsonb,
  false,
  1
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  'e9ac3a32-e348-4272-aed8-7c9589c4680a',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  '25cbb450-eb66-4dd9-a11c-30a4650df992',
  'choose-plain-meal',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'plain-choice',
  'easy',
  '진지',
  'Выберите обычный эквивалент.',
  '{"correctOptionId":"meal","optionIds":["speech","meal"]}'::jsonb,
  'Обычная форма для 진지 — 밥.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('25cbb450-eb66-4dd9-a11c-30a4650df992', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  '25cbb450-eb66-4dd9-a11c-30a4650df992',
  'speech',
  '말',
  null,
  '{}'::jsonb,
  false,
  0
);

insert into public.exercise_options (
  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order
) values (
  gen_random_uuid(),
  '25cbb450-eb66-4dd9-a11c-30a4650df992',
  'meal',
  '밥',
  null,
  '{}'::jsonb,
  true,
  1
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  '25cbb450-eb66-4dd9-a11c-30a4650df992',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  'b575f3cc-1025-48ca-b80f-d15e57a28a9b',
  'match-home-school',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  'd8b1e1e2-97d8-4413-a890-730f85b32b51',
  'grammar',
  null,
  'matching-translation',
  'easy',
  null,
  'Сопоставьте корейские слова и значения.',
  '{"pairs":[{"id":"home","left":{"ko":"집","ru":null},"right":{"ko":null,"ru":"дом"}},{"id":"school","left":{"ko":"학교","ru":null},"right":{"ko":null,"ru":"школа"}}]}'::jsonb,
  '집 — дом, 학교 — школа.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('b575f3cc-1025-48ca-b80f-d15e57a28a9b', 'd8b1e1e2-97d8-4413-a890-730f85b32b51', 'primary')
on conflict do nothing;

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  'b575f3cc-1025-48ca-b80f-d15e57a28a9b',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  'b7bbd9bc-fae7-45f0-a762-7e88020edee0',
  'match-person-friend',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  'd8b1e1e2-97d8-4413-a890-730f85b32b51',
  'grammar',
  null,
  'matching-translation',
  'easy',
  null,
  'Сопоставьте корейские слова и значения.',
  '{"pairs":[{"id":"person","left":{"ko":"사람","ru":null},"right":{"ko":null,"ru":"человек"}},{"id":"friend","left":{"ko":"친구","ru":null},"right":{"ko":null,"ru":"друг"}}]}'::jsonb,
  '사람 — человек, 친구 — друг.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('b7bbd9bc-fae7-45f0-a762-7e88020edee0', 'd8b1e1e2-97d8-4413-a890-730f85b32b51', 'primary')
on conflict do nothing;

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  'b7bbd9bc-fae7-45f0-a762-7e88020edee0',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  '3cfcae48-4606-41f1-b2e7-9408aac6ae3a',
  'match-honorific-speech-meal',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'matching-honorific',
  'easy',
  null,
  'Сопоставьте обычные и уважительные формы.',
  '{"pairs":[{"id":"speech","left":{"ko":"말","ru":null},"right":{"ko":"말씀","ru":null}},{"id":"meal","left":{"ko":"밥","ru":null},"right":{"ko":"진지","ru":null}}]}'::jsonb,
  '말 — 말씀, 밥 — 진지.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('3cfcae48-4606-41f1-b2e7-9408aac6ae3a', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  '3cfcae48-4606-41f1-b2e7-9408aac6ae3a',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  '651cbd4d-2693-468c-9265-d6d341be5242',
  'match-honorific-home-name',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'matching-honorific',
  'easy',
  null,
  'Сопоставьте обычные и уважительные формы.',
  '{"pairs":[{"id":"home","left":{"ko":"집","ru":null},"right":{"ko":"댁","ru":null}},{"id":"name","left":{"ko":"이름","ru":null},"right":{"ko":"성함","ru":null}}]}'::jsonb,
  '집 — 댁, 이름 — 성함.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('651cbd4d-2693-468c-9265-d6d341be5242', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  '651cbd4d-2693-468c-9265-d6d341be5242',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  'a22d8f97-51c6-4797-8cdb-3e405591b304',
  'fill-greeting',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'fill-blank',
  'easy',
  null,
  'Вставьте приветствие.',
  '{"template":"{{greeting}}!","templateLanguage":"ko","blanks":[{"id":"greeting","acceptedAnswerIds":["canonical"]}]}'::jsonb,
  'В начале разговора можно сказать 안녕하세요.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('a22d8f97-51c6-4797-8cdb-3e405591b304', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.accepted_answers (
  id, exercise_id, raw_value, normalized_value, is_canonical, review_status
) values (
  gen_random_uuid(),
  'a22d8f97-51c6-4797-8cdb-3e405591b304',
  '안녕하세요',
  '안녕하세요',
  true,
  'approved'
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  'a22d8f97-51c6-4797-8cdb-3e405591b304',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.exercises (
  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,
  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source
) values (
  '9a8f240a-a5ea-4d83-86d2-f9b69fc740d3',
  'fill-thanks',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '4ded8be2-7e86-4d25-80d0-c0f0e277324f',
  'grammar',
  null,
  'fill-blank',
  'easy',
  null,
  'Вставьте выражение благодарности.',
  '{"template":"{{thanks}}.","templateLanguage":"ko","blanks":[{"id":"thanks","acceptedAnswerIds":["canonical"]}]}'::jsonb,
  '감사합니다 выражает благодарность.',
  'approved',
  '1.0.0',
  'manual'
);

insert into public.exercise_topics (exercise_id, topic_id, role)
values ('9a8f240a-a5ea-4d83-86d2-f9b69fc740d3', '4ded8be2-7e86-4d25-80d0-c0f0e277324f', 'primary')
on conflict do nothing;

insert into public.accepted_answers (
  id, exercise_id, raw_value, normalized_value, is_canonical, review_status
) values (
  gen_random_uuid(),
  '9a8f240a-a5ea-4d83-86d2-f9b69fc740d3',
  '감사합니다',
  '감사합니다',
  true,
  'approved'
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'exercise',
  '9a8f240a-a5ea-4d83-86d2-f9b69fc740d3',
  '1.0.0',
  'seed',
  'approved',
  'Sample seed approval'
);

insert into public.content_reviews (
  entity_type, entity_id, content_version, reviewer_label, decision, notes
) values (
  'learning_module',
  'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0',
  '1.0.0',
  'seed',
  'approved',
  'Sample module seed approval'
);

commit;
