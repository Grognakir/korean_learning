# Исполнимый план завершения фазы 1

Последнее обновление: 2026-08-08

## 1. Назначение документа

Этот документ предназначен для Claude, Cursor или другого coding-agent, который должен завершить фазу 1 проекта Korean Learning без повторной реализации сделанного, без преждевременного перехода к следующей итерации и без расширения MVP.

Документ является пошаговой инженерной инструкцией для F1-I15–F1-I33. Общая продуктовая и архитектурная основа остаётся в `docs/APPLICATION_PLAN.md`. При расхождении приоритет такой:

1. `AGENTS.md` в корне проекта и вложенные `AGENTS.md`.
2. `docs/ITERATION_MANDATORY_CONDITIONS.md` (обязательный preflight перед каждой итерацией).
3. Этот документ.
4. `docs/APPLICATION_PLAN.md`.
5. Фактические публичные контракты текущего кода.

Если фактический код не соответствует зафиксированной исходной точке, исполнитель обязан остановиться, описать расхождение и не «чинить по пути» несвязанный scope.

## 2. Исходная точка: ничего из этого не переделывать

- Рабочая ветка на момент составления: `feature/local-exercise-repository`.
- Базовый коммит: `711b30f` (`feat: add local exercise repository`).
- Завершены F1-I01–F1-I14.
- Текущий baseline: 73/73 теста, ESLint, Prettier, TypeScript и production build проходят.
- Зафиксированы Node.js `24.18.0` и pnpm `10.34.5`.
- Уже существуют:
  - `LearningModuleDefinition`, `LearningTopicDefinition`, Zod-схемы и `ModuleRegistry`;
  - дискриминированный union семи типов `Exercise`;
  - `exerciseDefinitionSchema`;
  - 14 sample-упражнений, по два каждого типа;
  - `ExerciseRepository` и `LocalExerciseRepository`;
  - реальные страницы `/topics`, `/topics/sample-module` и счётчик заданий на `/training`;
  - базовые UI/feedback-компоненты, wrappers, desktop/mobile navigation и адаптивная оболочка.
- `src/modules/sample/*` — временный локальный источник фазы 1, а не финальный контент 높임말.
- OpenAI, подписки, аудио, голос, админка, сложная геймификация и полноценный spaced repetition не входят в фазу 1.

Запрещено начинать работу с F1-I12–F1-I14, переименовывать уже опубликованные типы без доказанной несовместимости или переносить текущие sample-данные в другую архитектуру «для красоты».

## 3. Цели и не-цели оставшейся фазы

### Цели

- Дать гостю полностью пройти, возобновить и завершить локальную тренировку, увидеть результат и повторить ошибки.
- Проверить общий UI на небольшом draft-срезе 높임말, не выдавая его за утверждённый контент.
- Добавить предсказуемые loading/error/empty/not-found состояния и полный автоматизированный local quality gate.
- Развернуть preview, подключить Supabase, реализовать RLS и magic-link/OTP авторизацию.
- Перенести production-путь чтения контента и сохранения попыток в Supabase.
- Добавить объяснимый прогресс и простую очередь повторения ошибок.
- Завершить фазу 1 только после полного security/quality/data review и CP-5.

### Не-цели

- Не реализовывать полноценный контент модуля 높임말: это фаза 2.
- Не добавлять OpenAI или другую недетерминированную проверку ответов.
- Не добавлять password login, OAuth, платёжные функции или социальные механики.
- Не создавать сложный SM-2/FSRS алгоритм: в фазе 1 применяется фиксированная простая политика интервалов.
- Не создавать Storage bucket, background workers, микросервисы или отдельную админ-панель.
- Не делать production deployment: F1-I24 — только preview.

## 4. Обязательный протокол выполнения

### 4.1. Одна итерация за раз

Перед стартом любой итерации исполнитель обязан прочитать `docs/ITERATION_MANDATORY_CONDITIONS.md` и выполнить её чеклист §1.

Для каждой итерации исполнитель обязан:

1. Проверить, что предыдущая итерация имеет статус `done` и её коммит присутствует в текущей истории.
2. Создать указанную ветку от коммита предыдущей итерации.
3. Прочитать актуальные локальные руководства Next.js в `node_modules/next/dist/docs/` для затрагиваемых API.
4. Для Vercel, Supabase, Playwright и других изменяемых интеграций сверить только официальную актуальную документацию перед кодом.
5. Реализовать только scope текущей карточки.
6. Добавить заявленные тесты одновременно с кодом.
7. Выполнить автоматические и ручные проверки текущей карточки.
8. Проверить `git diff`, отсутствие секретов и случайных файлов.
9. Обновить текущий статус в `docs/APPLICATION_PLAN.md` и полностью перезаписать `.Codex/sessions/current.md`.
10. Создать один содержательный коммит с указанным сообщением.
11. Не создавать ветку следующей итерации и не начинать следующий код в том же шаге.

Если проверка обнаружила дефект предыдущего слоя, нужно создать отдельную корректирующую итерацию `fix/*`, завершить её и только затем вернуться к последовательности. Нельзя маскировать системное исправление внутри следующей feature-итерации.

### 4.2. Документация и рабочее дерево

- Все проектные документы создаются только в `docs/`.
- Исключение: обязательный session snapshot остаётся в `.Codex/sessions/current.md`.
- Не создавать README, ADR, отчёты или changelog, если они прямо не перечислены в текущей итерации.
- Не возвращать документы из `docs/` в корень.
- Не удалять и не включать в коммит несвязанные пользовательские изменения.

### 4.3. Архитектурные запреты

- `app → features/modules/components/wrappers → lib/types`; обратные зависимости запрещены.
- Общий training engine не импортирует `src/modules/honorifics`.
- React-компоненты не содержат правил оценки, подсчёта прогресса или грамматики.
- Server Components остаются стандартом; Client Components создаются только для состояния, событий, hooks и browser API.
- DB rows не передаются напрямую в UI. Между БД и domain DTO всегда есть mapper и Zod-валидация.
- Правильные ответы и `is_correct` не попадают в публичный DTO до submit.
- Service-role key не импортируется в браузерный граф и не используется там, где достаточно authenticated Supabase client + RLS.
- Все timestamps в domain/session/storage — ISO-строки, не `Date`; состояние обязано сериализоваться JSON.
- Случайность в тестируемом domain-коде всегда задаётся seed или инъецируемой функцией.
- Любая внешняя запись, deploy, создание проекта, миграция удалённой БД, push или merge выполняются только в разрешённой контрольной точке и по правилам раздела 4.6.

### 4.4. Минимальные проверки каждой кодовой итерации

На закреплённых версиях Node.js/pnpm выполнить:

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

После появления соответствующих наборов дополнительно обязательны:

```text
pnpm test:integration
pnpm test:e2e
pnpm test:db
pnpm test:rls
```

Нельзя удалять или ослаблять существующий тест только ради зелёного запуска. Изменение ожидания допустимо лишь при подтверждённом изменении пользовательского поведения текущей итерации.

#### Политика версий runtime

- Local development и GitHub Actions используют точные Node.js `24.18.0` из `.nvmrc` и pnpm `10.34.5` из `packageManager`/CI setup.
- Vercel использует актуальную поддерживаемую patch/minor-версию Node `24.x`: платформа не гарантирует точный patch. Фактическая версия обязана удовлетворять `package.json#engines.node` (`>=24.18.0 <25`) и фиксируется в отчёте deployment через build log/`node -v`.
- pnpm на Vercel остаётся точным `10.34.5` через `packageManager`; install log должен подтвердить версию.
- Если точный local/CI runtime больше нельзя получить, запрещён молчаливый fallback. Остановиться, отдельно согласовать новый pin, синхронно обновить `.nvmrc`, `package.json`, CI и этот план, затем повторить полный baseline gate.

### 4.5. Порядок работы внутри итерации

Внутри каждой карточки соблюдать один порядок:

1. Убедиться, что рабочее дерево не содержит пересекающихся несвязанных изменений; чужие изменения не трогать.
2. Запустить baseline checks и записать исходные totals. Если baseline красный, текущую feature-реализацию не начинать: сначала локализовать причину и сообщить о ней.
3. Прочитать перечисленные контракты, ближайшие tests и релевантные официальные руководства.
4. Добавить новый тест, который воспроизводит требуемое поведение или границу, и подтвердить, что он падает по ожидаемой причине.
5. Реализовать минимальный код, необходимый для зелёного targeted test; не рефакторить соседние области без доказанной необходимости.
6. Запустить все targeted tests текущего слоя, затем полный набор проверок раздела 4.4.
7. Выполнить ручную проверку карточки и проверить browser console/network там, где есть UI.
8. Просмотреть итоговый diff, выполнить secret scan, обновить два status-документа и создать один коммит.
9. Отправить отчёт по формату раздела 28 и остановиться.

Если новый тест не может быть сначала красным, потому что он только фиксирует уже существующий contract, в отчёте отдельно указать это и объяснить, какую регрессию он предотвращает.

### 4.6. Локальные проверки и внешний CI

- Каждая итерация F1-I15–F1-I33 полностью проверяется локально по разделам 4.4–4.5 до коммита.
- Промежуточные iteration branches не пушить и отдельные PR для каждой итерации не открывать. Единственное исключение — `chore/vercel-preview`: её push разрешён только после CP-3 и используется для Vercel preview, но не добавляется в CI `push.branches`.
- В F1-I21 расширить `push.branches` текущего workflow ровно тремя значениями: `main`, `chore/framework-quality-gate`, `chore/framework-stabilization`. Сохранить `pull_request` в `main` и `workflow_dispatch`; другие рабочие ветки в `push` не добавлять.
- После локального F1-I23 запросить разрешение на push ветки `chore/framework-quality-gate`. CP-2 считается технически готовой только после зелёного внешнего CI с checks, integration и E2E и последующего принятия пользователем.
- После локального F1-I33 запросить разрешение на push ветки `chore/framework-stabilization`. CP-5 считается технически готовой только после зелёного внешнего CI со всеми появившимися checks, integration, E2E, DB и RLS jobs и последующего принятия пользователем.
- `workflow_dispatch` запускать только по отдельной явной команде пользователя. PR в `main` продолжает запускать CI, если пользователь отдельно распорядится открыть PR, но PR не является обязательным шагом каждой итерации.
- Push, открытие/закрытие PR и merge не следуют автоматически из зелёных локальных тестов. Merge никогда не выполнять без отдельного явного указания.

## 5. Карта последовательности и жёсткие остановки

| Блок                    | Итерации      | Результат                                                | Остановка                                                          |
| ----------------------- | ------------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| Локальное ядро          | F1-I15–F1-I17 | Проверка, session engine, интерактивная тренировка       | Нет                                                                |
| Ранний контентный срез  | F1-I17A       | Draft 높임말 на общем UI                                 | Обязательный CP-1A                                                 |
| Локальный learning loop | F1-I18–F1-I23 | Resume, результат, states, integration/e2e, quality gate | Обязательный CP-2                                                  |
| Preview                 | F1-I24        | Проверенный Vercel preview                               | До начала нужен CP-3                                               |
| Облачный фундамент      | F1-I25–F1-I29 | Supabase, schema, RLS, auth, DB content                  | До начала F1-I25 нужен CP-4                                        |
| Пользовательские данные | F1-I30–F1-I32 | Attempts, progress, review                               | Нет дополнительных внешних разрешений в уже согласованных проектах |
| Стабилизация            | F1-I33        | Готовый каркас                                           | Обязательный CP-5                                                  |

Если CP не подтверждён, исполнитель ставит статус `blocked`, фиксирует конкретный требуемый ответ и не выполняет следующую итерацию.

## 6. F1-I15 — Детерминированная проверка ответов

### Результат

Чистое, неизменяемое и исчерпывающее ядро оценки всех семи текущих типов `Exercise`, не зависящее от React, repository implementation, Supabase или OpenAI.

### Ветка и коммит

- Ветка: `feature/answer-evaluation`.
- Коммит: `feat: add deterministic answer evaluation`.

### Создать и изменить

- `src/features/training/domain/evaluation/types.ts`
- `src/features/training/domain/evaluation/normalizeAnswer.ts`
- `src/features/training/domain/evaluation/checkers/choiceChecker.ts`
- `src/features/training/domain/evaluation/checkers/freeResponseChecker.ts`
- `src/features/training/domain/evaluation/checkers/fillBlankChecker.ts`
- `src/features/training/domain/evaluation/checkers/matchingChecker.ts`
- `src/features/training/domain/evaluation/CheckerRegistry.ts`
- `src/features/training/domain/evaluation/index.ts`
- ближайшие `*.test.ts`
- public exports в `src/features/training/domain/index.ts` и `src/features/training/index.ts`

Не перемещать существующий `exercise.ts` и не менять shape упражнений. Если evaluator нельзя реализовать поверх текущего union, остановиться и показать конкретный несовместимый пример до изменения контракта.

### Контракты

Создать дискриминированный `AnswerSubmission`:

- choice-типы: `exerciseId`, `type`, `optionId`;
- `free-response`: `exerciseId`, `type`, `answer`;
- `fill-blank`: `exerciseId`, `type`, массив `{ blankId, answer }`;
- matching-типы: `exerciseId`, `type`, массив `{ leftPairId, rightPairId }`.

Создать `AnswerEvaluation`:

- `exerciseId`, `type`;
- `isCorrect`;
- `score`, `maxScore`, `scoreRatio` в диапазоне `0..1`;
- `reasonCode`: `correct | incorrect | partially-correct | empty-answer | invalid-submission | unknown-reference`;
- нормализованный snapshot submission;
- item-level results для fill/matching;
- canonical correct-answer snapshot, предназначенный только для feedback после submit;
- `explanation` из упражнения.

Evaluation не мутирует exercise, submission или вложенные массивы. Не использовать классы с внутренним состоянием для результата.

### Правила проверки

- Choice: `optionId` обязан существовать; совпадение с `correctOptionId` даёт полный балл.
- Free response: сравнение с каждым `AcceptedAnswer`; ровно authored accepted variants, без догадок.
- Fill blank: каждый authored blank присутствует ровно один раз; неизвестные/дублированные blank id делают submission невалидным.
- Matching: каждый left/right id используется ровно один раз; порядок submission не влияет; правильная пара имеет одинаковый pair id.
- Partial credit разрешён только когда `exercise.scoring.partialCredit === true`; иначе любой неполный ответ даёт `0`.
- Базовая нормализация: Unicode NFC, `trim`, схлопывание последовательностей пробельных символов. Сравнение остаётся чувствительным к буквам, пунктуации, морфологии и значимым корейским пробелам.
- Не удалять частицы, окончания, знаки препинания и не добавлять fuzzy matching.
- Специфичная корейская нормализация остаётся фазе 2.

### Тесты

Добавить table-driven тесты:

- correct/incorrect для каждого из семи типов;
- неизвестный option/blank/pair id;
- пустой free response и пустой fill answer;
- reordered matching;
- duplicate left/right matching refs;
- полный, частичный и нулевой score;
- `partialCredit=false` при частично правильном matching/fill;
- whitespace и NFC;
- несколько accepted answers и ровно один canonical output;
- несовпадение `exerciseId`/`type` submission с exercise;
- checker отсутствует в registry;
- исходные exercise/submission остаются глубоко равны snapshot до вызова.

Прогнать evaluator против всех 14 `sampleExercises`; каждый тип должен вернуть ожидаемый reason code для заранее заданного правильного и неправильного submission.

### Не делать

- Не создавать session state, reducer, React hooks или UI.
- Не сохранять попытки.
- Не добавлять AI/fuzzy evaluation.
- Не менять sample-контент ради упрощения checker, кроме доказанной ошибки схемы с отдельным тестом.

### Готово, когда

- Registry исчерпывающе обслуживает семь типов.
- Все sample-упражнения оцениваются.
- Нет мутаций, недетерминированности или React/Supabase imports.
- Общие и новые тесты зелёные.

## 7. F1-I16 — Движок тренировочной сессии

### Результат

Чистая сериализуемая state machine, управляющая очередью упражнений, attempts, переходами и завершением сессии вне React.

### Ветка и коммит

- Ветка: `feature/training-session-engine`.
- Коммит: `feat: add training session engine`.

### Создать и изменить

- `src/features/training/domain/session/types.ts`
- `src/features/training/domain/session/createTrainingSession.ts`
- `src/features/training/domain/session/trainingSessionReducer.ts`
- `src/features/training/domain/session/selectors.ts`
- `src/features/training/domain/session/seededShuffle.ts`
- `src/features/training/domain/session/errors.ts`
- `src/features/training/domain/session/index.ts`
- ближайшие unit-тесты и public exports

### Контракты состояния

`TrainingSessionConfig` содержит:

- заранее предоставленные `sessionId`, `moduleSlug`, `mode`, `seed`;
- `exerciseIds` и необязательный `limit`;
- ISO `startedAt` от инъецированного clock;
- `contentVersion`/версионный snapshot, достаточный для последующей проверки совместимости.

`TrainingSessionState` содержит только JSON-safe данные:

- `schemaVersion`;
- `status: active | completed | abandoned`;
- неизменяемую очередь exercise id;
- `currentIndex`;
- список attempt snapshots с `submissionId`, submission, evaluation и ISO timestamp;
- `startedAt`, `lastActivityAt`, `completedAt | null`;
- score и max score в state не хранить: selectors каждый раз выводят их из immutable attempts и scoring metadata.

### Переходы

- `create`: проверяет непустую очередь, уникальные exercise id, limit и seed; применяет один deterministic shuffle.
- `submit`: разрешён только для текущего упражнения в `active`; вызывает evaluator и сохраняет один attempt.
- Повторный `submissionId` возвращает прежнее состояние без второго attempt.
- Второй новый submit для уже отвеченного current exercise отклоняется безопасным domain error.
- `next`: разрешён только после submit текущего упражнения.
- Последний `next` переводит сессию в `completed` и один раз задаёт `completedAt`.
- `abandon`: разрешён из `active`, не превращает сессию в completed.
- Любые submit/next после `completed|abandoned` отклоняются.

Использовать небольшой reducer или набор чистых functions; не смешивать orchestration и selectors. Для shuffle реализовать маленький локальный seed PRNG, не добавлять библиотеку случайности.

### Тесты

- создание с 0, 1 и несколькими заданиями;
- deterministic queue для одинакового seed и различие для другого seed;
- limit меньше/равен/больше размера входа;
- submit correct/incorrect и score update;
- submit не текущего exercise;
- duplicate `submissionId`;
- второй submit текущего шага;
- next до submit;
- completion на последнем элементе;
- abandon и запрещённые последующие transitions;
- timestamps через fake clock;
- JSON stringify/parse roundtrip состояния;
- selectors: current exercise, progress, mistakes, result summary;
- исходное состояние не мутируется.

### Не делать

- Не использовать React, localStorage, URL router или Supabase.
- Не генерировать UUID/время внутри чистого reducer: значения передаются снаружи.
- Не строить экран результата — только result selectors.

### Готово, когда

- Скриптовый сценарий create→submit→next→complete проходит на sample repository.
- Все illegal transitions имеют стабильные error codes.
- Состояние полностью сериализуемо и детерминировано.

## 8. F1-I17 — Интерактивный экран тренировки

### Результат

Пользователь может пройти тренировку на локальном sample repository всеми семью типами, используя клавиатуру, мышь или touch.

### Ветка и коммит

- Ветка: `feature/training-interface`.
- Коммит: `feat: build training session interface`.

### Создать и изменить

- `src/features/training/components/TrainingSession/*`
- `src/features/training/components/ExerciseRenderer/*`
- `src/features/training/components/ChoiceExercise/*`
- `src/features/training/components/TextAnswerExercise/*`
- `src/features/training/components/FillBlankExercise/*`
- `src/features/training/components/MatchingExercise/*`
- `src/features/training/components/ExerciseFeedback/*`
- `src/features/training/hooks/useTrainingSession.ts`
- `src/features/training/presentation/toExerciseView.ts`
- `src/app/training/page.tsx`
- `src/app/training/[sessionId]/page.tsx`
- CSS Modules, tests и public exports

### Реализация

- `/training` показывает доступный sample-модуль, количество заданий и одно ясное действие запуска.
- До появления persistence использовать стабильный локальный маршрут `/training/demo-session`; не создавать фиктивную server storage.
- Server page получает упражнения через repository composition и передаёт Client boundary только данные текущей локальной сессии.
- `ExerciseRenderer` использует исчерпывающий registry по `exercise.type`; default fallback считается ошибкой конфигурации, а не пустым экраном.
- Choice: `fieldset` + radio, label кликабельны, один выбор.
- Free response: контролируемый input/textarea, `lang` и подходящий `inputMode`; пустой submit заблокирован.
- Fill blank: отдельный подписанный input для каждого blank; marker превращается в читаемую последовательность, без `contenteditable`.
- Matching: список левых элементов и обычный `<select>` для правого значения; drag-and-drop не является единственным способом.
- Submit блокируется во время обработки и после успешной отправки текущего ответа.
- Feedback появляется в `aria-live`, сообщает правильность текстом, показывает explanation и item-level ошибки после submit.
- Кнопка «Дальше» доступна только после feedback.
- Progress показывает `current/total` и семантический progressbar.
- На completion допустим только минимальный экран «Тренировка завершена» с выходом; полноценная статистика остаётся F1-I19.

В этой локальной итерации answer keys sample-набора технически находятся в client bundle. Это допустимо только для временного sample path. Не закреплять эту схему как production API; в F1-I29 вводится безопасный публичный DTO.

### Компонентные тесты

- render и submit каждого из семи renderer;
- keyboard navigation radio/select/input;
- пустой и невалидный submit;
- submit lock и отсутствие двойного attempt;
- feedback correct/incorrect/partial;
- next и progress update;
- completion полного короткого набора;
- unsupported renderer показывает безопасную ошибку;
- `lang="ko"` на корейском тексте;
- focus после перехода попадает на заголовок/область нового вопроса;
- matching выполняется без drag-and-drop.

### Ручная проверка

- 320, 375, 768 и 1280 px;
- keyboard-only;
- Korean IME;
- длинные русские и корейские строки;
- zoom 200%;
- кнопки не скачут между типами и имеют цель не меньше 44×44 px;
- console без ошибок.

### Не делать

- Не добавлять localStorage, результат с breakdown, auth или DB.
- Не создавать отдельный UI для каждого module-specific правила.
- Не начинать 높임말 content до завершения общего UI.

### Готово, когда

- Все семь типов реально проходимы.
- Session engine остаётся единственным владельцем transitions.
- Компоненты не дублируют evaluator/session business rules.

## 9. F1-I17A — Ранний vertical slice 높임말

### Результат

Небольшой draft-набор реального корейского материала проверяет пригодность общего UI. Это архитектурный preview, не релиз контента.

### Ветка и коммит

- Ветка: `feature/honorifics-early-slice`.
- Коммит: `feat: validate training with draft honorifics content`.

### Создать и изменить

- `src/modules/honorifics/domain/previewModule.ts`
- `src/modules/honorifics/data/previewExercises.ts`
- `src/modules/honorifics/validation/*` только при реальной module-specific необходимости
- ближайшие tests
- server-side composition, включающая preview только в development

### Контент и gate

- Один module со slug `honorifics`, level `1급`, status `draft`, явной пометкой preview.
- 2–3 конструкции и 8–12 заданий.
- Обязательные темы: возраст дедушки/бабушки и профессия.
- Использовать существующие семь типов только там, где prompt и ответ однозначны.
- Не ставить `reviewed`, `published` или `approved`.
- Draft подключается только когда `NODE_ENV === "development"`; production build и published registry его не возвращают.
- Не импортировать `tests/fixtures` в production code.
- Любое обнаруженное общее неудобство исправляется в общем renderer/session contract, а не обходится honorifics-компонентом.

### Тесты

- Zod validation всего preview dataset;
- уникальные module/exercise/topic ids и разрешённые refs;
- production composition не содержит `honorifics`;
- development composition содержит draft, но published selector его скрывает;
- representative integration create→answer→complete;
- production build не генерирует публичный `/topics/honorifics`.

### Ручная проверка и CP-1A

Пользователь проходит 1–2 короткие тренировки на desktop и mobile и оценивает:

- длину prompt;
- читаемость Hangul;
- баланс выбора и ввода;
- matching/fill на телефоне;
- полезность feedback;
- отсутствие ощущения, что preview-контент уже утверждён.

После автоматических проверок исполнитель обязан остановиться и запросить CP-1A. F1-I18 запрещена до явного принятия UI либо завершения отдельной fix-итерации по замечаниям.

### Не делать

- Не расширять до полного модуля высшей речи.
- Не добавлять спорные accepted variants без ручной проверки.
- Не внедрять module-specific evaluator в общее ядро скрыто.
- Не переносить preview в Supabase.

## 10. F1-I18 — Локальное сохранение незавершённой тренировки

### Результат

Гостевая active-сессия безопасно переживает refresh/закрытие вкладки и восстанавливается только при совместимой версии данных.

### Ветка и коммит

- Ветка: `feature/local-session-persistence`.
- Коммит: `feat: persist active training locally`.

### Создать и изменить

- `src/features/training/persistence/types.ts`
- `src/features/training/persistence/sessionStorageSchema.ts`
- `src/features/training/persistence/LocalTrainingSessionStore.ts`
- `src/features/training/persistence/index.ts`
- `src/features/training/hooks/usePersistedTrainingSession.ts`
- `src/features/training/components/ResumeTrainingPrompt/*`
- интеграция в `/training` и `/training/[sessionId]`
- unit/component tests

### Формат хранения

- Один namespaced key: `korean-learning:training-session:v1`.
- Payload содержит `storageVersion`, `savedAt`, `expiresAt`, `sessionState` и content/schema version snapshot.
- TTL — 7 календарных дней с момента последнего валидного transition.
- Хранить только guest session state, authored submissions и evaluations; не хранить email, auth token, cookie, секреты или полный module registry.
- Zod валидирует JSON после `JSON.parse`; любая ошибка даёт controlled `corrupt` result, а не throw в render.
- Storage adapter принимает clock и storage interface для тестов.

### Поведение

- Сохранение выполняется после успешного create/submit/next/abandon transition, не на каждый render.
- В F1-I18 completed session сохраняется без очистки. F1-I19 сначала создаёт result snapshot и только затем очищает active-session key.
- При открытии `/training` валидная active-сессия показывает prompt «Продолжить» или «Начать заново».
- «Продолжить» восстанавливает ровно текущий индекс и attempts.
- «Начать заново» сначала явно очищает старую запись.
- Expired, corrupt, wrong storage version, wrong session schema или несовместимый content version удаляются и показывают краткое безопасное сообщение.
- SSR render не читает `window`/`localStorage`; чтение начинается после hydration без изменения серверной разметки.

### Тесты

- missing key;
- valid save/load roundtrip;
- corrupt JSON;
- structurally invalid payload;
- expired boundary до/ровно/после `expiresAt`;
- storage/session/content version mismatch;
- save после transition и отсутствие save на render;
- explicit clear/restart;
- localStorage throws/quota error;
- SSR без `window`;
- hydration не создаёт React mismatch;
- completed/abandoned policy.

### Не делать

- Не сохранять историю нескольких сессий.
- Не добавлять IndexedDB, service worker или offline cache.
- Не синхронизировать guest session с аккаунтом — это F1-I30.

### Готово, когда

- Refresh возвращает гостя к текущему вопросу.
- Некорректные данные никогда не ломают страницу.
- Пользователь может явно отказаться от восстановления.

## 11. F1-I19 — Экран результата

### Результат

После completion пользователь видит объяснимый итог и может начать новую сессию либо повторить только ошибки.

### Ветка и коммит

- Ветка: `feature/training-results`.
- Коммит: `feat: add training results screen`.

### Создать и изменить

- `src/features/training/components/TrainingResult/*`
- `src/features/training/components/ScoreSummary/*`
- `src/features/training/components/MistakeSummary/*`
- `src/features/training/components/ResultActions/*`
- result selectors/snapshot schema рядом с session domain
- интеграция в `/training/[sessionId]`
- tests и CSS Modules

### Поведение

- Result snapshot строится только из completed `TrainingSessionState`.
- Показать `correct/total`, набранные/max points и округлённый процент.
- Topic breakdown использует topic metadata из registry и attempts; неизвестный topic отображается безопасным fallback, а не падает.
- Mistake list содержит prompt, ответ пользователя, canonical answer и explanation после завершения.
- Цвет не является единственным сигналом; присутствуют текст/иконка/семантика.
- «Повторить ошибки» создаёт новую локальную session queue из уникальных неверных exercise id в исходном порядке.
- Если ошибок нет, действие повтора отсутствует.
- «Новая тренировка» возвращает к `/training` и не переиспользует старый session id.
- После создания валидного result snapshot active localStorage очищается идемпотентно.
- Back/refresh completed route повторно показывает тот же snapshot, пока текущая вкладка его имеет; не создаёт второй completion.

### Тесты

- all correct, all wrong, mixed и partial credit;
- percentage/score boundaries и отсутствие деления на ноль;
- topic breakdown с несколькими темами;
- duplicate mistake attempts дают один exercise в retry queue;
- retry order deterministic;
- actions и отсутствие retry при 0 ошибок;
- local active session очищается один раз;
- back/refresh не дублируют completion;
- результат понятен без проверки CSS color.

### Не делать

- Не писать progress в Supabase.
- Не создавать глобальную review queue.
- Не добавлять achievements/streak/confetti.

### Готово, когда

- Итог математически совпадает с session attempts.
- Повтор ошибок создаёт рабочую локальную тренировку.
- Completion остаётся идемпотентным.

## 12. F1-I20 — Loading, error, not-found и empty states

### Результат

Все ожидаемые пограничные состояния дают понятный интерфейс и следующий безопасный шаг вместо белого экрана или технического сообщения.

### Ветка и коммит

- Ветка: `feature/application-states`.
- Коммит: `feat: add loading error and empty states`.

### Создать и изменить

- `src/app/loading.tsx`
- `src/app/error.tsx` как минимальный Client Component с `reset`
- `src/app/not-found.tsx`
- `src/app/topics/[moduleSlug]/loading.tsx`
- `src/app/training/[sessionId]/loading.tsx`
- `src/components/feedback/LoadingView/*`
- `src/components/feedback/RouteError/*`
- feature-specific EmptyState compositions на существующем primitive
- tests

### Обязательные состояния

- global route loading;
- безопасная неожиданная render/data ошибка с retry;
- неизвестный route/module/session id;
- пустой module registry;
- module без опубликованных topics;
- repository без exercises по выбранным filters;
- invalid/expired/corrupt local session;
- result без completed session;
- guest progress/review до облачной реализации;
- network/backend unavailable placeholder, который позднее переиспользуется Supabase path.

### Правила

- Пользовательские сообщения не содержат stack, SQL, env names, UUID внутренних сущностей или raw error.
- Error codes логируются только на сервере/в development.
- `error.tsx` не превращает весь app/layout в Client Component.
- Loading skeleton не имитирует данные, которые могут оказаться недоступны; достаточно стабильного layout без скачка.
- 404 содержит действия на главную и в каталог.
- Empty state предлагает действие только если оно реально доступно.

### Тесты

- каждый компонент имеет правильные role/heading/action;
- `reset` вызывается один раз;
- route `notFound()` для неизвестного module/session;
- empty repository/module/topics;
- invalid/expired session;
- отсутствие технических деталей;
- keyboard focus и доступность действий;
- loading/error не ломают AppShell/mobile navigation.

### Ручная проверка

Открыть неверные URL напрямую, симулировать пустой repository и thrown data error, проверить desktop/mobile и browser back.

### Не делать

- Не добавлять toast framework или внешний error monitoring.
- Не строить offline/PWA режим.

## 13. F1-I21 — Интеграционные тесты каркаса

### Результат

Repository, evaluator, session engine, persistence и feature boundaries проверяются как единый локальный сценарий без привязки к внутренним implementation details.

### Ветка и коммит

- Ветка: `test/framework-integration`.
- Коммит: `test: cover training framework integration`.

### Создать и изменить

- `tests/integration/training-lifecycle.test.ts`
- `tests/integration/module-routing.test.tsx`
- `tests/integration/session-recovery.test.tsx`
- `tests/factories/moduleFactory.ts`
- `tests/factories/exerciseFactory.ts`
- `tests/factories/sessionFactory.ts`
- дополнительные helpers с fake clock/storage/seed
- отдельный `vitest.integration.config.mts`, сохраняющий ESM-формат существующего `vitest.config.mts`
- scripts в `package.json`
- job/step в `.github/workflows/ci.yml`

### Разделение запусков

- Unit/component config исключает `tests/integration/**`.
- Integration config включает только `tests/integration/**`.
- `pnpm test:run` не выполняет integration второй раз.
- `pnpm test:integration` запускает integration suite один раз.
- Общий CI `checks` выполняет оба scripts после typecheck.
- Workflow получает checkpoint-only `push.branches` из раздела 4.6; push-триггеры других iteration branches не добавляются.

Не создавать второй setup с расходящимися globals; общий `tests/helpers/setup.ts` переиспользуется либо явно расширяется.

### Сценарии

- start→correct/incorrect answers→complete→result;
- start→submit→persist→hydrate→continue→complete;
- complete→retry mistakes→complete retry;
- contentVersion mismatch удаляет resume state;
- invalid module/exercise refs отклоняются до UI;
- no exercises даёт EmptyState;
- module route генерируется из registry;
- seeded queue повторяема;
- corrupt storage восстанавливается без падения;
- evaluator reason codes доходят до result без переинтерпретации UI.

### Критерии качества

- Тесты используют public feature exports, а не private file internals, кроме test factories.
- Нет реального времени, случайности, сети или внешних сервисов.
- Повторный последовательный запуск даёт одинаковый результат.
- Integration suite не должен дублировать все unit branches.

### Не делать

- Не устанавливать Playwright.
- Не подключать Supabase.
- Не измерять coverage threshold до появления baseline.

## 14. F1-I22 — Playwright и сквозные сценарии

### Результат

Критические пользовательские пути проходят в настоящем Chromium на desktop и mobile viewport локально и в CI для pull request.

### Ветка и коммит

- Ветка: `test/playwright-setup`.
- Коммит: `test: add Playwright end-to-end coverage`.

### Создать и изменить

- добавить exact devDependency `@playwright/test` и lockfile;
- `playwright.config.ts`;
- `tests/e2e/navigation.spec.ts`;
- `tests/e2e/training.spec.ts`;
- `tests/e2e/persistence.spec.ts`;
- `tests/e2e/errors.spec.ts`;
- scripts в `package.json`;
- Playwright artifacts в `.gitignore`;
- отдельный CI job в `.github/workflows/ci.yml`.

Перед конфигурацией сверить официальные Playwright docs и локальные Next.js testing docs текущей версии.

### Конфигурация

- Один стабильный `baseURL`, фиксированный test port, `reuseExistingServer` только локально.
- Chromium обязателен.
- Projects: desktop `1280×800`, mobile `375×812`.
- Retries: `0` локально, максимум `1` в CI.
- Trace, screenshot и video — retain/on-first-retry только при failure.
- Tests выполняются serial только там, где они используют один localStorage key; предпочтительнее изолированный browser context на test.
- Core suite не требует Vercel/Supabase/почтового сервиса.

### E2E-сценарии

- основная навигация и active states;
- каталог→sample module→training;
- полная короткая session с correct и wrong answers;
- refresh после submit и resume;
- completion и result;
- retry mistakes;
- неверный module/session URL показывает 404/state;
- keyboard-only choice/free/matching;
- mobile bottom navigation не перекрывает submit/next;
- отсутствие horizontal overflow на 320/375/768/1280 проверяется отдельным helper/assertion.

### CI

- E2E job зависит от static checks/build.
- Запускать для `pull_request` в `main`, `workflow_dispatch` и push только веток `chore/framework-quality-gate`/`chore/framework-stabilization`.
- Не запускать полный browser suite на каждый push рабочей ветки.
- Использовать concurrency cancellation.
- Upload artifacts выполняется только при failure и не содержит env/secrets.

### Не делать

- Не добавлять WebKit/Firefox до измерения стоимости и flake rate Chromium.
- Не тестировать внутренние CSS class names.
- Не использовать arbitrary sleeps; ожидать URL/role/state.

## 15. F1-I23 — Quality gate локального каркаса

### Результат

Каркас подтверждён локальным quality gate и внешним CI checkpoint-ветки перед первым deploy.

### Ветка и коммит

- Ветка: `chore/framework-quality-gate`.
- Коммит: `chore: verify application framework quality`.

### Выполнить

1. Чистая установка с frozen lockfile на Node.js 24.18.0/pnpm 10.34.5.
2. `format:check`, lint, typecheck, unit/component, integration, e2e и build.
3. Запуск production server из готового build и smoke всех маршрутов.
4. Review client boundaries: ни page/layout целиком не становится Client Component без причины.
5. Проверка console и network errors.
6. Metadata/title/description для публичных routes.
7. Keyboard-only, reduced motion, 200% zoom и viewport 320/375/768/1280.
8. Проверка focus order, live regions, fieldset/labels и targets ≥44 px.
9. Lighthouse используется как диагностика; не подгонять код под один score ценой UX или архитектуры.
10. Проверка, что draft honorifics недоступен production build.
11. После полного локального gate запросить разрешение на push `chore/framework-quality-gate`, выполнить push и дождаться внешнего CI.

### Исправления

В эту ветку входят только мелкие проблемы, непосредственно обнаруженные quality gate. Системный дефект оформляется отдельной `fix/*` итерацией с собственными тестами. Не добавлять новую функцию.

### Обязательный отчёт в статусе

Зафиксировать команды, количество test files/tests, browser matrix, URL/conclusion внешнего CI run, известные P2 и отсутствие P0/P1. Отдельный отчётный файл не создавать.

### CP-2

После зелёных локального gate и внешнего CI исполнитель останавливается и просит принять CP-2. Если push не разрешён или внешний CI не зелёный, CP-2 остаётся незавершённой. Даже при полном техническом успехе нельзя начинать F1-I24 без CP-2 и отдельного CP-3 на Vercel.

## 16. F1-I24 — Первый Vercel preview deployment

### Предусловие и жёсткий запрет

До любых вызовов Vercel, создания/связывания проекта или deploy требуется явный CP-3. Разрешение на локальный код, Git или предыдущие внешние действия не заменяет CP-3. Без него статус `blocked`, следующая итерация не начинается.

### Результат

Один preview deployment воспроизводит локальный production build; production deployment не выполняется.

### Ветка и коммит

- Ветка: `chore/vercel-preview`.
- Коммит: `chore: configure Vercel preview deployment`.

### Выполнить после CP-3

1. Проверить, существует ли Vercel project; не создавать второй проект с похожим именем.
2. Связать repository/root без коммита `.vercel/`.
3. Настроить Vercel на Node `24.x`; подтвердить в build log фактическую версию `>=24.18.0 <25`. Точный patch `24.18.0` на Vercel не требовать. Подтвердить pnpm `10.34.5` из `packageManager`.
4. Не добавлять environment variables, которые ещё не нужны.
5. После уже полученного CP-3 выполнить push `chore/vercel-preview`; связанный Vercel project создаёт preview через Git integration. Не использовать production deploy/promote.
6. Проверить build log, install с frozen lockfile и отсутствие secret warnings.
7. Выполнить smoke: `/`, `/topics`, `/topics/sample-module`, `/training`, `/training/demo-session`, result/retry path, invalid route и refresh dynamic route.
8. Проверить desktop/mobile, console и network failures.

### Файлы

- `.vercelignore` создаётся только при доказанной необходимости.
- `.env.example` в F1-I24 не менять: local content preview не требует новых переменных.
- `.vercel/`, deployment artifacts и токены не коммитятся.

### Тесты

- Локальный полный suite остаётся зелёным.
- Deployment report содержит фактические `node -v` и `pnpm -v`; Node удовлетворяет engines range, pnpm равен `10.34.5`.
- Preview smoke можно выполнить существующим Playwright config через временный `PLAYWRIGHT_BASE_URL`, не меняя default local suite.
- Не хранить preview URL жёстко в тестах.

### Не делать

- Не нажимать production deploy/promote.
- Не подключать Supabase.
- Не добавлять analytics/monitoring.
- Не менять приложение ради платформенного warning без воспроизводимого дефекта.

### Готово, когда

- Preview доступен и совпадает с локальным production behavior.
- Deployment не содержит секретов и не является production.
- Ссылка и результат smoke зафиксированы в session status, отдельный отчёт не создаётся.

## 17. F1-I25 — Supabase-проект и client foundation

### Предусловие и жёсткий запрет

Нужен CP-4: конкретный Supabase project, подтверждённые auth URL/redirect settings и разрешение на его изменение. Без CP-4 не создавать проект, не придумывать credentials и не начинать миграции.

### Результат

Приложение имеет проверяемую server/browser boundary для Supabase, но ещё не создаёт таблицы и не меняет пользовательский путь.

### Ветка и коммит

- Ветка: `feature/supabase-foundation`.
- Коммит: `feat: add Supabase client foundation`.

### Перед реализацией

- Проверить актуальные официальные Supabase SSR/Next.js docs и локальные Next.js 16 docs.
- Установить точные совместимые версии официальных packages, обычно `@supabase/supabase-js` и `@supabase/ssr`; не использовать deprecated auth helpers.
- Выбрать и закрепить официальный поддерживаемый способ Supabase CLI для local development.

### Создать и изменить

- `supabase/config.toml`
- `src/lib/validation/env.ts`
- `src/lib/supabase/browserClient.ts`
- `src/lib/supabase/serverClient.ts`
- `src/lib/supabase/index.ts`
- `.env.example`
- `.gitignore`
- package/lockfile и tests

### Env boundary

- Public URL и publishable/anon key валидируются отдельной client-safe schema.
- Server-only secrets валидируются только в server-only module.
- Использовать имена переменных из актуальной официальной документации/панели; не поддерживать одновременно legacy и current names без причины.
- `.env.example` содержит только имена и безопасные placeholders.
- Реальные `.env*`, access tokens, service-role/JWT secrets не попадают в Git, logs, tests snapshots или browser bundle.

### Client factories

- Browser factory используется только из Client Component/hook и создаёт browser client по официальному SSR pattern.
- Server factory читает/пишет cookies только через поддерживаемый Next.js API текущей версии.
- Admin/service-role factory в F1-I25 не создавать. Если он реально понадобится импортирующему server script в F1-I29, добавить там как отдельный `server-only` module без client-safe export.
- Никакой singleton с request cookies между запросами.

### Тесты

- valid/missing/malformed public env;
- server secret не входит в client schema;
- browser/server factory mocks получают ожидаемые URL/key/cookie adapter;
- import client-safe module не тянет admin module;
- build с documented public env class;
- отсутствие env показывает контролируемую server error, а не undefined behavior;
- secret-name scan по client build/репозиторию.

### Ручная проверка

Выполнить безопасный health/connectivity запрос без создания данных, проверить cookies/network/client bundle. Не логировать ключи целиком.

### Не делать

- Не создавать schema/tables — это F1-I26.
- Не реализовывать login UI — это F1-I28.
- Не создавать Storage bucket.

## 18. F1-I26 — PostgreSQL schema, migrations и seed

### Результат

Пустая локальная Supabase database полностью и повторяемо создаётся из versioned migrations и deterministic seed.

### Ветка и коммит

- Ветка: `feature/database-schema`.
- Коммит: `feat: add initial database schema`.

### Источник истины

Поля и связи берутся из раздела 13 `docs/APPLICATION_PLAN.md`. Нельзя молча упрощать таблицы, переименовывать статусы или менять cardinality. При обнаружении невозможного/противоречивого ограничения сначала обновить план отдельным решением, затем SQL и domain mapper.

### Порядок миграций

Допустимо несколько migration files внутри одной итерации, в таком порядке:

1. Extensions, общие enum/check domains, безопасные timestamp functions.
2. Content: `learning_modules`, `grammar_topics`, `dictionary_entries`, `honorific_pairs`, `exercises`, `exercise_topics`, `exercise_options`, `accepted_answers`.
3. User/training: `profiles`, `training_sessions`, normalized session queue при выбранной модели, `attempts`, `mistake_events`, `review_queue`.
4. Progress: materialized `user_topic_progress` и `user_module_progress`; способ их trusted update реализуется только в F1-I31.
5. Review/provenance: `ai_generation_requests`, `generated_exercises`, `content_reviews` без включения AI runtime.
6. Indexes, update triggers только для изменяемых таблиц и constraint helpers.

### Обязательные SQL-инварианты

- UUID primary keys и server timestamps.
- Stable `logical_id` + `content_version` для exercises.
- Unique slug/version/code/option/answer constraints из canonical data model.
- `source manual|ai` отделён от lifecycle status.
- Approved exercise требует explanation; content review consistency проверяется там, где это возможно без хрупких cross-row CHECK.
- Foreign keys имеют осознанный `restrict`, `set null` или `cascade`; каскадное удаление attempts/history запрещено.
- User history не удаляется через browser `DELETE`.
- Correct-answer поля остаются в server-only tables/views.
- Queryable filter fields не прячутся в JSONB.
- `updated_at` отсутствует на immutable history tables.

### Seed

- Dev seed детерминирован и использует стабильные UUID.
- Импортирует минимальный sample module/exercises через validated mapping, но не draft honorifics preview.
- Seed не выдаёт непроверенный 높임말 контент за published/approved.
- Повторяемость обеспечивается clean reset, а не опасным production upsert script.

### Generated types и scripts

- Сгенерировать `src/types/database.ts` официальной CLI-командой.
- Добавить scripts для local start/stop/reset/type generation и `test:db`.
- Generated types не редактировать вручную.

### DB-тесты

- clean reset применяет все migrations и seed;
- второй clean reset даёт ту же schema/data shape;
- required/not-null/check/unique constraints;
- FK behavior для content и immutable history;
- invalid status/type/version rejected;
- duplicate logical version/option/answer rejected;
- approved/published invariants;
- schema diff пуст после повторной генерации;
- seed содержит ожидаемые counts и разрешённые refs.

### CI

Добавить обязательный отдельный DB job с локальным Supabase без production credentials. Если официальный CLI нельзя стабильно запустить на runner, итерация не считается завершённой: остановиться с воспроизводимым логом, а не делать job optional.

### Не делать

- Не добавлять RLS policies — это F1-I27.
- Не импортировать production data.
- Не выполнять миграцию удалённой production database.
- Не писать destructive down migration.

## 19. F1-I27 — Row Level Security

### Результат

Deny-by-default и изоляция anon/user A/user B доказаны автоматическими тестами для каждой exposed table и операции.

### Ветка и коммит

- Ветка: `feature/database-rls`.
- Коммит: `feat: secure database with row level security`.

### Реализация

- Включить RLS на всех таблицах exposed schemas.
- Убрать случайные grants; добавлять только необходимые.
- Anon/auth read видит только `published` modules/topics и `approved` exercises.
- Public content query не раскрывает `is_correct`, accepted answers, review notes и AI logs.
- Profile/session/attempt/progress/review rows доступны только владельцу.
- Client write в content, generated content и reviews запрещён.
- Attempts/mistake/review mutations проходят только через проверенный server/RPC path; прямые browser writes запрещены.
- В F1-I27 не создавать общие `SECURITY DEFINER` helpers: ownership policies выражаются прямым сравнением с `auth.uid()`. Узкие trusted RPC из F1-I30–F1-I32 создаются в соответствующих итерациях с фиксированным `search_path` и минимальными grants.

### Матрица тестов

Для каждой применимой таблицы проверить `SELECT/INSERT/UPDATE/DELETE` как:

- anon;
- user A — owner;
- user B — чужой пользователь;
- trusted server/test admin.

Отдельно проверить:

- draft/reviewed/unpublished content скрыт;
- approved child не виден при unpublished parent module;
- user B не может читать/менять session/attempt/progress/review user A;
- spoofed `user_id` rejected;
- client не может менять immutable attempt/history;
- correct answers не доступны public view/RPC до submit;
- revoked/unpublished exercise исчезает из public query;
- helper functions не допускают search-path/argument privilege escalation.

### Файлы и CI

- Новая forward-only migration policies/grants/functions.
- SQL/integration tests в `tests/integration/supabase/*` или официальном поддерживаемом harness.
- `pnpm test:rls`.
- DB CI job выполняет access matrix после reset/seed.

### Ручная проверка

В local Supabase выполнить репрезентативные запросы каждым токеном и сверить policies через dashboard/CLI.

### Не делать

- Не полагаться на скрытый UI как security boundary.
- Не использовать service role в browser tests.
- Не начинать auth UI.

## 20. F1-I28 — Magic-link/OTP авторизация

### Результат

Пользователь может безопасно войти по email magic link/OTP, выйти, пережить refresh и получить собственный profile; гостевой режим сохраняется.

### Ветка и коммит

- Ветка: `feature/supabase-auth`.
- Коммит: `feat: add Supabase authentication`.

### Перед кодом

Сверить текущие официальные Supabase Auth SSR docs и локальные Next.js docs для cookies, redirect/callback и `proxy`/middleware convention. Не копировать шаблон старой версии.

### Создать и изменить

- `src/features/authentication/domain/*`
- `src/features/authentication/components/LoginForm/*`
- `src/features/authentication/components/UserMenu/*`
- `src/features/authentication/server/*`
- `src/app/login/page.tsx`
- callback route по текущей официальной convention
- `AuthBoundary` и Header
- `src/proxy.ts` для session refresh по актуальному Next.js/Supabase SSR pattern; старый `middleware.ts` не создавать
- tests

### Поведение

- Единственный MVP-метод: email magic link/OTP. Password/OAuth не добавлять.
- Email проходит Zod validation; submit имеет pending/success/error states и блокировку дубля.
- Redirect target принимает только внутренний allowlisted path; protocol-relative, external origin и encoded bypass отклоняются.
- Callback обменивает code/token на session, затем безопасно возвращает на `next` или `/`.
- Session cookies имеют параметры из официального SSR client; raw token не попадает в URL после callback.
- Logout очищает session и обновляет Header.
- Profile bootstrap выполняет один idempotent DB trigger на `auth.users` с `on conflict do nothing`; application server не делает второй upsert.
- Training остаётся доступной гостю; auth требуется только для cloud history/progress/review.
- Не выполнять автоматический guest→account import: показать отдельное предложение, фактический import — F1-I30.

### Тесты

- valid/invalid email;
- submit pending/double submit/provider error/success;
- safe redirect matrix;
- callback valid/missing/expired/replayed code;
- unauth/auth Header и AuthBoundary;
- refresh сохраняет session;
- logout;
- profile bootstrap повторяем;
- owner profile RLS;
- guest training не требует login;
- secrets/tokens отсутствуют в rendered errors/log snapshots.

### Ручная проверка

Local email capture или подтверждённый test inbox: sign in, expired link, refresh, logout, mobile и два разных пользователя.

### Не делать

- Не добавлять password reset, OAuth или account deletion.
- Не требовать вход для локальной sample training.
- Не синхронизировать attempts.

## 21. F1-I29 — Перенос учебного content path в Supabase

### Результат

Production/preview читает опубликованный контент из Supabase через безопасный server repository; локальные данные остаются только для unit/integration/dev fallback с явным environment gate.

### Ветка и коммит

- Ветка: `feature/supabase-content`.
- Коммит: `feat: load learning content from Supabase`.

### Преднамеренное изменение repository boundary

Текущий `ExerciseRepository` синхронный, потому что F1-I14 был local-only. В этой итерации, а не раньше:

- сделать repository reads асинхронными (`Promise`);
- адаптировать `LocalExerciseRepository` без изменения semantics;
- обновить Server Components/composition, чтобы они `await` repository;
- не выполнять data fetching внутри generic presentational components.

Это ожидаемая инфраструктурная миграция, а не повод переписывать evaluator/session/UI.

### Создать и изменить

- `src/features/training/data/SupabaseModuleRepository.ts`
- `src/features/training/data/SupabaseExerciseRepository.ts`
- `src/features/training/data/mappers/moduleMapper.ts`
- `src/features/training/data/mappers/exerciseMapper.ts`
- `src/features/training/presentation/PublicExercise.ts`
- safe DTO mapper, который удаляет correct refs/accepted answers до submit
- server-only evaluation lookup по exercise id/version
- composition selector для test/development/preview
- seed/import workflow и tests

### Два представления exercise

- `PublicExercise`: prompt, options labels, blank ids/template, matching labels, metadata; без `correctOptionId`, accepted answers, `is_correct` и canonical mapping.
- Server `Exercise`: полный validated domain object для evaluator после submit.

Нельзя передавать DB row или полный server Exercise в Client Component. Existing local UI необходимо адаптировать к `PublicExercise`, сохранив renderer behavior.

### Mapping и запросы

- Каждый DB payload проходит mapper + Zod; invalid row вызывает controlled data error и логирует только безопасный id/code.
- Repository filters повторяют local semantics: module, topic, type, difficulty и deterministic order.
- Public query возвращает только published module/topics и approved exercise version.
- Options/answers загружаются без N+1: bounded joins/RPC или небольшое фиксированное число запросов.
- Cache/revalidation применяется только к публичному content и инвалидируется при published version change; user data не кешируется общим cache.

### Source selection

- Production/preview с настроенным Supabase не имеет молчаливого local fallback.
- Unit/integration используют explicit local repository injection.
- Development fallback включается только явной конфигурацией и заметен в log/status.
- Draft honorifics preview остаётся development-only и не попадает в DB import.

### Тесты

- row→domain и domain→seed roundtrip;
- null/JSON/enum/version boundaries;
- repository filters и deterministic order; pagination в phase 1 не добавлять, dataset загружается bounded query по одному module;
- unpublished/draft/rejected hidden;
- invalid payload rejected;
- public DTO не содержит answer keys — structural test и serialized snapshot;
- local/DB repository contract suite даёт одинаковые результаты;
- async adaptation routes/components;
- network/DB error показывает F1-I20 state;
- query count/shape исключает очевидный N+1.

### Ручная проверка

Каталог, module page и training bootstrap работают из local Supabase и preview Supabase; отключение backend показывает error state, а не sample fallback.

### Не делать

- Не сохранять session/attempt — это F1-I30.
- Не импортировать непроверенный draft 높임말.
- Не раскрывать ответы ради удобства client evaluator; evaluation boundary переносится на server path.

## 22. F1-I30 — Сохранение учебных сессий и попыток

### Результат

Авторизованный пользователь может начать session, отправлять ответы и завершить session. Данные сохраняются в Supabase ровно один раз, принадлежат текущему пользователю и корректно восстанавливаются после обновления страницы или входа со второго устройства. Guest flow по-прежнему работает локально.

### Ветка и коммит

- Ветка: `feature/persist-training-attempts`.
- Коммит: `feat: persist training sessions and attempts`.

### Серверный API

Реализовать Route Handlers с Zod-валидацией request/response:

- `POST /api/training/sessions` — создать session из `moduleId`, `mode`, ordered списка exercise ids и `contentVersion`;
- `POST /api/training/sessions/[sessionId]/attempts` — принять один answer submission и `idempotencyKey`;
- `POST /api/training/sessions/[sessionId]/complete` — завершить session с `idempotencyKey`;
- `POST /api/training/import` — после явного подтверждения пользователя перенести одну текущую local guest session в аккаунт.

Handlers должны быть тонкими: auth/context и parsing остаются в route, правила — в service/use-case, DB writes — в repository/RPC.

### Обязательные серверные инварианты

- Не принимать от клиента `isCorrect`, score, correct answer или user id.
- По `exerciseId` и `contentVersion` заново загрузить полный server `Exercise` и выполнить evaluator на сервере.
- Проверить, что exercise входит в ordered snapshot создаваемой session.
- Не разрешать attempt после завершения session.
- Не разрешать завершить чужую или уже завершённую session с другим payload.
- Каждая write operation имеет idempotency key и DB unique constraint; повтор одного запроса возвращает исходный результат, а не создаёт дубль.
- Attempt, answer snapshot, evaluation result и mistake event записывать одной транзакцией/RPC.
- Completion и обновление агрегатов F1-I31 должны иметь единый transaction boundary после появления F1-I31.
- Хранить snapshot вопроса/ответа и content version, чтобы история не менялась после публикации новой версии.

### Guest и авторизованный режим

- Guest session остаётся в local persistence F1-I18.
- После входа ничего не объединять молча: показать предложение перенести только текущую resumable guest session.
- После подтверждения отправить её stable session id как import id, заново проверить exercise/version и переоценить каждую attempt на сервере; повторный import возвращает уже созданную session.
- Отказ оставляет local session на устройстве. История более ранних guest results не импортируется, потому что phase 1 её не хранит.
- При потере сети не показывать «сохранено» до server acknowledgement; дать retry без двойной записи.

### Создать и изменить

- `src/app/api/training/sessions/route.ts`
- `src/app/api/training/sessions/[sessionId]/attempts/route.ts`
- `src/app/api/training/sessions/[sessionId]/complete/route.ts`
- `src/app/api/training/import/route.ts`
- `src/features/training/application/startTrainingSession.ts`
- `src/features/training/application/submitTrainingAttempt.ts`
- `src/features/training/application/completeTrainingSession.ts`
- persistence repositories и Supabase implementations
- request/response schemas
- UI pending/error/retry integration
- новая migration с atomic RPC; существующие idempotency constraints из F1-I26 не дублировать, а проверить DB-тестом

### Тесты

- unauthenticated write → `401`;
- чужая session → `404` или `403` по принятой security convention, без утечки существования;
- invalid body/enum/UUID/content version → `400`;
- correct/incorrect/partial evaluation совпадает с unit evaluator suite;
- подмена `isCorrect` и answer keys игнорируется/отклоняется;
- exercise вне session и attempt после completion отклоняются;
- повтор request с тем же idempotency key не создаёт дубль;
- конкурентные одинаковые submissions создают одну attempt;
- разные устройства видят одну server history;
- transaction rollback не оставляет attempt без mistake event и наоборот;
- offline/5xx оставляет UI в retryable state;
- RLS suite подтверждает ownership;
- guest flow не делает сетевых writes до входа/явного import.

### Ручная проверка

Пройти одну session как guest и одну после входа; обновить страницу между двумя ответами; повторить submit; открыть тот же аккаунт во второй вкладке. История должна быть целостной, без дублей и чужих данных.

### Не делать

- Не строить progress UI — это F1-I31.
- Не строить review scheduler — это F1-I32.
- Не добавлять background sync, offline-first queue или real-time subscriptions.

### Definition of Done

- Server является единственным источником истины для оценки авторизованных attempts.
- Все ownership/idempotency/concurrency tests проходят.
- Guest behavior не регрессировал.
- Полный базовый quality gate зелёный.

## 23. F1-I31 — Прогресс пользователя

### Результат

Страница progress показывает понятный и воспроизводимый статус по темам и модулям. Агрегаты обновляются только из завершённых server sessions и одинаково выглядят после входа с разных устройств.

### Ветка и коммит

- Ветка: `feature/learning-progress`.
- Коммит: `feat: add learning progress tracking`.

### Формула phase 1

Для topic учитываются только graded attempts из завершённых sessions:

- `not_started`: attempts count = 0;
- `learning`: attempts count > 0, но критерий `practiced` ещё не выполнен;
- `practiced`: минимум 3 graded attempts и accuracy не ниже 80%;
- `accuracy = correct attempts / graded attempts`; partial answer не считается correct;
- module имеет статус `practiced`, только когда все его опубликованные topics имеют статус `practiced`; иначе при наличии хотя бы одной attempt — `learning`.

Attempts разных content versions агрегируются по stable topic/module id. Последняя использованная version сохраняется для диагностики, но публикация новой версии сама по себе не обнуляет прогресс.

### Архитектура расчёта

- Использовать созданные в F1-I26 `user_topic_progress` и `user_module_progress` как materialized aggregates.
- Обновлять их trusted SQL function/RPC в той же транзакции, где session переходит в completed.
- Не позволять клиенту напрямую писать counts/status/accuracy.
- Повторный completion не изменяет агрегаты второй раз.
- Добавить rebuild function только для test/admin recovery; не вызывать её из обычного request path.
- Все числа вычислять из attempts на сервере; округление выполнять только для отображения.

### Создать и изменить

- SQL function/migration для refresh progress aggregates
- `src/features/progress/domain/progress.ts`
- `src/features/progress/data/ProgressRepository.ts`
- `src/features/progress/data/SupabaseProgressRepository.ts`
- `src/features/progress/components/ProgressOverview.tsx`
- `src/features/progress/components/ModuleProgressCard.tsx`
- существующую route `/progress` перевести с placeholder на реальные данные
- guest empty state с предложением войти; текущая local session не считается долгосрочным progress

### UI

- Показать статус, число attempts и accuracy без ложной точности.
- Empty state объясняет, что прогресс появится после завершения тренировки.
- Loading/error/not-found используют primitives F1-I20.
- На mobile карточки не вызывают horizontal scroll; порядок и смысл совпадают с desktop.
- Не добавлять графики, streak, XP, уровни и прогноз времени.

### Тесты

- таблица границ: 0, 1, 2, 3 attempts; 79%, 80%, 100%;
- partial answer не повышает correct count;
- незавершённая session не влияет на progress;
- повтор completion идемпотентен;
- новая content version не обнуляет progress;
- module status для 0/части/всех practiced topics;
- rebuild function совпадает с incremental result;
- ownership/RLS для aggregate rows;
- repository mapping invalid/null values;
- loading/empty/error/data component states;
- desktop/mobile layout и accessibility names.

### Ручная проверка

Создать данные на точных границах 79% и 80%, обновить страницу, войти со второго устройства и сравнить значения. Guest и auth states должны быть явно различимы.

### Не делать

- Не менять формулу без обновления этого документа и отдельного решения.
- Не включать review attempts в особую метрику: в phase 1 они считаются обычными graded attempts.
- Не начинать очередь повторения.

### Definition of Done

- Формула реализована один раз на trusted server/DB boundary и покрыта boundary tests.
- Progress UI использует реальные aggregates.
- Нет двойного учёта и зависимости от устройства.

## 24. F1-I32 — Очередь повторения ошибок

### Результат

Ошибочный ответ создаёт или обновляет один review item. Пользователь может запустить отдельную review session, пройти доступные элементы и увидеть предсказуемое изменение сроков следующего повторения.

### Ветка и коммит

- Ветка: `feature/error-review`.
- Коммит: `feat: add mistake review queue`.

### Политика phase 1

- `conceptKey = exercise.logicalId`; для одного пользователя, module и concept существует не более одного активного item.
- Ошибка в обычной тренировке: upsert item, `status = due`, `stage = 0`, `consecutiveCorrect = 0`, `dueAt = now`.
- Правильный ответ в обычной тренировке сам по себе item не создаёт и не продвигает.
- Правильный ответ в review переводит item в `status = scheduled` по фиксированной цепочке: stage 0 → stage 1 и `dueAt = now + 1 день`; stage 1 → stage 2 и `dueAt = now + 3 дня`; stage 2 → stage 3 и `dueAt = now + 7 дней`.
- Правильный ответ на stage 3, то есть четвёртый подряд, переводит item в status `mastered` и `dueAt = null`.
- Ошибка в review: вернуть `status = due`, `stage = 0`, `consecutiveCorrect = 0`, `dueAt = now`.
- Новый ошибочный ответ по mastered concept снова активирует item с stage 0.
- Если approved/published exercise для concept недоступен, item получает status `suspended` и не выдаётся в session.
- Due query включает `status = due` и `status = scheduled` с `dueAt <= now`; cron/background transition не нужен. Queue order: `dueAt ASC`, затем stable `createdAt/id`; future items не выдаются.

### Архитектура

- Review item upsert выполняется в той же транзакции, что и attempt F1-I30.
- Schedule transition вычисляется одной domain function и дублируется DB constraints, а не UI.
- Review session использует F1-I16 engine с `mode: review`, не отдельный второй engine.
- Для concept выбирать текущую approved version; historical attempt snapshot не заменять.
- Клиент не передаёт stage, due date или mastery status.

### Создать и изменить

- `src/features/review/domain/reviewPolicy.ts`
- `src/features/review/data/ReviewRepository.ts`
- `src/features/review/data/SupabaseReviewRepository.ts`
- `src/features/review/application/createReviewSession.ts`
- `src/features/review/components/ReviewQueueSummary.tsx`
- `src/features/review/components/ReviewEmptyState.tsx`
- существующую `/review` route перевести с placeholder на queue
- SQL function/migration для atomic upsert/transition

### Тесты

- normal wrong создаёт один item;
- повторные wrong делают upsert без дубля;
- normal correct не создаёт/не продвигает item;
- review correct transitions: now → +1d → +3d → +7d → mastered после четвёртого;
- review wrong на каждой stage сбрасывает policy;
- mastered concept reactivates после новой ошибки;
- future/suspended/чужие items не попадают в queue;
- queue ordering детерминирован;
- параллельные wrong attempts не создают два item;
- timezone calculations используют UTC instants и fake clock;
- review session проходит через общий engine/evaluator;
- empty/loading/error/data UI states;
- RLS user matrix.

### Ручная проверка

С fake/test clock создать ошибку, пройти review правильно и неправильно, проверить due states и empty state. Проверить mobile/desktop и повторную загрузку страницы.

### Не делать

- Не добавлять SM-2, FSRS, AI-подбор, push/email reminders или пользовательскую настройку интервалов.
- Не считать review queue отдельной системой прогресса.
- Не возвращать draft/unpublished content ради заполнения queue.

### Definition of Done

- Политика полностью покрыта fake-clock unit tests.
- Upsert/transition атомарны и защищены RLS.
- Review route использует реальную due queue и общий session engine.

## 25. F1-I33 — Стабилизация фазы 1

### Результат

Phase 1 проходит полный quality gate на чистой среде и preview, критические user journeys подтверждены, известные ограничения зафиксированы, а новые функции не добавляются.

### Ветка и коммит

- Ветка: `chore/framework-stabilization`.
- Коммит: `chore: stabilize learning application framework`.

### Разрешённый scope

- Исправление найденных regression, accessibility, responsive, security, migration и test reliability defects.
- Удаление dead code, debug logging и accidental answer leakage.
- Обязательное удаление временного dev-only preview 높임말 из F1-I17A.
- Уточнение существующих error/empty/loading messages.
- Стабилизация flaky tests с устранением причины, а не увеличением retry.
- Документирование подтверждённых ограничений и rollback steps в существующих docs.

Любая новая функция, новая exercise type, новая метрика или новый workflow выносится за phase 1.

### Обязательная очистка preview 높임말

До финального full run:

- удалить `src/modules/honorifics/domain/previewModule.ts` и `src/modules/honorifics/data/previewExercises.ts`;
- удалить module-specific validation/tests, существующие только ради preview;
- удалить development composition/registry gate, подключавший preview по `NODE_ENV`;
- удалить пустые каталоги `src/modules/honorifics`, если после очистки в них не осталось production-кода;
- обновить затронутые registry/composition tests и подтвердить поиском, что `previewModule`, `previewExercises` и preview slug больше не импортируются;
- не переносить preview payload в Supabase, sample module или будущие phase 2 fixtures.

Phase 2 создаёт канонический `src/modules/honorifics` заново по F2-I01–F2-I05. Источником старого preview при необходимости остаётся Git history, а не живой код.

### Полный прогон на чистой среде

1. Установить зависимости по lockfile на заявленной Node/pnpm версии.
2. Поднять чистый local Supabase.
3. Применить все migrations с нуля.
4. Загрузить seed и проверить его повторяемость.
5. Выполнить format, lint, typecheck, unit, component, integration, DB/RLS, E2E и production build.
6. Запросить разрешение на push `chore/framework-stabilization`, выполнить push и дождаться полного внешнего CI и Git-integrated Vercel preview этой же ветки.
7. Выполнить smoke matrix на созданном preview.

### Smoke matrix

- Guest: каталог → module → training → refresh/resume → result → guest empty state на progress.
- Auth: magic link/OTP → training → server persistence → progress → review → sign out/in.
- Security: anon не пишет server data; user A не читает/не меняет user B; draft content скрыт; browser payload не содержит answer keys.
- Responsive: ключевые routes на mobile и desktop без скачков, overlap и horizontal scroll.
- Failure: backend unavailable, invalid id, empty content, expired link, duplicate submit.
- Data: новый clean DB, повтор migrations, approved seed, content version snapshot.

### Проверки качества

- Нет P0/P1 defects и открытых security findings.
- Нет flaky tests в трёх последовательных полных прогонах.
- Accessibility: keyboard-only journey, visible focus, labels/names, error announcements и допустимый contrast.
- Performance: зафиксировать baseline ключевых routes; устранить очевидные N+1 и unbounded queries. Не ставить новые числовые performance budgets без измерения.
- Logs не содержат tokens, email magic links, answers или чужие identifiers.
- Preview env/redirects соответствуют production-like конфигурации.

### Rollback readiness

- Проверить, что последняя migration имеет безопасный forward-fix/rollback plan.
- Зафиксировать последний заведомо рабочий commit и preview URL в release notes/status.
- Не выполнять production deploy в рамках этой итерации без отдельного решения.

### Тесты

- Запустить весь набор из раздела 4 и scripts, добавленные F1-I21/F1-I22/F1-I26/F1-I27.
- Каждый найденный defect сначала воспроизводится новым или уточнённым тестом, затем исправляется.
- Не добавлять snapshot tests вместо meaningful assertions, если поведение можно проверить напрямую.

### Definition of Done и CP-5

- Все пункты раздела 27 отмечены фактическими evidence.
- Три последовательных full runs зелёные.
- Временный preview 높임말 и его development composition полностью удалены.
- Preview smoke matrix пройдена.
- Внешний CI ветки `chore/framework-stabilization` зелёный, включая DB/RLS jobs.
- Нет незакрытых P0/P1/security issues.
- Создан CP-5 отчёт с commit, preview URL, test totals и известными ограничениями.
- Если push не разрешён или внешний CI не зелёный, CP-5 остаётся незавершённой. После принятия CP-5 остановиться. Production launch и phase 2 не начинать без явного решения пользователя.

## 26. Матрица обязательных тестов по итерациям

| Итерация | Минимально обязательные новые проверки                                         |
| -------- | ------------------------------------------------------------------------------ |
| F1-I15   | Unit: все 7 evaluators, normalization, malformed data, immutability            |
| F1-I16   | Unit: state transitions, scoring, ordering, edge cases                         |
| F1-I17   | Component: 7 renderers, keyboard, focus, submit/feedback/next, responsive      |
| F1-I17A  | Dev-only integration, production exclusion, responsive visual review           |
| F1-I18   | Unit/component: versioning, TTL, corrupted storage, resume/reset               |
| F1-I19   | Component: all-correct/mixed/empty, action links, accessibility                |
| F1-I20   | Component/route: loading/error/not-found/empty/retry                           |
| F1-I21   | Integration: guest end-to-end flow across repository→engine→persistence→result |
| F1-I22   | E2E: desktop/mobile critical journey, refresh, keyboard, no console errors     |
| F1-I23   | Full local gate, checkpoint branch CI and regression confirmation              |
| F1-I24   | Preview smoke, refresh/deep-link, env and console checks                       |
| F1-I25   | Env/client factory tests and local Supabase connection smoke                   |
| F1-I26   | Migration/constraint/seed tests on clean DB                                    |
| F1-I27   | RLS matrix for anon, owner and other user                                      |
| F1-I28   | Auth component/integration/E2E: success, expiry, redirect, logout              |
| F1-I29   | Mapper/repository contract, public DTO leakage, N+1/error behavior             |
| F1-I30   | API/service/DB/RLS: validation, ownership, idempotency, concurrency, rollback  |
| F1-I31   | Calculation boundaries, DB aggregates, RLS and progress UI states              |
| F1-I32   | Fake-clock policy, atomic queue, RLS and review UI states                      |
| F1-I33   | Preview cleanup, three complete gates, checkpoint branch CI and smoke matrix   |

Новый test file должен находиться рядом с tested unit либо в выделенном integration/e2e/db наборе. Нельзя дублировать unit suite в integration command. Любой flaky test считается defect, а не допустимым состоянием CI.

## 27. Финальная приёмка phase 1

Все пункты обязательны:

- [ ] F1-I15–F1-I33 выполнены последовательно, у каждой итерации есть отдельный commit.
- [ ] CP-1A, CP-2, CP-3 и CP-4 явно подтверждены до продолжения; CP-5 подготовлен в конце.
- [ ] Все 7 exercise types оцениваются, отображаются и проходят keyboard flow.
- [ ] Guest проходит тренировку, возобновляет её после refresh и получает result без аккаунта.
- [ ] Авторизованный пользователь входит по magic link/OTP и видит одну историю на разных устройствах.
- [ ] Attempts идемпотентны, server-evaluated и не раскрывают answer keys клиенту.
- [ ] Progress соответствует формуле F1-I31 и учитывает только completed sessions.
- [ ] Review queue соответствует политике F1-I32 и защищена RLS.
- [ ] Anon, owner и other-user сценарии подтверждены DB/RLS tests.
- [ ] Draft/rejected/unpublished content недоступен в production path.
- [x] Временный dev-only preview 높임말 из F1-I17A удалён до завершения F1-I33.
- [ ] Loading, empty, not-found, error и retry states существуют на затронутых routes.
- [ ] Mobile/desktop не имеют критических layout defects, скачков action buttons и horizontal scroll.
- [ ] Format, lint, typecheck, unit, component, integration, DB/RLS, E2E и build зелёные.
- [ ] Чистая установка, migrations и seed воспроизводимы.
- [ ] Preview smoke matrix пройдена без console errors.
- [ ] Внешний CI checkpoint-веток CP-2 и CP-5 завершён зелёным результатом.
- [ ] Нет P0/P1/security defects; остальные ограничения перечислены явно.
- [ ] `docs/APPLICATION_PLAN.md` и `.Codex/sessions/current.md` отражают фактическое состояние.
- [ ] После CP-5 работа остановлена до следующего явного указания.

## 28. Формат завершения каждой итерации

Исполнитель завершает итерацию одним отчётом:

1. **Результат:** что теперь работает с точки зрения пользователя.
2. **Изменённые границы:** contracts/API/schema/routes, если менялись.
3. **Тесты:** точные команды и totals; отдельно manual/preview checks.
4. **Отклонения:** всё, что отличается от этого плана, с причиной; при материальном отклонении работа должна была быть заранее остановлена.
5. **Коммит:** hash и message.
6. **Следующий шаг:** только название следующей итерации и её prerequisite; не начинать её.

Перед отчётом полностью обновить текущий статус в `docs/APPLICATION_PLAN.md` и перезаписать `.Codex/sessions/current.md`. Документы проекта создавать только в `docs/`; `.Codex/sessions/current.md` является служебным исключением.

## 29. Условия немедленной остановки

Исполнитель не импровизирует и запрашивает решение, если:

- checkpoint не подтверждён;
- требуются production credentials, billing, domain, email provider или production deploy;
- предложенная schema/API несовместима с уже завершённой итерацией и требует redo;
- невозможно соблюсти RLS, не раскрывая данные между пользователями;
- официальный API Next.js/Supabase/Vercel расходится с предпосылками этого документа;
- тесты выявили системную ошибку в завершённой итерации;
- для продолжения нужно изменить формулу progress, review policy, guest import semantics или public answer boundary;
- в рабочем дереве есть пересекающиеся пользовательские изменения, которые нельзя безопасно сохранить;
- следующий шаг выходит за F1-I33 или относится к production launch/phase 2.

Разрешено исправить дефект текущей итерации и повторить её проверки. Не разрешено обходить stop condition временным fallback, отключением теста, ослаблением RLS или скрытым изменением scope.
