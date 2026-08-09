# Фаза 2 — подробный исполнимый план для Cursor

Последнее обновление: 2026-08-09

Статус: `in_progress` (F2-I01–F2-I03 `done`). Фаза 1 завершена и слита в `main` коммитом `4fb00b8`.

## 1. Как использовать этот документ

Этот файл — единственный подробный порядок исполнения фазы 2. `docs/APPLICATION_PLAN.md` хранит общий статус и ссылку сюда, но не дублирует карточки.

Исполнитель обязан:

1. полностью прочитать `AGENTS.md`, `docs/ITERATION_MANDATORY_CONDITIONS.md`, четыре документа раздела 1.1, `docs/PHASE_2_CONTENT_AUDIT.md` и карточку текущей итерации;
2. выполнять строго одну итерацию за раз;
3. не начинать следующую карточку, пока текущая не имеет статус `done`, один коммит и зелёные обязательные проверки;
4. перед изменением Next.js-кода прочитать релевантные локальные документы из `node_modules/next/dist/docs/`;
5. не ослаблять тесты, RLS или content review ради зелёного результата;
6. после итерации обновить статус в этом файле, `docs/APPLICATION_PLAN.md` и полностью перезаписать `.Codex/sessions/current.md`;
7. остановиться на контрольной точке и ждать решения пользователя, если карточка явно содержит CP.

Нельзя одновременно объединять несколько карточек «для удобства». Исправление дефекта текущей карточки входит в неё. Дефект уже закрытой карточки оформляется отдельной `F2-FIX-*` итерацией перед продолжением.

### 1.1. Четыре канонических источника контента

Вся реализация фазы 2 строится только на следующих authoring-документах:

1. `docs/CURRICULUM_TOPICS.md` — 16 модулей и учебные результаты;
2. `docs/CURRICULUM_GRAMMAR.md` — 80 грамматических пунктов и объяснения;
3. `docs/CURRICULUM_VOCABULARY.md` — полный словарный корпус;
4. `docs/CURRICULUM_TEXTS.md` — итоговый объединённый корпус текстов.

Исходные файлы, фотографии, HTML и TSV остаются только происхождением этих документов и материалом аудита. Cursor не должен повторно выбирать между Claude/GPT, заново распознавать фотографии или исправлять канонические документы через производные выгрузки. Если реализация обнаруживает содержательное противоречие, сначала отдельной правкой обновляется соответствующий `CURRICULUM_*.md`, затем аудит и план, и только после этого JSON/seed/runtime.

## 2. Проблема и продуктовый результат

Фаза 1 дала устойчивый общий движок, но приложение всё ещё показывает тестовый `sample-module` и не отражает реальную программу пользователя. Учебные материалы сведены в четыре канонических документа: 16 тем, грамматика 1급, словарь и объединённые тексты. Производные HTML/TSV не могут быть runtime-источником истины.

Результат фазы 2:

- пользователь выбирает материал **по теме** или **по грамматике**;
- доступны тренировки **грамматики**, **слов** и **чтения**;
- каталог содержит все 16 разделов и 80 пунктов программы;
- контент имеет стабильные идентификаторы, происхождение, версию и статус проверки;
- повторение и прогресс различают тему, грамматику и навык;
- неопроверенный контент не попадает в публичную выборку;
- основная работа не зависит от LLM.

## 3. Цели и измеримые границы

### 3.1. Обязательные цели

1. Завести 16 тематических модулей в порядке учебника и 80 атомарных grammar topic records.
2. Импортировать итоговый корпус `CURRICULUM_TEXTS.md` без повторного выбора между исходными расшифровками.
3. Импортировать `CURRICULUM_VOCABULARY.md` как draft, различая омонимы и производные повторения.
4. Реализовать каталоги «По темам» и «По грамматике» без добавления лишнего пункта основной навигации.
5. Реализовать выбор тренировки по навыку и фильтру материала.
6. Добавить общий `single-choice` для грамматики/чтения, не маскируя его под `meaning-choice`.
7. Подготовить минимальный проверяемый банк упражнений по каждому разделу и каждой грамматике.
8. Сохранить текущие гарантии сессий, попыток, review queue, прогресса, RLS и отсутствия повторных route loaders.

### 3.2. Минимум опубликованного контента к CP-8

| Область                   |                                                                         Минимум |
| ------------------------- | ------------------------------------------------------------------------------: |
| Тематические модули       |                                                                              16 |
| Грамматические элементы   |                                    80 metadata records; без пропусков программы |
| Грамматические упражнения |               минимум 2 на каждый элемент: одно распознавание и одно применение |
| Словарь                   |      минимум 12 проверенных значений на каждый модуль; связи могут пересекаться |
| Словарные упражнения      | минимум 4 на каждый модуль, покрывающие оба направления хотя бы в рамках набора |
| Чтение                    |                        минимум 1 проверенный текст и 3 вопроса на каждый модуль |
| Объяснения                |                                                   у каждого approved упражнения |
| Provenance                |     у каждого опубликованного модуля, grammar topic, слова, текста и упражнения |

Это нижняя граница, а не цель большого банка. Все остальные найденные слова, тексты и 100 вопросов импортируются как draft и не обязаны быть опубликованы в фазе 2.

### 3.3. Не входит в фазу 2

- LLM-проверка сочинений/СГ;
- генерация большого количества упражнений через OpenAI;
- запись голоса, микрофон, Supabase Storage, транскрипция и оценка произношения;
- аудирование без предоставленного легального аудио;
- админ-панель для редактирования контента;
- FSRS/SM-2 и новая сложная система интервального повторения;
- полный импорт бизнес-лексики без подтверждения уровня;
- редизайн основной оболочки, не требуемый новыми потоками;
- автоматическая публикация любого контента со статусом `draft`, `reviewed` или `needs_review`.

## 4. Принятые архитектурные решения

### 4.1. Два каталога, а не две копии данных

- `learning_modules` представляют 16 тем/уроков.
- `grammar_topics` представляют атомарные грамматические элементы внутри модулей.
- Каталог «По темам» группирует материал по `learning_modules`.
- Каталог «По грамматике» строится из тех же `grammar_topics` с указанием урока.
- `높임말` — фильтр/кластер элементов уроков 14 и 16, а не отдельный модуль.

### 4.2. Навыки

Добавляется доменный discriminant `learningSkill`:

- `grammar`;
- `vocabulary`;
- `reading`.

Writing, speaking и listening не добавляются в enum заранее. Для них будет отдельная миграция после утверждения поведения; это дешевле и безопаснее, чем фиктивные недоступные режимы.

### 4.3. Контент и runtime

- Четыре `docs/CURRICULUM_*.md` — человекочитаемый первичный authoring source.
- Версионируемые canonical JSON-файлы в `content/phase-2/` — детерминированное производное представление и вход генератора seed.
- Zod-схемы и integrity checks — в `scripts/content/` и server-only domain.
- Supabase — runtime-источник на preview/production.
- Local test fixtures остаются маленькими и независимыми от всего банка.
- Полный банк не импортируется в Client Components и не попадает в client bundle.
- Производные HTML/TSV никогда не читаются приложением в runtime.

### 4.4. Словарная единица

Одна запись означает одно значение, а не одно написание. Омонимы имеют разные `logical_id`/`sense_key`. Тематическая принадлежность — many-to-many; слово может встречаться в нескольких уроках без копии лексемы.

### 4.5. Чтение

Текст и вопрос — разные сущности. `reading_passages` хранит текст и его структуру; упражнение ссылается на passage. Маркер пропуска и accepted answers живут в упражнении, а не переписывают source text.

### 4.6. Review и provenance

У каждой канонической записи есть:

- `logical_id`;
- `content_version`;
- lifecycle status;
- одна или несколько source refs;
- locator внутри источника;
- confidence;
- review note при конфликте.

Абсолютные локальные пути пользователя в БД не сохраняются. Верхнеуровневые source keys: `curriculum-topics`, `curriculum-grammar`, `curriculum-vocabulary`, `curriculum-texts`. Исходные ключи `textbook-outline-photo`, `inha-texts-claude`, `inha-texts-gpt`, `grammar-notes`, `korean-words` допустимы только как lineage внутри manifest и не читаются импортерами напрямую.

## 5. Целевая структура файлов

```text
content/
└── phase-2/
    ├── source-manifest.json
    ├── units.json
    ├── grammar-topics.json
    ├── dictionary-entries.json
    ├── dictionary-unit-links.json
    ├── reading-passages.json
    ├── exercises-grammar.json
    ├── exercises-vocabulary.json
    ├── exercises-reading.json
    └── provenance.json

scripts/
└── content/
    ├── schemas.ts
    ├── validate-content.ts
    ├── import-curriculum-texts.ts
    ├── normalize-dictionary.ts
    └── content-integrity.test.ts

src/features/catalog/
src/features/dictionary/
src/features/reading/
src/features/training/        # расширяется, не дублируется
src/modules/curriculum/       # server-side adapters/fixtures, без копии canonical банка
```

Если фактическая структура к началу итерации уже отличается, исполнитель меняет только конкретные пути, но сохраняет границы: authoring data отдельно, runtime repository отдельно, UI не импортирует canonical JSON напрямую.

## 6. Целевая миграция данных

Миграции только вперёд; существующие попытки и sample session не ломаются.

### 6.1. Изменения существующих таблиц

`learning_modules`:

- добавить `unit_number smallint null` и unique partial index для 1급;
- sample row временно получает `null`, затем архивируется в финальной итерации;
- статус/версия остаются существующими.

`grammar_topics`:

- добавить `logical_id text`, `pattern_ko text`, `category text`, `usage_key text null`;
- backfill sample topic IDs;
- unique `(logical_id, content_version)`;
- `rule_payload` остаётся для структурированных правил, но query-поля не прячутся в JSON.

`dictionary_entries`:

- добавить `logical_id text`, `sense_key text`, `transliteration text null`, `level text null`;
- заменить старую уникальность на `(logical_id, content_version)`;
- текущий `module_id` пока остаётся как owning module для совместимости и не удаляется в фазе 2;
- добавить junction `dictionary_entry_modules(entry_id,module_id,role,sort_order)`.

`exercises`:

- добавить `learning_skill grammar|vocabulary|reading`;
- сделать `primary_topic_id` nullable;
- добавить `reading_passage_id` nullable;
- добавить `single-choice` в DB/TypeScript exercise type;
- constraint: grammar требует topic; reading требует passage; vocabulary требует хотя бы одну связь через junction;
- legacy sample/honorific exercise types не удаляются этой миграцией.

`content_reviews`:

- расширить entity types для `reading_passage` и `content_source` при необходимости;
- история остаётся append-only.

### 6.2. Новые таблицы

`dictionary_entry_modules` — связи слова с темами.

`reading_passages`:

- `id`, `logical_id`, `primary_module_id`, `title_ko/ru`, `body_ko`, `translation_ru null`, `payload`, `status`, `content_version`, timestamps;
- unique `(logical_id, content_version)`;
- published passage доступен только внутри published module.

`exercise_dictionary_entries`:

- `exercise_id`, `dictionary_entry_id`, `role target|distractor|context`;
- composite PK и index по dictionary entry.

`content_sources`:

- stable `source_key`, kind, display label, derived flag, note;
- без абсолютного локального пути.

`content_provenance`:

- entity type, entity logical id, content version, source id, locator, record hash, confidence, review state, note;
- immutable history; валидатор проверяет существование target logical id.

`user_skill_progress`:

- `(user_id,module_id,learning_skill)` PK;
- attempts, correct, accuracy, mastery, last practiced;
- обновляется в той же доверенной транзакции, что текущий прогресс.

### 6.3. RLS

- anon/auth видят только published modules, published/reviewed-safe metadata и approved exercises;
- правильные ответы и `is_correct` по-прежнему не выдаются до submit;
- provenance review notes и source hashes не доступны публичному клиенту;
- user progress доступен только владельцу;
- browser writes в authoring/content tables запрещены;
- service role используется только на сервере/seed workflow.

## 7. Инварианты контента

Автоматические проверки обязаны подтверждать:

- ровно 16 unit numbers `1..16` без разрывов;
- ровно 80 syllabus grammar records согласно карте аудита;
- уникальность logical IDs и versioned keys;
- все source records двух расшифровок учтены в reconciliation manifest;
- исходные количества сравнения: Claude 93, GPT 92, paired 90;
- пропуски `㉠/㉡` не заменены accepted answers в passage body;
- нет категории `добавлено` в canonical dictionary;
- одинаковое написание допускается только при разных `sense_key` либо явной грамматической relation;
- draft/needs-review entity не может быть связан с approved exercise как target answer;
- approved exercise имеет explanation, provenance, difficulty, skill, module и корректную target-связь;
- `single-choice` имеет минимум 2 уникальные опции и ровно один правильный ответ;
- публичный mapper не содержит correct flags/accepted answers;
- minimum coverage раздела 3.2 подтверждается отдельным coverage test перед CP-8.

## 8. Контрольные точки

| CP   | После  | Что проверяет пользователь                                                   | Что заблокировано до подтверждения        |
| ---- | ------ | ---------------------------------------------------------------------------- | ----------------------------------------- |
| CP-6 | F2-I07 | слияние текстов, список 16 тем/80 грамматик, спорные формы и граница словаря | публикация canonical контента и UI на нём |
| CP-7 | F2-I20 | UX каталогов и трёх тренировочных навыков на mobile/tablet/desktop           | финальная языковая публикация             |
| CP-8 | F2-I22 | корейский контент и русские объяснения минимального банка                    | release candidate                         |
| CP-9 | F2-I23 | preview smoke, регрессии, итог фазы                                          | tag/release `v0.1.0`                      |

До CP разрешено создавать и тестировать draft-контент. Запрещено обходить CP сменой статуса напрямую в БД.

## 9. Сводка итераций

| Итерация | Результат                                             |
| -------- | ----------------------------------------------------- |
| F2-I01   | baseline, ветка, команды content quality              |
| F2-I02   | схемы canonical контента и provenance                 |
| F2-I03   | forward-only DB schema для тем/слов/чтения/навыков    |
| F2-I04   | 16 модулей и 80 grammar topics в draft                |
| F2-I05   | canonical draft словаря и reconciliation отчёт        |
| F2-I06   | слитый корпус текстов и draft reading bank            |
| F2-I07   | полный content audit gate и CP-6                      |
| F2-I08   | детерминированный seed/import pipeline                |
| F2-I09   | repositories, DTO и cache queries для нового контента |
| F2-I10   | каталог «По темам / По грамматике»                    |
| F2-I11   | детальная страница темы и грамматики                  |
| F2-I12   | рабочий словарь по темам и категориям                 |
| F2-I13   | экран настройки тренировки по навыку/фильтру          |
| F2-I14   | общий `single-choice` и reading presentation          |
| F2-I15   | минимальный grammar exercise bank                     |
| F2-I16   | минимальный vocabulary exercise bank                  |
| F2-I17   | минимальный reading exercise bank                     |
| F2-I18   | создание/возобновление отфильтрованных сессий         |
| F2-I19   | review queue и прогресс по skill/topic/module         |
| F2-I20   | адаптивность, клавиатура, a11y и CP-7                 |
| F2-I21   | автоматический content/repository/security gate       |
| F2-I22   | ручной language review, статусы approved, CP-8        |
| F2-I23   | preview stabilization, CP-9 и `v0.1.0`                |

## 10. Карточки итераций

### F2-I01 — Baseline и инструменты content quality

- **Статус:** `done`.
- **Цель:** начать фазу 2 от подтверждённого состояния и добавить только команды проверки будущего контента.
- **Вход:** `main` содержит `4fb00b8`; дерево чистое; phase-1 CI зелёный.
- **Ветка:** `codex/f2-i01-content-baseline`.
- **Задачи:** зафиксировать baseline-команды и результаты; создать пустую структуру `content/phase-2` без учебных записей; добавить `content:validate` и `test:content` scripts; определить server-only запрет импорта `content/` из client graph.
- **Файлы:** `package.json`, `scripts/content/*`, минимальные tests, статусные документы.
- **Тесты:** script запускается на пустом/минимальном manifest; invalid JSON, неизвестный schema version и client import завершаются ошибкой.
- **Обязательный gate:** format, lint, typecheck, unit, integration, build; baseline DB/RLS и e2e без изменений подтверждаются хотя бы одним прогоном.
- **Не делать:** не копировать материалы; не менять БД/страницы; не обновлять зависимости без необходимости.
- **DoD:** команды воспроизводимы локально и CI, текущий sample работает без изменений.
- **Коммит:** `chore: prepare phase two content validation`.
- **Следующий шаг:** только F2-I02.

### F2-I02 — Canonical schemas и provenance

- **Статус:** `done`.
- **Цель:** определить проверяемый формат authoring data до импорта хотя бы одной записи.
- **Вход:** F2-I01 `done`.
- **Ветка:** `codex/f2-i02-content-contracts`.
- **Задачи:** Zod-схемы source manifest, unit, grammar topic, dictionary sense, unit link, reading passage, exercise, provenance; stable logical ID pattern; semver; lifecycle `draft|needs_review|reviewed|approved|archived`; confidence; locators; cross-file reference validator; четыре обязательные canonical source records.
- **Контракт:** отдельные source record IDs и entity logical IDs; один source record может поддерживать несколько entities; абсолютные local paths запрещены schema.
- **Файлы:** `scripts/content/schemas.ts`, schema fixtures/tests, `content/phase-2/source-manifest.json` только с metadata источников.
- **Тесты:** duplicate IDs, dangling refs, invalid status transitions, absolute path, пустой source ref, approved без review/provenance, омоним без sense key; отсутствие любого из четырёх canonical source keys ломает validation.
- **Ручная проверка:** названия источников понятны человеку и не раскрывают приватные пути.
- **Не делать:** не проектировать UI; не писать миграцию; не вставлять учебный текст.
- **DoD:** любой будущий content file валидируется независимо и вместе с графом.
- **Коммит:** `feat: define canonical learning content contracts`.
- **Следующий шаг:** F2-I03.

### F2-I03 — Схема Supabase для трёх навыков

- **Статус:** `done`.
- **Цель:** расширить существующую БД forward-only без потери phase-1 данных.
- **Вход:** F2-I02 `done`; прочитаны текущие migrations/RPC/RLS/tests.
- **Ветка:** `codex/f2-i03-curriculum-schema`.
- **Задачи:** изменения раздела 6; enums/columns/tables/indexes/check constraints; backfill sample logical IDs и `learning_skill`; обновить triggers, content review entity types, RLS, grants и generated TypeScript types.
- **Совместимость:** существующие sample exercises получают `grammar`; `primary_topic_id` остаётся заполненным; старые session/attempt rows читаются без пересоздания.
- **Файлы:** новая migration с очередным timestamp, `src/types/database.ts`, DB/RLS tests; существующие migration не редактировать.
- **DB-тесты:** чистый reset; upgrade поверх phase-1 snapshot; constraints по skill; reading passage visibility; dictionary junction; two-user progress isolation; anon denial; answer leakage denial.
- **Security:** public source hashes/review notes недоступны; authoring writes только trusted role.
- **Не делать:** не seed 16 модулей; не менять UI/domain exercise union, кроме типов, необходимых для компиляции DB mapper.
- **DoD:** `supabase db reset`, DB suite и RLS suite зелёные; phase-1 e2e не регрессировал.
- **Коммит:** `feat: extend database for curriculum skills`.
- **Следующий шаг:** F2-I04.

### F2-I04 — 16 тем и 80 grammar topics

- **Статус:** `done`.
- **Цель:** формализовать полную структуру 1급 без упражнений и без публикации.
- **Вход:** F2-I03 `done`; `CURRICULUM_TOPICS.md` и `CURRICULUM_GRAMMAR.md`.
- **Ветка:** `codex/f2-i04-curriculum-catalog`.
- **Задачи:** добавить 16 unit records и 80 atomic grammar records; stable slugs/codes; корейские/русские заголовки; краткие summaries только там, где смысл не спорный; category/usage key; source refs; `needs_review` для конфликтов.
- **Обязательные коды:** unit prefix `u01..u16`; grammar logical IDs не зависят от отображаемого номера `①/②`; варианты с разным поведением имеют разные usage keys.
- **Файлы:** `units.json`, `grammar-topics.json`, `provenance.json`, coverage tests.
- **Тесты:** 16 номеров `1..16`, 80 records, exact per-unit counts `5,4,5,5,5,6,5,5,5,5,5,5,5,5,5,5`; unique codes/slugs/order; every grammar record linked to one unit and source.
- **Ручная проверка:** сверить 16 модулей с `CURRICULUM_TOPICS.md`, а 80 пунктов и краткие объяснения — с `CURRICULUM_GRAMMAR.md`; фотографии не открывать.
- **Не делать:** не добавлять explanations от себя и не возвращаться к исходным заметкам; не создавать отдельный `honorifics` module; не публиковать.
- **DoD:** structural catalog полный, но весь новый content остаётся draft/needs_review.
- **Коммит:** `feat: add level one curriculum catalog`.
- **Следующий шаг:** F2-I05.

### F2-I05 — Словарный draft и reconciliation

- **Статус:** `done`.
- **Цель:** получить одну словарную базу без молчаливой потери омонимов и без доверия к производным выгрузкам.
- **Вход:** F2-I04 `done`.
- **Ветка:** `codex/f2-i05-dictionary-canonicalization`.
- **Задачи:** parser для `CURRICULUM_VOCABULARY.md`; нормализовать category labels; отделить irregular-form links от новых senses; создать draft dictionary entries и unit links; сформировать machine-readable reconciliation report, где HTML/TSV/flashcards используются только для отчёта о покрытии и не меняют канонический Markdown.
- **Правила:** `добавлено` не категория; `눈/다리/만/배/이/저/팔/풀` не дедуплицировать только по spelling; translation/transliteration conflict не решать автоматически; бизнес-лексика остаётся draft.
- **Файлы:** `normalize-dictionary.ts`, dictionary JSONs, provenance, отчёт validation output, tests.
- **Тесты:** все строки таблиц `CURRICULUM_VOCABULARY.md` классифицированы как canonical sense, relation или duplicate source record; 803/731/179 derived entries учтены только в reconciliation; canonical category `добавлено` отсутствует; dangling unit links отсутствуют.
- **Ручная проверка:** выборка минимум 10 entries из каждой крупной категории и все известные омонимы.
- **Не делать:** не генерировать упражнения; не публиковать все слова; не исправлять перевод без review note.
- **DoD:** повторный запуск детерминирован и не меняет JSON без изменения источника/правил.
- **Коммит:** `feat: reconcile canonical Korean dictionary`.
- **Следующий шаг:** F2-I06.

### F2-I06 — Импорт канонических текстов и draft reading bank

- **Статус:** `done`.
- **Цель:** импортировать итоговый `CURRICULUM_TEXTS.md` и 100 производных вопросов без повторного слияния расшифровок.
- **Вход:** F2-I05 `done`.
- **Ветка:** `codex/f2-i06-reading-corpus`.
- **Задачи:** parser для структуры 16 уроков и приложения `듣기 지문`; canonical passage records; lineage решений слияния из вводной части документа; импорт 5×20 HTML questions как draft exercises; отдельное хранение passage markers и answers.
- **Обязательные решения:** импорт должен сохранить культурный блок урока 1, структуру урока 3, пропуск урока 7, маркеры и `이 꽃` урока 9, полные блоки 10/14/15, реплику урока 11 и `앞으로 쭉 가면` урока 13.
- **Файлы:** parser канонического Markdown, `reading-passages.json`, `exercises-reading.json`, provenance, tests.
- **Тесты:** 16 уроков присутствуют; все секции и приложение учтены; 5 variants/100 questions; 20 questions per variant; passage body сохраняет `㉠/㉡`; один correct option только внутри private authoring shape; regression assertions на обязательные решения.
- **Ручная проверка:** сравнить выборку импортированных passage records непосредственно с `CURRICULUM_TEXTS.md`; просмотреть вопросы без открытия изображений папки.
- **Не делать:** не читать заново `inha-texts-claude.md`/`inha-texts-gpt.md`; не объявлять draft question approved; не добавлять LLM; не копировать HTML UI.
- **DoD:** corpus воспроизводим, каждый конфликт видим в отчёте и status.
- **Коммит:** `feat: reconcile reading source corpus`.
- **Следующий шаг:** F2-I07.

### F2-I07 — Content audit gate и CP-6

- **Статус:** `done` (CP-6 принят пользователем 2026-08-09).
- **Цель:** доказать, что структура и импорт полны, прежде чем строить пользовательский UI.
- **Вход:** F2-I06 `done`.
- **Ветка:** `codex/f2-i07-content-audit-gate`.
- **Задачи:** агрегированный audit command; отчёт counts/statuses и соответствия четырём `CURRICULUM_*.md`; link на `PHASE_2_CONTENT_AUDIT.md`; исправить только механические ошибки импорта; подготовить пользователю список ещё не approved записей и границу approved vocabulary.
- **Тесты:** все content tests; full type/lint/unit/integration/build; DB/RLS после новых migrations; secret/private-path scan.
- **Ручная проверка:** topics/grammar/texts/vocabulary против четырёх канонических документов; словарные омонимы; регрессии исправленных грамматических опечаток.
- **CP-6:** остановиться и показать пользователю отчёт. Разрешение открывает перевод проверенных metadata в reviewed и UI-работы.
- **Не делать:** не начинать seed/runtime repositories/UI; не менять `needs_review` на `approved` без решения.
- **DoD:** CP-6 принят либо карточка остаётся `blocked` с точным списком вопросов.
- **Коммит:** `test: enforce phase two content audit gate`.
- **Следующий шаг:** только после CP-6 — F2-I08.

### F2-I08 — Детерминированный seed/import pipeline

- **Статус:** `done`.
- **Цель:** переносить canonical content в Supabase одной проверяемой транзакцией.
- **Вход:** F2-I07 `done`, CP-6 принят.
- **Ветка:** `codex/f2-i08-content-seed-pipeline`.
- **Задачи:** заменить sample-only seed generator на versioned importer; порядок sources→modules→topics→dictionary→passages→exercises→links→reviews/provenance; idempotent upsert по logical ID/version; dry-run; transaction rollback; sample пока не архивировать.
- **Файлы:** `scripts/generate-db-seed.ts` либо отдельный importer, `supabase/seed.sql`, tests, package scripts.
- **Тесты:** два последовательных imports дают одинаковое состояние; failure в середине откатывает; status не повышается импортом; counts совпадают с validated JSON; existing attempts remain valid.
- **Security:** script требует trusted environment только для remote; локальный seed не логирует secret/value answers.
- **Ручная проверка:** local reset и выборочная сверка строк во всех новых таблицах.
- **Не делать:** не применять remote migration/seed без отдельного шага карточки и подтверждённого проекта; не архивировать sample.
- **DoD:** fresh DB полностью воспроизводится из migrations + canonical data.
- **Коммит:** `feat: add deterministic curriculum content import`.
- **Следующий шаг:** F2-I09.

### F2-I09 — Repositories, public DTO и cache queries

- **Статус:** `done`.
- **Цель:** дать страницам безопасный server API без прямого доступа к таблицам и правильным ответам.
- **Вход:** F2-I08 `done`.
- **Ветка:** `codex/f2-i09-content-repositories`.
- **Задачи:** repository interfaces для units, grammar catalog, dictionary, passages и exercise filters; Supabase/local adapters; mappers; Zod parsing; cache by stable query key; invalidation policy; parallel server queries без waterfall.
- **Публичные фильтры:** `unitSlug`, `grammarTopicId`, `learningSkill`, `difficulty`; неизвестная комбинация возвращает empty/not-found по контракту.
- **DTO:** source notes, correct flags, accepted answers, review notes и hashes исключены; Korean fragments сохраняют language metadata.
- **Файлы:** `src/features/catalog`, `dictionary`, `reading`, расширения training repository/cache, tests.
- **Тесты:** mapper invalid rows; draft exclusion; query combinations; cache hit/retry; no duplicate fetch on repeat navigation; unavailable DB state.
- **Performance:** ни один каталог не делает N+1 по 16 модулям; counts агрегируются одним запросом/RPC.
- **Не делать:** не строить страницы; не менять session UI; не включать unapproved exercises.
- **DoD:** integration test получает одинаковый safe DTO из local fixture и Supabase fixture.
- **Коммит:** `feat: add curriculum content repositories`.
- **Следующий шаг:** F2-I10.

### F2-I10 — Каталог «По темам / По грамматике»

- **Статус:** `done`.
- **Цель:** реализовать два требуемых способа входа в материал на существующем `/topics`.
- **Вход:** F2-I09 `done`.
- **Ветка:** `codex/f2-i10-dual-catalog`.
- **Задачи:** кастомный segmented/tab control без native select; URL state `?view=themes|grammar`; 16 compact cards; grammar grouping по уроку/category; counts доступного контента; loading/error/empty; link semantics/prefetch.
- **UI:** не добавлять цифры как декоративные nav icons; номер урока допустим как metadata; карточки переходят 1→2→3 колонки без растянутого последнего элемента; заголовок/описание не ломают layout на промежуточных ширинах.
- **Файлы:** `/topics`, catalog components/CSS, search-param parsing, tests/e2e.
- **Тесты:** default themes; direct grammar URL; back/forward; keyboard Arrow/Enter; focus; unknown query fallback; repeat navigation without visible route loader after cache warmup.
- **Viewport:** 320, 360, 375, 390, 480, 600, 768, 1024, 1280, 1440, 1920, 2560 и плавный sweep шагом ≤6 px.
- **Не делать:** не добавлять полнотекстовый поиск; не менять primary navigation; не отображать draft counts как доступные.
- **DoD:** оба каталога доступны мышью, touch и клавиатурой, без overflow/layout jumps.
- **Коммит:** `feat: add theme and grammar catalogs`.
- **Следующий шаг:** F2-I11.

### F2-I11 — Детали темы и грамматики

- **Статус:** `done`.
- **Цель:** показать, чему учиться, и дать точный переход к нужной тренировке.
- **Вход:** F2-I10 `done`.
- **Ветка:** `codex/f2-i11-content-details`.
- **Задачи:** theme detail: goals, grammar, approved vocabulary count, reading availability, actions; grammar detail: pattern, concise rule, examples, linked unit, actions; not-found/unavailable; translation hint only по контракту.
- **Routing:** сохранить `/topics/[moduleSlug]`; grammar details добавить вложенным стабильным route либо query route, выбранным до кода и покрытым test; proxy/slug cache обновить.
- **UI:** одинаковая action area height не должна зависеть от длины текста; длинные Korean patterns переносятся; `lang="ko"`; actions не прыгают между records.
- **Файлы:** route pages, server panels, components/CSS, repositories/tests/e2e.
- **Тесты:** all 16 theme routes; representative short/long grammar; draft detail hidden; unknown slug; keyboard links; cached repeat open.
- **Ручная проверка:** тексты не обещают недоступный навык; `높임말` показывает связи уроков 14/16.
- **Не делать:** не добавлять rich Markdown renderer; не показывать review notes пользователю.
- **DoD:** из каждой детали можно перейти в корректно преднастроенную тренировку.
- **Коммит:** `feat: add curriculum detail pages`.
- **Следующий шаг:** F2-I12.

### F2-I12 — Словарь по темам и категориям

- **Статус:** `done`.
- **Цель:** заменить placeholder `/dictionary` рабочим безопасным словарём.
- **Вход:** F2-I11 `done`.
- **Ветка:** `codex/f2-i12-dictionary-catalog`.
- **Задачи:** список approved senses; custom filters по unit/category/POS; Korean/Russian display; homonym labels; usage notes; pagination/load-more server query; URL state; empty/error/loading.
- **Search:** простой normalized prefix/contains только если текущая БД может сделать его без client загрузки всего массива; иначе отложить и явно не рисовать неработающее поле.
- **UI:** mobile cards/table adaptation; фильтры не native select; touch targets ≥44px; не показывать transliteration как главный ответ.
- **Файлы:** dictionary feature/page, repository query/RPC при необходимости, CSS/tests/e2e.
- **Тесты:** homonyms separate; filter intersection; draft excluded; pagination stable; repeated navigation cache; keyboard custom control; Korean IME if search included.
- **Performance:** initial payload bounded; no 803-entry client serialization.
- **Не делать:** не добавлять редактирование/избранное; не публиковать весь draft массив.
- **DoD:** пользователь может открыть проверенные слова конкретной темы и понять различие значений.
- **Коммит:** `feat: add themed Korean dictionary`.
- **Следующий шаг:** F2-I13.

### F2-I13 — Настройка тренировки

- **Статус:** `planned`.
- **Цель:** убрать hardcoded sample card и дать выбор грамматики, слов или чтения.
- **Вход:** F2-I12 `done`.
- **Ветка:** `codex/f2-i13-training-setup`.
- **Задачи:** `/training` показывает три skill cards; после выбора — custom picker темы; для grammar дополнительно picker конкретной конструкции/«все в теме»; difficulty и session size только из доступных counts; URL/direct-link state; CTA disabled с объяснением при недостатке content.
- **Контракт:** setup формирует request DTO, но session creation остаётся в F2-I18; до него используется безопасный preview/disabled boundary или fixture behind feature flag.
- **UI:** равная высота actions; адаптивная grid; никакого native select; описание не вызывает прыжок CTA; mobile stack compact.
- **Файлы:** training setup components/domain/schema/tests; страница без hardcoded `sample-module` lookup.
- **Тесты:** skill→filter dependencies; invalid URL; empty content; keyboard; focus after picker; no correct answers in setup payload.
- **Не делать:** не создавать сессию обходным client-only способом; не добавлять writing/speaking cards даже disabled.
- **DoD:** точный request DTO детерминирован и валиден для трёх skills.
- **Коммит:** `feat: add skill based training setup`.
- **Следующий шаг:** F2-I14.

### F2-I14 — Общий single-choice и чтение в renderer

- **Статус:** `planned`.
- **Цель:** поддержать общие вопросы грамматики/чтения без злоупотребления meaning/honorific types.
- **Вход:** F2-I13 `done`.
- **Ветка:** `codex/f2-i14-single-choice-reading`.
- **Задачи:** добавить `single-choice` во все domain/Zod/DB mappers/checker/public DTO/renderer; reading passage presentation над question; optional shared passage snapshot; server evaluation; accessible options.
- **Совместимость:** существующие choice types продолжают работать; миграция данных не переименовывает их массово.
- **Файлы:** learning/exercise types, schemas, CheckerRegistry, ChoiceExercise/ExerciseRenderer, PublicExercise, repositories, tests.
- **Тесты:** exactly one correct; duplicate option rejection; answer leak; shuffle stable by session seed; long passage; empty passage invalid; keyboard selection/submit; feedback.
- **UI:** Korean passage `lang=ko`; readable measure; no nested scroll on mobile; prompt and action alignment from mandatory conditions.
- **Не делать:** не добавлять true/false/order types; порядок можно представить single-choice в текущем MVP.
- **DoD:** representative reading question проходит start→answer→feedback→result локально и через Supabase fixture.
- **Коммит:** `feat: support single choice reading exercises`.
- **Следующий шаг:** F2-I15.

### F2-I15 — Минимальный grammar exercise bank

- **Статус:** `planned`.
- **Цель:** создать небольшой, но полный draft-банк по всем 80 элементам.
- **Вход:** F2-I14 `done`; CP-6 решения применены.
- **Ветка:** `codex/f2-i15-grammar-exercises`.
- **Задачи:** минимум 160 exercises: по одному recognition (`single-choice`) и application (`fill-blank` либо короткий free-response) на grammar logical ID; link secondary topics; explanations; accepted variants; provenance; difficulty easy/medium.
- **Authoring:** использовать пользовательские тексты/примеры; новое предложение допускается только короткое и маркируется `manual-derived`; конфликтные правила остаются draft и не считаются approved coverage до review.
- **Файлы:** `exercises-grammar.json`, provenance, coverage/ambiguity tests.
- **Тесты:** 2+ per topic; no duplicate prompt+answer; valid target rule; answer not embedded in prompt; accepted answer normalization; distractor same grammatical class; public mapper leak test.
- **Ручная проверка:** пройти случайную выборку и все exercises спорных usage keys; полный язык проверяется F2-I22.
- **Не делать:** не расширять больше минимального банка; не использовать AI; не ставить approved автоматически.
- **DoD:** structural coverage 80/80, статусы draft/reviewed согласно фактической проверке.
- **Коммит:** `feat: add baseline grammar exercise bank`.
- **Следующий шаг:** F2-I16.

### F2-I16 — Минимальный vocabulary exercise bank

- **Статус:** `planned`.
- **Цель:** дать практику слов в обоих направлениях для каждой темы.
- **Вход:** F2-I15 `done`.
- **Ветка:** `codex/f2-i16-vocabulary-exercises`.
- **Задачи:** выбрать минимум 12 reviewed senses на unit; минимум 4 exercises на unit; Korean→Russian meaning choice, Russian→Korean single/free response и matching в совокупности банка; source/entry links; безопасные same-POS distractors.
- **Омонимы:** prompt обязан давать контекст либо проверять конкретный sense; broad translation имеет accepted variants/review note.
- **Файлы:** dictionary statuses/links, `exercises-vocabulary.json`, provenance, coverage tests.
- **Тесты:** 12 senses/4 exercises per unit; target link present; distractor not synonym/duplicate; both directions per unit bank; no `добавлено`; no draft target in reviewed exercise.
- **Ручная проверка:** все омонимы и 20 случайных distractor sets.
- **Не делать:** не создавать 1 600 механических карточек; не считать transliteration правильным корейским ответом; не внедрять новую SRS.
- **DoD:** каждый unit имеет маленькую проверяемую словарную тренировку.
- **Коммит:** `feat: add baseline vocabulary exercise bank`.
- **Следующий шаг:** F2-I17.

### F2-I17 — Минимальный reading exercise bank

- **Статус:** `planned`.
- **Цель:** дать каждой теме хотя бы один текст и три проверяемых вопроса.
- **Вход:** F2-I16 `done`.
- **Ветка:** `codex/f2-i17-reading-exercises`.
- **Задачи:** выбрать/собрать 16 canonical passages из reconciled corpus; минимум 3 questions per unit; типы: main idea/content equality/fill либо order через single-choice; explanations с отсылкой к конкретному фрагменту; passage snapshots/version.
- **Источники:** при наличии конфликтов использовать только CP-6-approved variant; остальные 100 imported questions остаются draft.
- **Файлы:** reading passage statuses, `exercises-reading.json`, provenance, coverage tests.
- **Тесты:** 1 passage/3 questions per unit; passage/question version match; correct option supported by passage; no answer marker replacement; public DTO hides answer.
- **Ручная проверка:** прочитать все 16 passages и 48+ questions; проверить перенос строк и длину на 320/768/1440.
- **Не делать:** не называть текст аудированием; не создавать перевод, если его нет/он не проверен.
- **DoD:** reading coverage 16/16 структурно готов и проходит renderer/evaluator.
- **Коммит:** `feat: add baseline reading exercise bank`.
- **Следующий шаг:** F2-I18.

### F2-I18 — Создание и возобновление отфильтрованных сессий

- **Статус:** `planned`.
- **Цель:** связать setup с реальной guest/cloud session без hardcoded demo ID.
- **Вход:** F2-I17 `done`.
- **Ветка:** `codex/f2-i18-filtered-training-sessions`.
- **Задачи:** расширить create-session schema/API/application service filters; server selects only approved exercises by skill/unit/topic/difficulty; deterministic queue/seed; requested size clamp; guest local session; auth cloud session; resume/import; no duplicate active session; invalid/insufficient content errors.
- **Совместимость:** старый demo route остаётся только для migration/e2e до финала; existing persisted schema получает versioned migration/fallback.
- **Файлы:** training API schemas/routes/repositories/session store/setup integration/tests/e2e.
- **Тесты:** every skill; every filter; no cross-skill exercise; deterministic queue; idempotency; refresh/resume; guest→account import; two tabs; 0/1/fewer-than-requested content; stale content version.
- **Performance:** create request один roundtrip; повторный переход на training/setup не показывает loader после прогрева; session page fetches queue once.
- **Не делать:** не менять scoring/review formula; не смешивать draft exercises для заполнения размера.
- **DoD:** пользователь запускает, возобновляет и завершает session каждого skill.
- **Коммит:** `feat: create filtered learning sessions`.
- **Следующий шаг:** F2-I19.

### F2-I19 — Review queue и прогресс по навыкам

- **Статус:** `planned`.
- **Цель:** сделать ошибки и статистику осмысленными для новой программы.
- **Вход:** F2-I18 `done`.
- **Ветка:** `codex/f2-i19-skill-progress-review`.
- **Задачи:** concept key включает skill + target logical ID; update `user_skill_progress`; grammar topic progress сохраняется; module aggregates; progress UI sections by skill/theme; review filters skill/unit; legacy rows mapped safely.
- **Atomicity:** attempt, mistake event, review queue и progress меняются одной trusted transaction/RPC; retry idempotent.
- **Файлы:** migrations/RPC, progress/review domain/repositories/components/pages/tests.
- **Тесты:** correct/incorrect per skill; queue dedupe; review reschedule; progress counts; legacy sample; two users; concurrent duplicate submit; RLS.
- **UI:** empty states конкретны; progress bars отображают фактическое выполнение/accuracy и имеют корректные aria values; карточки не прыгают от длины labels.
- **Не делать:** не внедрять новый интервальный алгоритм; не объединять разные senses/rules одним concept key.
- **DoD:** controlled session produces explainable module/topic/skill progress and targeted review.
- **Коммит:** `feat: track skill progress and review`.
- **Следующий шаг:** F2-I20.

### F2-I20 — Responsive, keyboard и accessibility gate; CP-7

- **Статус:** `planned`.
- **Цель:** проверить все новые экраны и виды упражнений как единый пользовательский путь.
- **Вход:** F2-I19 `done`.
- **Ветка:** `codex/f2-i20-responsive-accessibility`.
- **Задачи:** полный UI inventory из mandatory conditions; каталоги, details, dictionary, setup, three sessions, result, review, progress; focus/order/Enter/Escape/Arrow; semantic headings/lang/live feedback; 200% zoom; reduced motion; no overflow; no layout jump.
- **Плавный sweep:** automated screenshots/geometry assertions от 320 до 2560 и обратно с шагом не более 6 px для ключевых pages; фиксированные checkpoints дополняют sweep, а не заменяют.
- **Progress bar:** проверка до/после ответа на mobile/tablet/desktop/ultrawide; width, value/max, accessible label.
- **Формы:** one-line Enter submits only valid unanswered exercise; textarea Enter newline; answered field Enter не вызывает Next; custom pickers fully keyboard-operable.
- **Тесты:** component a11y behavior; Playwright keyboard/touch/geometry; repeat navigation; screenshots только для стабильных representative states; no CSS-class-only pseudo tests.
- **Ручная проверка:** 320/375/768/1024/1440/2560; Chrome/Safari при доступности; длинный Korean/Russian content.
- **CP-7:** показать пользователю все три skill flows и оба catalog views; остановиться.
- **Не делать:** не менять содержание ради layout кроме явной ошибки; не начинать language approval.
- **DoD:** CP-7 принят, либо точные UI defects записаны и исправлены F2-FIX до продолжения.
- **Коммит:** `fix: stabilize curriculum learning experience`.
- **Следующий шаг:** после CP-7 — F2-I21.

### F2-I21 — Автоматический content/repository/security gate

- **Статус:** `planned`.
- **Цель:** перед ручным language review исключить структурные, технические и security-дефекты.
- **Вход:** F2-I20 `done`, CP-7 принят.
- **Ветка:** `codex/f2-i21-phase-two-quality-gate`.
- **Задачи:** coverage tests минимума; all rule/exercise branch tests; DB reset/upgrade; RLS matrix; DTO leak scan; bundle budgets; performance smoke; source/private path/secret scan; production build; CI workflow update.
- **Обязательный полный gate:** format check, lint, typecheck, unit/component, content, integration, DB, RLS, E2E, build, bundle, perf smoke.
- **Повторяемость:** полный gate минимум два последовательных раза; flaky failure исследуется, а не rerun-until-green.
- **Отчёт:** counts approved/reviewed/draft/conflicts, durations, bundle deltas, known nonblocking issues.
- **Не делать:** не менять status контента; не деплоить remote; не скрывать unreviewed coverage.
- **DoD:** нет P0/P1 технических дефектов; quality report готов для language review.
- **Коммит:** `test: enforce phase two release quality`.
- **Следующий шаг:** F2-I22.

### F2-I22 — Ручная языковая проверка и CP-8

- **Статус:** `planned`.
- **Цель:** разрешить публикацию только фактически проверенного минимума.
- **Вход:** F2-I21 `done`; пользователь/назначенный проверяющий доступен.
- **Ветка:** `codex/f2-i22-language-review`.
- **Задачи:** review checklist для 16 units, 80 grammar metadata, minimum vocabulary senses, 16 passages и minimum exercises; записать decision/note/reviewer/version; исправление содержания создаёт новую content version и повторную проверку затронутых tests.
- **Спорные пункты:** `-아/어서`, `쭉/쪽`, тексты с пропусками, `-(으)러`, `-(으)십시오`, омонимы и широкие переводы проверяются явно.
- **Status transition:** `draft/needs_review → reviewed → approved`; bulk SQL без individual manifest decisions запрещён.
- **Тесты:** content validate/coverage после каждого batch; затем полный gate затронутого слоя и финальный content gate.
- **CP-8:** пользователь подтверждает опубликованный минимум. Непроверенный остаток остаётся draft и не блокирует, если minimum coverage выполнен.
- **Не делать:** не публиковать «на доверии к Cursor»; не требовать approval всего 803/1 075-word массива; не добавлять новый контент.
- **DoD:** CP-8 принят, minimum coverage approved, review history полна.
- **Коммит:** `chore: approve baseline level one content`.
- **Следующий шаг:** F2-I23.

### F2-I23 — Preview stabilization, CP-9 и release

- **Статус:** `planned`.
- **Цель:** выпустить фазу 2 без sample UI и с проверенной production-like работой.
- **Вход:** F2-I22 `done`, CP-8 принят.
- **Ветка:** `codex/f2-i23-release-stabilization`.
- **Задачи:** применить migrations/import к согласованному remote проекту; проверить env; preview deploy; archive `sample-module` только после подтверждённого нового published content; удалить hardcoded demo UI/compat route, если больше не нужен; smoke guest/auth; logs/performance; rollback rehearsal; финальные docs.
- **Preview:** `/`, `/topics?view=themes`, `/topics?view=grammar`, representative details, `/training`, all three sessions, `/dictionary`, `/review`, `/progress`, auth callback, 404/error.
- **Тесты:** полный gate локально и CI; remote schema smoke; RLS two-user; Playwright preview where protection permits; repeat navigation has no visible loader after warm cache.
- **Rollback:** content status rollback/version switch прежде destructive delete; migration rollback не импровизировать; sample archive reversible status change.
- **CP-9:** пользователь проверяет preview и явно разрешает release/tag.
- **Не делать:** не включать LLM/voice; не удалять draft bank; не обходить Vercel protection/security.
- **DoD:** CP-9 принят; merge в `main`; green main CI; tag/release `v0.1.0`; post-release smoke; нет P0/P1.
- **Коммит:** `chore: release level one learning curriculum`.
- **Следующий шаг:** отдельное планирование фазы 3.

## 11. Тестовая матрица фазы 2

| Область               | Unit/component                | Integration/DB             | E2E/manual                       |
| --------------------- | ----------------------------- | -------------------------- | -------------------------------- |
| Canonical schemas     | valid/invalid, refs, statuses | importer counts/rollback   | audit report inspection          |
| Source reconciliation | 93/92/90, conflicts, hashes   | seed provenance            | ручная выборка конфликтов        |
| Curriculum            | 16/80/order/links             | published queries/RLS      | оба catalog views                |
| Dictionary            | senses/homonyms/categories    | junction/filter/pagination | mobile filters, long meanings    |
| Reading               | passage markers/options       | passage-version mapping    | 16 representative passages       |
| Single choice         | checker/shuffle/leak          | API submit/snapshot        | keyboard/touch/feedback          |
| Session filters       | DTO/selection                 | guest/cloud/idempotency    | each skill start/resume/complete |
| Progress/review       | concept keys/accuracy         | atomic RPC/two users       | mistake→review→progress          |
| Caching/performance   | cache key/retry               | query count/no N+1         | repeat navigation/no loader      |
| Responsive/a11y       | roles/focus/Enter             | —                          | 320–2560 sweep, 200% zoom        |
| Security              | mapper omission               | RLS/service role           | source/private data absent       |

## 12. Команды обязательного финального gate

Исполнитель использует фактические scripts из `package.json`; ожидаемый набор:

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:run
pnpm test:content
pnpm test:integration
pnpm test:db
pnpm test:rls
pnpm test:e2e
pnpm build
pnpm check:bundles
pnpm perf:smoke
```

Если команда переименована обоснованной более ранней итерацией, документ обновляется тогда же. Пропустить отсутствующую инфраструктуру после F2-I21 нельзя.

## 13. Definition of Done фазы 2

Фаза 2 завершена только когда:

- 16 тем и 80 грамматических элементов доступны из единого каталога;
- каталоги «По темам» и «По грамматике» используют одни данные;
- грамматика, слова и чтение запускаются как guest и auth sessions;
- выполнен approved minimum coverage раздела 3.2;
- две расшифровки объединены без потерянных source records;
- unreviewed content исключён из публичных упражнений;
- sample UI/archive не мешает реальной программе;
- progress/review различают skill и target concept;
- repeated navigation не показывает loader после прогрева и не вызывает N+1;
- UI проверен плавным responsive sweep, клавиатурой, touch и zoom 200%;
- RLS, answer secrecy, idempotency и two-user isolation доказаны тестами;
- полный gate и main CI зелёные;
- CP-6, CP-7, CP-8 и CP-9 приняты;
- `v0.1.0` создан только после CP-9.

## 14. Что должно перейти в фазу 3

После релиза отдельно обсуждаются:

1. большой масштабируемый банк упражнений и его review workflow;
2. СГ/сочинения: темы, 원고지, черновики, rubric и LLM feedback;
3. голос: запись, Storage, ASR, транскрипция, произношение;
4. аудирование при наличии аудиоматериалов;
5. персональный импорт ошибок из `test-01.md`;
6. расширенный spaced repetition;
7. authoring/reviewer UI.

Ни один из этих пунктов не должен «случайно» попасть в phase-2 merge.
