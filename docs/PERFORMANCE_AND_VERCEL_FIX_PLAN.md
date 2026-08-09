# План исправления загрузки страниц и Vercel deployment

Последнее обновление: 2026-08-09

Статус: PERF-I00 (Production env) выполнен частично; PERF-I01—I08 реализованы в ветке `feature/performance-vercel-fixes`.

Базовый commit: `1d6fd9af5a21d85d5b115e9a83e7c14b984d1002`.

## 1. Цель и границы

Цель — восстановить публичный Production, уменьшить фактическое время загрузки и переходов, устранить лишний клиентский JavaScript и закрепить результат автоматическими проверками.

Исполнитель должен выполнять итерации строго по порядку. Следующая итерация начинается только после прохождения критериев готовности текущей. Если критерий не достигнут, причина фиксируется, исправление остаётся в текущей итерации.

В рамках этого плана нельзя:

- менять визуальный дизайн или продуктовый сценарий;
- удалять Proxy либо ослаблять проверку авторизации без отдельного доказательства безопасности;
- переносить всю авторизацию на клиент только ради статической генерации;
- добавлять значения секретов в код, тестовые снимки, логи или документацию;
- начинать следующую фазу основного плана приложения;
- оптимизировать время Vercel build раньше пользовательской загрузки страниц.

## 2. Проверенный удалённый baseline

### 2.1 Deployment

| Контур                     | URL                                                                | Состояние                                         |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| Preview текущего commit    | `https://korean-learning-cd8rhfvj9-grognakirs-projects.vercel.app` | `Ready`, приложение работает за Vercel SSO        |
| Production deployment      | `https://korean-learning-8kcone4zw-grognakirs-projects.vercel.app` | `Ready`, но все запросы приложения отвечают `500` |
| Публичный Production alias | `https://korean-learning-gray.vercel.app`                          | `500` на проверенных маршрутах                    |

Preview проверен в авторизованной браузерной сессии. Неавторизованный HTTP-запрос к Preview перенаправляется на `vercel.com/login` и загружает примерно 484 KB страницы входа. Такое измерение относится к Vercel Deployment Protection, а не к приложению, и не должно использоваться как результат производительности.

### 2.2 Функциональная проверка Preview

Маршруты `/`, `/topics`, `/topics/sample-module`, `/training`, `/training/demo-session`, `/progress`, `/review`, `/dictionary` и `/login` открылись с ожидаемыми заголовками. Учебная сессия гостя содержит 14 заданий, показывает progress bar и принимает взаимодействие. В консоли браузера ошибок и предупреждений не обнаружено. В Vercel runtime logs для Preview ошибок и предупреждений не обнаружено.

### 2.3 Наблюдаемая загрузка Preview

Измерения сделаны на удалённом Preview из текущего окружения и предназначены для baseline, а не для сравнения лабораторных Web Vitals.

| Маршрут                  | Полная навигация, первое наблюдение | Повторное наблюдение |
| ------------------------ | ----------------------------------: | -------------------: |
| `/`                      |                              640 ms |                    — |
| `/topics`                |                              606 ms |                    — |
| `/topics/sample-module`  |                              520 ms |                    — |
| `/training`              |                            1 040 ms |               521 ms |
| `/training/demo-session` |                        911–1 008 ms |               639 ms |
| `/progress`              |                              785 ms |               539 ms |
| `/review`                |                              811 ms |                    — |
| `/dictionary`            |                              871 ms |                    — |
| `/login`                 |                              598 ms |                    — |

Клиентские переходы после предварительной загрузки показывали заголовок примерно за 30 ms для уже прогретого `/topics` и примерно за 551–578 ms для динамических страниц и учебной сессии. Время около трёх секунд, видимое в обёртке автоматизации после `click`, не является временем реакции приложения и в отчётах использоваться не должно.

Тёплые RSC-запросы Preview в регионе `icn1` показали:

- Proxy: 6–7 ms;
- server function: 8–18 ms;
- исходящие обращения к внешним API: отсутствуют;
- завершение ответа: 407–416 ms.

Следовательно, Supabase-контент на этих запросах уже находился в кэше, а основная задержка тёплого Preview не объясняется вычислением Proxy или route function. Остаток времени связан с платформенным трактом Preview, защитой deployment, передачей и стримингом RSC; точное распределение без telemetry утверждать нельзя.

### 2.4 Vercel build

- deployment стал `Ready` за 52 s;
- установка 469 пакетов заняла 12,8 s;
- Next.js compile занял 12,9 s;
- TypeScript занял 8,0 s;
- все маршруты помечены как динамические `ƒ`;
- build cache — 251,90 MB;
- Vercel использовал Node `24.15.0`, а `package.json` требует `>=24.18.0 <25`, поэтому build печатает `Unsupported engine`;
- pnpm `10.34.5` совпадает с проектом;
- Vercel сообщает об игнорировании build scripts `esbuild@0.28.1` и `unrs-resolver@1.12.2`.

### 2.5 Подтверждённая причина Production 500

Production runtime logs содержат `EnvValidationError` с кодом `ENV_VALIDATION_FAILED`. Отсутствуют:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Ошибка возникает в `src/features/authentication/server/updateSession.ts`: Proxy безусловно вызывает `parsePublicSupabaseEnv()`. Поэтому Production deployment имеет статус `Ready`, но приложение не может обработать ни один маршрут.

Отдельно требуется проверить наличие `SUPABASE_SECRET_KEY` в Production scope. Текущая ошибка ещё не доказывает его отсутствие, но этот ключ необходим server-side Supabase content path. Значения всех переменных должны оставаться скрытыми.

## 3. Причины медленной загрузки

| Приоритет | Причина                                                          | Подтверждение                                                                                                                                             |
| --------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0        | Production опубликован без обязательных переменных окружения     | Публичный alias отвечает `500`, runtime logs содержат точный `EnvValidationError`                                                                         |
| P1        | Слишком большой initial JavaScript                               | Простые страницы получают около 139,7 KB gzip, а topics/training/progress/login — около 270–286,9 KB gzip                                                 |
| P1        | Клиентские barrel exports смешивают UI, domain и server/data код | `src/features/training/index.ts` и `src/components/ui/index.ts` расширяют client manifests; общий route chunk около 130,8 KB gzip включает Supabase и Zod |
| P1        | Корневой layout делает все страницы зависимыми от cookies/auth   | `src/app/layout.tsx` вызывает `getServerAuthUser()`, все маршруты собираются как динамические и отвечают с private/no-store semantics                     |
| P1        | Авторизация читается несколько раз в одном запросе               | Proxy вызывает `getClaims`, layout вызывает `getUser`, а `/progress` и `/training/[sessionId]` снова вызывают `getServerAuthUser()`                       |
| P1        | Supabase composition загружает больше данных, чем нужно маршруту | `composeSupabaseContent()` заранее создаёт module и exercise repositories и ожидает обе части даже для страниц, которым нужны только модули               |
| P2        | Cloud session блокирует экран упражнения                         | `useCloudTrainingPersistence` сначала создаёт удалённую сессию, а `TrainingSession` заменяет содержимое экраном «Синхронизация сессии»                    |
| P2        | Toolchain Vercel не соответствует заявленному engine             | Node `24.15.0` против `>=24.18.0 <25`; это build hygiene, но не доказанная причина медленного runtime                                                     |

Proxy нельзя считать основной причиной текущей задержки: на проверенном Preview его работа занимала 6–7 ms. Удалять его ради ускорения запрещено без отдельного профилирования и security review.

## 4. Порядок реализации

### PERF-I00 — восстановить публичный Production

Это внешний операционный шаг, а не изменение исходного кода. Исполнитель должен получить явное разрешение на изменение Vercel environment и redeploy.

Действия:

1. В Vercel проверить только факт наличия, scope и deployment availability переменных, не раскрывая значения:
   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
   - `SUPABASE_SECRET_KEY`.
2. Добавить или переопределить недостающие значения для `Production`. Для `Preview` отдельно подтвердить тот же набор.
3. Рекомендуется явно установить `CONTENT_SOURCE=supabase` в `Preview` и `Production`, чтобы выбор источника не зависел от косвенного присутствия переменных.
4. Выполнить redeploy текущего commit без изменения исходников.
5. Проверить публичный alias без авторизованной Vercel-сессии.

Проверки:

- все девять маршрутов из раздела 2.2 отвечают `200` либо ожидаемым redirect, но не `500`;
- Vercel runtime logs не содержат `ENV_VALIDATION_FAILED`;
- `/topics` содержит данные Supabase;
- `/training/demo-session` открывает сессию;
- вход и выход не нарушены;
- никакие значения переменных не попали в CI output или отчёт.

Критерий готовности: публичный Production работоспособен. До этого PERF-I01 не начинается.

### PERF-I01 — не допускать `Ready` deployment с неполным environment

Цель — превращать ошибку конфигурации в понятный build failure, а не в runtime `500` после публикации.

Действия:

1. Расширить `src/lib/validation/env.ts` отдельной проверкой deployment environment:
   - при `CONTENT_SOURCE=supabase` обязательны все три Supabase-переменные;
   - public keys валидируются как URL и publishable key;
   - secret проверяется только server-side;
   - сообщение содержит имена отсутствующих ключей, но не значения.
2. Добавить маленький prebuild script, который запускается перед `next build` в CI/Vercel и вызывает эту проверку.
3. Для локальной разработки с явным `CONTENT_SOURCE=local` Supabase keys не требовать.
4. Убрать неявность выбора источника в deployment: для Preview и Production использовать `CONTENT_SOURCE=supabase`; локальный fallback сохранить только там, где он уже разрешён тестами.

Тесты:

- unit: отсутствует каждый из трёх ключей по отдельности;
- unit: отсутствуют все ключи;
- unit: некорректный URL;
- unit: `CONTENT_SOURCE=local` проходит без Supabase;
- unit: валидный Supabase environment проходит;
- smoke: локальный production build с тестовым local environment;
- negative smoke: prebuild завершается ошибкой до `next build`, не печатая secret.

Критерий готовности: невозможно получить успешный Supabase deployment build с отсутствующим обязательным ключом.

### PERF-I02 — разделить client/server import boundaries

Цель — убрать Supabase, Zod и неиспользуемые training-компоненты из client manifests простых страниц.

Действия:

1. Перестать импортировать UI и training API из широких barrel files внутри `src/app` и client components.
2. Разделить публичные entry points training feature:
   - client components;
   - domain types и чистые selectors;
   - server/data API.
3. Заменить импорты страниц на прямые или узкие entry points. В первую очередь:
   - `src/app/topics/page.tsx`;
   - `src/app/topics/[moduleSlug]/page.tsx`;
   - `src/app/training/page.tsx`;
   - `src/app/training/[sessionId]/page.tsx`;
   - `src/app/progress/page.tsx`;
   - training client components.
4. Аналогично заменить `@/components/ui` на импорты конкретных primitives там, где barrel расширяет клиентский граф.
5. Не дублировать типы и не переносить server-only code в client files.
6. Добавить повторяемый bundle report либо проверку manifests, пригодную для CI.

Тесты:

- существующие unit/integration/e2e;
- production build;
- в client manifest `/topics` отсутствуют `TrainingSession`, renderers упражнений, Supabase server/browser client и Zod;
- в client manifest `/training` отсутствуют renderers, которые не нужны до открытия сессии;
- login продолжает загружать необходимый browser Supabase client.

Предварительные JS-бюджеты gzip после production build:

- простые маршруты `/`, `/dictionary`, `/review`: не более 150 KB;
- `/topics` и `/training`: не более 180 KB;
- `/training/[sessionId]`: не более 220 KB;
- рост любого маршрута более чем на 10 KB относительно результата этой итерации блокирует последующие изменения без объяснения.

Критерий готовности: budgets соблюдены, функциональность не изменилась, server-only зависимости не попадают в client manifests.

### PERF-I03 — дедуплицировать server auth reads

Цель — не выполнять повторный `auth.getUser()` в одном React request.

Перед изменением обязательно прочитать актуальное руководство установленной версии Next.js в `node_modules/next/dist/docs/` по request memoization, `cache()` и cookies.

Действия:

1. Сделать `getServerAuthUser()` memoized на время одного server render request через поддерживаемый Next.js/React механизм.
2. Сохранить `getClaims()` в Proxy: он отвечает за обновление и проверку сессии, а не заменяет trusted user lookup страницы.
3. Layout, `/progress`, `/training/[sessionId]` и API context должны использовать единый memoized helper там, где они участвуют в одном render request.
4. Не создавать глобальный кэш пользователей между запросами.

Тесты:

- unit: параллельные обращения в одном request вызывают `auth.getUser()` один раз;
- unit: разные requests не разделяют пользователя;
- guest layout и защищённые состояния;
- authenticated progress и training session;
- истёкшая и некорректная сессия;
- Proxy tests остаются зелёными.

Критерий готовности: один `getUser()` на server render request; auth semantics не изменились.

### PERF-I04 — изолировать auth от публичного route shell

Цель — перестать делать все публичные страницы полностью динамическими только из-за UserMenu в корневом layout.

Сначала выполнить отдельный spike на установленной версии Next.js: route groups, Cache Components/Partial Prerendering, `Suspense`, cookies и auth-aware islands. Результат spike должен выбрать минимальное решение, а не сразу менять архитектуру.

Предпочтительный результат:

- стабильный публичный shell и контент могут быть статическими или частично предрендеренными;
- UserMenu/auth island остаётся динамическим;
- `/progress` и другие действительно пользовательские данные остаются динамическими;
- серверная защита данных сохраняется.

Действия после spike:

1. Вынести auth-dependent часть из пути, который заставляет весь root layout ждать cookies/user.
2. Добавить корректный loading fallback фиксированного размера, чтобы header не прыгал после hydration.
3. Проверить cache headers и build route matrix.
4. Не использовать client-only auth как источник разрешения доступа к серверным данным.

Тесты:

- guest и authenticated header;
- отсутствие layout shift при появлении UserMenu;
- protected data нельзя получить как гость;
- build больше не помечает все публичные content routes как полностью динамические, если выбранный Next.js режим это поддерживает;
- публичные guest responses не получают `private, no-store` только из-за header;
- navigation e2e для desktop и mobile.

Критерий готовности: выбранное решение документировано в отчёте итерации, публичные страницы используют static/partial rendering, безопасность авторизации сохранена.

### PERF-I05 — загружать только нужную часть учебного контента

Цель — исключить eager composition module и exercise data для маршрутов, которым нужна только одна часть.

Действия:

1. Разделить `resolveLearningContent` на узкие async loaders, минимум:
   - module registry/repository;
   - exercise repository;
   - полная composition только для сценария, которому нужны обе части.
2. `/topics` и module preview не должны создавать или ожидать exercise repository без необходимости.
3. `/training` не должен загружать полные упражнения до выбора/открытия сессии, если ему достаточно метаданных.
4. Сохранить server cache и single-flight поведение Supabase запросов.
5. Ошибку одной независимой части не маскировать и не превращать в молчаливый local fallback на Production.

Тесты:

- repository spies подтверждают точное число обращений для каждого маршрута;
- повторный тёплый запрос использует cache;
- concurrent cold requests не дублируют одну загрузку;
- ошибка module loader и exercise loader обрабатывается отдельно;
- existing content parity tests остаются зелёными.

Критерий готовности: `/topics` не читает упражнения, а session route не выполняет лишнюю повторную загрузку модулей.

### PERF-I06 — не заменять упражнение экраном cloud bootstrap

Цель — сократить воспринимаемое ожидание авторизованного пользователя без потери данных.

Действия:

1. Сохранить видимыми shell упражнения, заголовок, progress bar и зарезервированную область ответа во время создания cloud session.
2. До готовности remote session либо временно отключить отправку ответа с понятным статусом, либо безопасно поставить действие в очередь. Выбор должен быть подтверждён тестом на отсутствие потери/дублирования ответа.
3. Добавить retry для ошибки создания сессии.
4. Не переключаться молча на локальное сохранение для авторизованного пользователя: это отдельное продуктовое решение.
5. Высота статуса должна быть стабильной на mobile, tablet, desktop и ultrawide.

Тесты:

- медленное создание cloud session;
- ошибка и retry;
- double click/Enter до готовности;
- один ответ сохраняется один раз;
- progress bar и текущий номер задания не откатываются;
- reload/recovery существующей сессии;
- accessibility: status объявляется, focus не теряется.

Критерий готовности: пользователь сразу видит учебный экран, но не может потерять или задублировать ответ.

### PERF-I07 — выровнять Vercel toolchain

Цель — убрать недостоверный engine contract и предупреждения build без риска сломать нативные зависимости.

Действия:

1. Проверить актуальные возможности выбора Node 24 patch в официальной документации Vercel на момент реализации.
2. Если Vercel позволяет закрепить `24.18.x`, синхронизировать Vercel, локальный runtime и CI.
3. Если Vercel поддерживает только собственный текущий patch `24.15.0`, скорректировать нижнюю границу `engines.node` до реально поддерживаемой версии и отдельно сохранить целевую версию для local/CI. Нельзя просто скрывать warning.
4. Оставить pnpm `10.34.5`.
5. Разобрать, действительно ли `esbuild` и `unrs-resolver` требуют разрешённых install scripts в данном lockfile. Не включать scripts вслепую; сначала проверить владельца, назначение и integrity.

Тесты:

- clean install;
- production build;
- lint, typecheck, unit/integration;
- Vercel build без engine warning;
- smoke всех маршрутов после deployment.

Критерий готовности: локальный, CI и Vercel contract согласованы; предупреждения либо устранены, либо имеют подтверждённое безопасное объяснение.

### PERF-I08 — закрепить performance gate и наблюдаемость

Цель — не допустить незаметного возврата текущих проблем.

Действия:

1. Добавить read-only smoke/performance script с URL через environment variable, без зашитого Preview URL.
2. Разделить режимы:
   - публичный Production без авторизации;
   - protected Preview через браузерную сессию;
   - локальный production server.
3. Для каждого маршрута собирать минимум 5, лучше 10 повторов и считать median/p95. Первый cold-like заход хранить отдельно от warm повторов.
4. Отдельно сохранять HTTP status, момент появления главного заголовка и ошибки console/runtime.
5. Добавить bundle budgets PERF-I02 в CI.
6. По отдельному разрешению включить Vercel Speed Insights/Web Analytics. Это внешнее изменение и не является обязательным условием базового gate.

Предварительные бюджеты до повторного baseline на исправленном Production:

| Метрика                                           |                                                          Бюджет |
| ------------------------------------------------- | --------------------------------------------------------------: |
| Публичные маршруты                                |                  `200` или ожидаемый redirect, 0 runtime errors |
| Warm Proxy                                        |                                                  median ≤ 15 ms |
| Warm server function гостевых страниц             |                                                  median ≤ 50 ms |
| Появление главного заголовка, full navigation     |                               median ≤ 700 ms; session ≤ 800 ms |
| Появление заголовка, prefetched client navigation | median ≤ 250 ms для content routes; ≤ 400 ms для dynamic routes |
| p95 full navigation                               |                            ≤ 1 200 ms после не менее 10 замеров |
| Console errors/warnings                           |                                                             0/0 |

После PERF-I00 эти числа нужно перебазировать на публичном Production. Если географическая дистанция или cold start стабильно нарушают бюджет, отчёт должен разделить platform latency и app latency, а не ослаблять бюджет без данных.

Критерий готовности: одна команда формирует воспроизводимый отчёт и возвращает ненулевой exit code при нарушении status, error или bundle budget.

## 5. Обязательная матрица проверок

После каждой кодовой итерации выполняются только релевантные быстрые тесты, затем полный gate перед merge:

1. ESLint.
2. TypeScript без emit.
3. Все unit и integration tests — текущий baseline: 267 тестов.
4. Production build.
5. E2E:
   - все девять маршрутов;
   - переходы по навигации и Enter;
   - открытие training session;
   - отправка ответа и переход к следующему заданию;
   - progress/recovery;
   - login/logout;
   - mobile и desktop viewport.
6. Bundle report с gzip budgets.
7. Удалённый smoke после Vercel Preview deployment.
8. Публичный Production smoke после promote/redeploy.
9. Vercel runtime logs: 0 новых application errors и warnings за окно проверки.

Для полноценного authenticated remote performance test потребуется тестовый пользователь либо ручной magic-link вход. Исполнитель не должен отправлять письмо или создавать учётную запись без явного разрешения.

## 6. Формат отчёта каждой итерации

Cursor или Claude обязан приложить:

1. Что изменено и почему это относится только к текущей итерации.
2. Список затронутых файлов.
3. До/после для измеряемой метрики.
4. Команды и фактические результаты тестов.
5. Bundle sizes по маршрутам, если менялся import graph.
6. URL Preview и commit SHA.
7. Результат удалённого smoke и проверку runtime logs.
8. Оставшиеся риски и решение: продолжать, исправлять текущую итерацию или остановиться.

Сообщение «стало быстрее» без чисел не принимается. Сравнивать нужно одинаковый маршрут, режим navigation, регион и protected/public контур.

## 7. Обновление проектных документов

После завершения каждой итерации:

- обновить статус соответствующей итерации в этом документе;
- перезаписать `.Codex/sessions/current.md` актуальным срезом;
- в `docs/APPLICATION_PLAN.md` отмечать только факт corrective stabilization внутри текущей фазы, не менять цели следующих фаз и не перенумеровывать их;
- не создавать дополнительные отчётные `.md`, если они не запрошены пользователем.

## 8. Финальный критерий завершения

План считается исполненным, когда одновременно выполнено следующее:

- публичный Production доступен и не имеет environment errors;
- обязательные deployment variables проверяются до публикации;
- client bundles укладываются в budgets;
- публичный route shell больше не становится полностью dynamic только из-за header auth;
- повторные auth reads и лишние content reads устранены;
- cloud bootstrap не скрывает учебный экран и не теряет ответы;
- Vercel toolchain соответствует заявленному contract;
- полный локальный и удалённый gate проходит;
- после исправлений зафиксирован новый Production baseline median/p95.
