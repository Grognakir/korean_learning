# План разработки Korean Learning

## Статус проекта

- **Общее состояние:** F1-I01–F1-I14 завершены; остаток фазы 1 подробно зафиксирован в `docs/PHASE_1_REMAINING_IMPLEMENTATION_PLAN.md`.
- **Текущая фаза:** фаза 1 — создание рабочего каркаса.
- **Текущая итерация:** F1-I15 — детерминированная проверка ответов; код не начат.
- **Статус текущей итерации:** `planned`, ожидает отдельной явной команды пользователя.
- **Уже сделано:** доступны адаптивная оболочка и маршруты, общие UI/feedback-компоненты, доменные контракты module/topic/exercise, Zod-валидация, ModuleRegistry, 14 sample-упражнений семи типов, `ExerciseRepository` и `LocalExerciseRepository`.
- **Выполненные проверки:** Prettier, ESLint, 73/73 теста в 32 файлах, `next typegen`, строгий `tsc --noEmit` и production build проходят на Node.js 24.18.0 и pnpm 10.34.5.
- **Сейчас работает:** навигируемая mobile-first оболочка, каталог из registry/repository, страница sample module и получение количества доступных упражнений через repository boundary.
- **Пока не работает:** evaluator, session engine, интерактивная тренировка, локальное возобновление, результаты, E2E, Supabase, авторизация, server persistence, прогресс и review queue.
- **Следующий конкретный шаг:** только F1-I15 по `docs/PHASE_1_REMAINING_IMPLEMENTATION_PLAN.md`; F1-I16 не начинать в той же итерации.
- **Блокирующие вопросы:** для начала реализации F1-I15 нужна отдельная явная команда пользователя.
- **Решения, требующие подтверждения:** CP-1A, CP-2, CP-3, CP-4 и CP-5 подтверждаются в точках, указанных в исполнимом плане.
- **Последнее обновление:** 2026-08-08.

## 1. Цель, результат и границы

Цель — создать расширяемое адаптивное веб-приложение для изучения корейского языка и выпустить первый стабильный модуль уровня 1급 по теме 높임말. Сначала создаётся независимый от конкретной темы тренировочный каркас, затем поверх него — проверенный учебный модуль.

MVP включает каталог тем, прохождение и возобновление тренировок, результат, повторение ошибок, прогресс, словарь, авторизацию и модуль 높임말 с девятью типами практики. Базовые упражнения полностью работоспособны без OpenAI API.

За пределами MVP без отдельного решения: подписки, социальные функции, рейтинги, чат, полноценная админ-панель, нативные приложения, сложная геймификация, голосовой ввод, микросервисы, Railway и автоматическая публикация ИИ-контента.

## 2. Подтверждения и контрольные точки

### Решения перед F1-I01

1. **Подтверждено:** архитектура и разбивка на 56 малых итераций без массового объединения.
2. **Подтверждено:** заменить неотслеживаемый `package.json` конфигурацией приложения; отдельная резервная копия не требуется.
3. **Подтверждено:** последовательность «локальный функциональный каркас → первый Vercel preview → Supabase и облачная персистентность».
4. **Подтверждено:** email magic link/OTP как базовый вход; парольный вход можно добавить позднее.
5. **Подтверждено:** OpenAI остаётся выключенным и за пределами MVP; раздел 14 — только архитектурный эскиз.
6. **Подтверждено:** пользователь выполняет финальную ручную проверку корейского контента перед статусом `approved`; при наличии носителя/преподавателя его проверка добавляется как дополнительная.
7. **Подтверждено:** pnpm, ранний CI, ранний вертикальный срез 높임말 и раздельные поля жизненного цикла/происхождения контента.

### Контрольные точки пользователя

- **CP-0:** утверждение этого плана; открывает F1-I01.
- **CP-1:** после F1-I11 — визуальная проверка оболочки, маршрутов и мобильного интерфейса.
- **CP-1A:** после F1-I17A — проверка ощущения реальной короткой тренировки 높임말 и пригодности общего UI.
- **CP-2:** после F1-I23 — локальный quality gate и внешний CI ветки `chore/framework-quality-gate`.
- **CP-3:** перед F1-I24 — отдельное разрешение на создание/изменение Vercel-проекта и первый деплой.
- **CP-4:** перед F1-I25 — предоставление/создание Supabase-проекта и согласование auth-настроек.
- **CP-5:** после F1-I33 — удаление временного preview-кода, полный локальный gate, preview smoke и внешний CI ветки `chore/framework-stabilization`.
- **CP-6:** после F2-I05 — утверждение словаря, грамматических правил и спорных переводов.
- **CP-7:** после F2-I18 — проверка всех типов упражнений и учебной обратной связи.
- **CP-8:** после F2-I21 — языковая приёмка проверяющим.
- **CP-9:** после F2-I22 — выпуск `v0.1.0` только по явному подтверждению.

## 3. Технологический фундамент

- Next.js с App Router, React и строгий TypeScript.
- Local development и GitHub Actions используют точный Node.js из `.nvmrc`; `package.json#engines` задаёт совместимый диапазон. Vercel использует актуальный поддерживаемый patch/minor выбранной major-ветки, поэтому фактическая версия проверяется и фиксируется в deployment report, а не приравнивается к local patch.
- pnpm как единственный менеджер пакетов; точная версия фиксируется в `package.json#packageManager`, коммитится только `pnpm-lock.yaml`. Локальная и CI-установка настраивается явно и не полагается исключительно на встроенный в Node.js Corepack.
- CSS Modules, обычный CSS, CSS Custom Properties, mobile-first.
- Supabase PostgreSQL, Supabase Auth и RLS. Storage не создаётся, пока не появятся пользовательские файлы.
- Zod на границах: локальный контент, формы, route handlers, переменные окружения, ответы внешних API.
- Vitest и React Testing Library для unit/component; Playwright для браузерных сценариев.
- ESLint с конфигурацией Next.js; форматирование отдельной командой. Выбор форматтера фиксируется в F1-I03, рекомендуемый — Prettier без дополнительных стилистических плагинов.
- Vercel для preview/production; секреты хранятся только в переменных окружения.
- OpenAI — необязательная серверная интеграция после MVP и отдельного решения.

## 4. Архитектура

### 4.1. Слои и направления зависимостей

1. `src/app` — маршрутизация, route layouts, Server Components, route handlers и композиция страниц.
2. `src/components` — общие визуальные компоненты без предметных знаний.
3. `src/wrappers` — структурные рамки страниц; не содержат правил упражнений.
4. `src/features` — переиспользуемые пользовательские сценарии: тренировка, результат, прогресс, повторение, словарь, вход.
5. `src/modules` — контент и правила конкретной учебной темы; `honorifics` подключается через общий контракт модуля.
6. `src/lib` — инфраструктура и чистые технические функции.
7. Supabase — постоянные данные и контроль доступа; браузер не получает service-role key.

Разрешённое направление: `app → features/modules/components/wrappers → lib/types`. Общий тренировочный движок принимает дискриминированные типы упражнений и реестр проверяющих, но не импортирует `modules/honorifics`. Модуль регистрирует контент и специфические правила через стабильные интерфейсы.

### 4.2. Серверные и клиентские границы

- Страницы по умолчанию Server Components.
- Client Components применяются только для интерактивной тренировки, форм, локального состояния и browser API.
- Чтение публичного контента выполняется серверными функциями; пользовательские записи — Server Actions или Route Handlers с повторной серверной валидацией.
- Route Handlers используются для API, которому нужны HTTP-семантика, rate limit или внешние интеграции.
- Проверка ответа выполняется детерминированно локально/на сервере; сервер является источником истины для сохранённой попытки.

### 4.3. Контракты домена

- `LearningModuleDefinition`: slug, уровень, локализованные метаданные, список тем, поддерживаемые типы, версия контента.
- `Exercise`: дискриминированное объединение по `type`; общие поля `id`, `moduleSlug`, `topicIds`, `difficulty`, `prompt`, `explanation`, `contentVersion`.
- Типы: `free-response`, `meaning-choice`, `honorific-choice`, `plain-choice`, `matching-translation`, `matching-honorific`, `fill-blank`.
- `AnswerSubmission` и `AnswerEvaluation`: нормализованный ответ, корректность, частичный балл при допустимости, код причины, правильные ответы, объяснение.
- `TrainingSessionState`: конфигурация, очередь exercise id, текущий индекс, ответы, ошибки, timestamps, состояние `active|completed|abandoned`.
- `ModuleRegistry`: возвращает метаданные и источник упражнений, не раскрывая внутреннее устройство конкретного модуля.

## 5. Целевая структура

```text
/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   ├── icons/
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── topics/page.tsx
│   │   ├── topics/[moduleSlug]/page.tsx
│   │   ├── training/page.tsx
│   │   ├── training/[sessionId]/page.tsx
│   │   ├── review/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── dictionary/page.tsx
│   │   ├── login/page.tsx
│   │   └── api/
│   │       ├── exercises/route.ts
│   │       ├── training/route.ts
│   │       └── ai/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── navigation/
│   │   └── feedback/
│   ├── wrappers/
│   │   ├── AppShell/
│   │   ├── PageContainer/
│   │   ├── ContentSection/
│   │   ├── AuthBoundary/
│   │   └── TrainingShell/
│   ├── features/
│   │   ├── training/
│   │   ├── progress/
│   │   ├── review/
│   │   ├── dictionary/
│   │   └── authentication/
│   ├── modules/
│   │   └── honorifics/
│   │       ├── components/
│   │       ├── data/
│   │       ├── domain/
│   │       ├── validation/
│   │       └── tests/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── openai/
│   │   ├── validation/
│   │   ├── errors/
│   │   └── utilities/
│   ├── hooks/
│   ├── types/
│   ├── constants/
│   └── styles/
│       ├── reset.css
│       ├── tokens.css
│       ├── globals.css
│       └── utilities.css
├── tests/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   ├── factories/
│   └── helpers/
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── config.toml
├── .env.example
├── .gitignore
├── eslint.config.*
├── next.config.*
├── package.json
├── playwright.config.*
├── tsconfig.json
├── vitest.config.*
└── APPLICATION_PLAN.md
```

Пустые каталоги заранее не создаются. Они появляются вместе с первым содержательным файлом. Допускаются технические файлы `middleware.ts`, `instrumentation.ts`, `proxy.ts` или `src/app/auth/callback/route.ts`, если этого требует выбранная версия Next.js/Supabase; точное имя проверяется по актуальной официальной документации в соответствующей итерации.

## 6. Правила размещения файлов и компонентов

- `page.tsx` отвечает за получение данных и композицию, но не содержит большие компоненты или правила проверки.
- Переиспользуемый содержательный компонент размещается в папке `Name/` с `Name.tsx`, `Name.module.css`, ближайшим unit-тестом и `index.ts`.
- Маленький одноразовый компонент до примерно 40–60 строк без собственного сложного состояния может быть одним `.tsx` рядом с потребителем; при повторном использовании он переносится в папку.
- `components/ui` ничего не знает о Supabase, OpenAI, корейском языке и упражнениях.
- `wrappers` задают структуру и семантические области, но не загружают данные и не проверяют ответы.
- `features` владеют пользовательскими сценариями; `modules` — учебным контентом и специфическими правилами.
- Unit-тест лежит рядом с исходником; интеграционный — в `tests/integration`; e2e — в `tests/e2e`; фикстуры, фабрики и helpers не смешиваются с production-кодом.
- Не используются одновременно `__tests__` и централизованный каталог для одного класса тестов.
- Barrel-файлы разрешены только на публичной границе папки; избегаются циклические импорты.
- Алиас `@/* → src/*`; глубокие импорты во внутренности feature/module запрещаются там, где определён публичный `index.ts`.

## 7. Стили и доступность

- `tokens.css`: категории `--color-*`, `--font-*`, `--font-size-*`, `--line-height-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--content-width-*`, `--z-index-*`, `--transition-*`.
- Семантические токены отделяются от палитры: фон, текст, граница, акцент, success, warning, danger, focus.
- Светлая тема — стандарт; тёмные значения проектируются под `[data-theme='dark']`, но переключатель не входит в MVP.
- Компонентные стили — только CSS Modules; глобальные utility-классы ограничены доступностью и layout-примитивами.
- Mobile-first, без hover-only взаимодействий; минимальная цель касания 44×44 px.
- Корейский текст получает корректный fallback-шрифт и `lang="ko"`; русский — `lang="ru"` при необходимости.
- Обязательны видимый focus, семантические label/fieldset, клавиатурное управление, live-region для обратной связи, уважение `prefers-reduced-motion` и контраст WCAG 2.2 AA.

## 8. Git и управление изменениями

- `main` остаётся стабильной; работа — в `feature/*`, `fix/*`, `chore/*` согласно ТЗ.
- Одна итерация — одна небольшая ветка и один содержательный коммит после всех проверок. Если нужны исправления проверки, они входят в тот же коммит до завершения итерации.
- Неотслеживаемые пользовательские файлы не удаляются молча. Текущий `package.json` заменяется только после CP-0.
- Push, merge, теги, GitHub/Vercel/Supabase изменения выполняются только с отдельным разрешением, когда затрагивают внешнее состояние.
- История не переписывается; destructive-команды не применяются.
- После завершения каждой итерации полностью актуализируются раздел «Статус проекта» и `.Codex/sessions/current.md`.

## 9. Общие ворота качества итерации

Итерация получает статус `done`, только если выполнен заявленный объём, нет известных критических дефектов, проходят format check, `typecheck`, ESLint, production build и все тесты, связанные с изменённым пользовательским путём или слоем. Полный unit/integration/e2e/DB-набор обязателен на контрольных итерациях стабилизации и перед релизом; обычная итерация не обязана запускать несвязанный тяжёлый e2e-набор. До появления конкретного инструмента соответствующий пункт помечается `не применимо`; после появления пропуск связанных проверок запрещён. Результат проверяется вручную, обновляются два статусных документа и создаётся один небольшой коммит. При дефекте создаётся корректирующая итерация `fix/*`, и следующая функция не начинается.

Статусы: `planned`, `in_progress`, `blocked`, `verification`, `done`. В плане хранится текущий срез; завершённые итерации не превращаются в подробный changelog.

## 10. Сводка дорожной карты

- **Фаза 1 — рабочий каркас:** F1-I01…F1-I33 плюс F1-I17A, 34 итерации.
- **Фаза 2 — модуль 높임말:** F2-I01…F2-I22, 22 итерации.
- **Всего:** 2 фазы, 56 итераций, не считая незапланированных корректирующих итераций.

## 11. Фаза 1 — рабочий каркас

### F1-I01 — Окружение и подготовка репозитория

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** получить воспроизводимую безопасную основу до генерации приложения.
- **Входные зависимости:** CP-0 и решение по существующему `package.json`.
- **Задачи:** проверить актуальную LTS Node.js; зафиксировать Node.js и pnpm; выбрать явный способ установки pnpm локально и в CI; создать `.gitignore`; проверить remote и чистоту границ изменений; создать ветку.
- **Предполагаемые файлы:** `.nvmrc`, `.gitignore`, `package.json` только после разрешения.
- **Компоненты:** нет.
- **Данные / БД:** без изменений.
- **Тесты:** команды версий, `git status`, проверка игнорирования `.env*`, `.next`, coverage и Playwright artifacts.
- **Ручная проверка:** нет случайно изменённых/удалённых пользовательских файлов.
- **Критерии готовности:** версии Node.js и pnpm зафиксированы, `packageManager` задан, секреты игнорируются, репозиторий готов к инициализации.
- **Ожидаемый результат:** воспроизводимое окружение.
- **Риски:** несовместимость версии Node; случайная замена неотслеживаемого файла.
- **Ветка / коммит:** `chore/environment-and-repository` / `chore: prepare development environment`.
- **Следующий шаг:** F1-I02.

### F1-I02 — Инициализация Next.js без Tailwind

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** создать минимально запускаемый App Router проект в корне.
- **Входные зависимости:** F1-I01.
- **Задачи:** инициализировать Next.js, React, TypeScript, `src/`, App Router; отключить Tailwind; сохранить только минимальную стартовую страницу; добавить scripts `dev`, `build`, `start`.
- **Предполагаемые файлы:** `package.json`, lockfile, `next.config.*`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, базовые public assets.
- **Компоненты:** корневой layout и временная home page.
- **Данные / БД:** без изменений.
- **Тесты:** запуск dev server, typecheck, production build.
- **Ручная проверка:** главная страница открывается без console/runtime ошибок.
- **Критерии готовности:** проект работает из корня, Tailwind отсутствует, build успешен.
- **Ожидаемый результат:** минимальное Next.js-приложение.
- **Риски:** генератор перезапишет нужные файлы; version drift.
- **Ветка / коммит:** `chore/initialize-next-app` / `chore: initialize Next.js application`.
- **Следующий шаг:** F1-I03.

### F1-I03 — TypeScript, ESLint, форматирование и базовый CI

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** единые локальные и автоматические статические проверки с самого начала.
- **Входные зависимости:** F1-I02.
- **Задачи:** включить strict options; настроить алиас; ESLint Next/React/TypeScript; форматтер; scripts `typecheck`, `lint`, `format:check`; создать GitHub Actions workflow с checkout, установкой Node.js из `.nvmrc`, явной установкой закреплённой pnpm, frozen-lockfile, format/lint/typecheck/build; включить concurrency cancellation; запускать PR в `main` и push в `main`, не дублируя push+PR каждой рабочей ветки.
- **Предполагаемые файлы:** `tsconfig.json`, `eslint.config.*`, `.prettierignore`, `.prettierrc*`, `package.json`, `.github/workflows/ci.yml`.
- **Компоненты:** нет.
- **Данные / БД:** без изменений.
- **Тесты:** локальные typecheck, lint, format check, build; проверка синтаксиса workflow; фактический GitHub run — после разрешённого push.
- **Ручная проверка:** IDE разрешает `@/`, правила не конфликтуют, CI использует те же scripts и версии, что локально.
- **Критерии готовности:** строгий TS и все статические команды проходят; CI-конфигурация воспроизводит проверки без скрытой зависимости от глобального pnpm.
- **Ожидаемый результат:** единый локальный и CI quality baseline.
- **Риски:** слишком шумные правила; несовместимость ESLint; CI не найдёт pnpm без явной установки; фактический внешний запуск невозможен до push.
- **Ветка / коммит:** `chore/code-quality` / `chore: configure code quality tools`.
- **Следующий шаг:** F1-I04.

### F1-I04 — Vitest и React Testing Library

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** возможность тестировать каждый следующий компонент и доменную функцию.
- **Входные зависимости:** F1-I03.
- **Задачи:** настроить jsdom, Testing Library, jest-dom matchers, coverage и test setup; добавить smoke unit/component тесты; расширить существующий CI job командой `pnpm run test:run` после frozen install.
- **Предполагаемые файлы:** `vitest.config.*`, `tests/helpers/setup.ts`, ближайшие `.test.ts(x)`, `package.json`, `.github/workflows/ci.yml`.
- **Компоненты:** временный smoke-компонент или текущая home page.
- **Данные / БД:** без изменений.
- **Тесты:** `test`, `test:run`, `test:coverage`, build.
- **Ручная проверка:** намеренно падающий assertion корректно завершает локальную команду и CI-проверку при доступном run; затем изменение отменяется.
- **Критерии готовности:** тесты находят TypeScript/TSX, DOM matchers работают, coverage генерируется и игнорируется Git, CI выполняет unit/component suite.
- **Ожидаемый результат:** стабильный unit/component harness.
- **Риски:** конфликт окружений node/jsdom.
- **Ветка / коммит:** `chore/unit-test-tooling` / `test: configure Vitest and Testing Library`.
- **Следующий шаг:** F1-I05.

### F1-I05 — Каркас каталогов и публичные границы

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** материализовать структуру без пустых или случайных директорий.
- **Входные зависимости:** F1-I04.
- **Задачи:** создать каталоги по мере добавления index/type placeholders; определить public API слоёв; добавить path conventions; не создавать лишние абстракции.
- **Предполагаемые файлы:** `src/types/index.ts`, `src/constants/index.ts`, `src/lib/utilities/index.ts`, первые `index.ts` слоёв.
- **Компоненты:** нет.
- **Данные / БД:** без изменений.
- **Тесты:** import resolution, typecheck, lint, build.
- **Ручная проверка:** дерево соответствует разделу 5; нет пустых каталогов и циклов.
- **Критерии готовности:** понятные границы и алиасы, страницы не сломаны.
- **Ожидаемый результат:** предсказуемый скелет source tree.
- **Риски:** преждевременные barrels и циклические импорты.
- **Ветка / коммит:** `chore/source-structure` / `chore: establish source structure`.
- **Следующий шаг:** F1-I06.

### F1-I06 — Дизайн-токены и глобальные стили

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** единая визуальная система до разработки UI.
- **Входные зависимости:** F1-I05.
- **Задачи:** reset; semantic/color/typography/spacing/radius/shadow/content/z-index/transition tokens; base document rules; Korean font fallback; focus and reduced motion; dark-token scaffold.
- **Предполагаемые файлы:** `src/styles/reset.css`, `tokens.css`, `globals.css`, `utilities.css`, `src/app/layout.tsx`.
- **Компоненты:** root layout.
- **Данные / БД:** без изменений.
- **Тесты:** CSS imports через build; layout smoke test.
- **Ручная проверка:** шрифты, focus, responsive typography, отсутствие горизонтального scroll.
- **Критерии готовности:** все категории токенов определены, глобальный CSS минимален, inline styles отсутствуют.
- **Ожидаемый результат:** стабильный визуальный фундамент.
- **Риски:** недостаточный контраст; слишком много utilities.
- **Ветка / коммит:** `feature/design-tokens` / `feat: add design tokens and global styles`.
- **Следующий шаг:** F1-I07.

### F1-I07 — Базовые UI-компоненты ввода и действий

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** создать доступные переиспользуемые примитивы.
- **Входные зависимости:** F1-I06.
- **Задачи:** Button, Input, Textarea, Card, Badge; variants/sizes только по реальным потребностям; ref forwarding через React 19 ref-as-prop и нативные props.
- **Предполагаемые файлы:** папки компонентов в `src/components/ui/` с TSX, CSS Module, test и index.
- **Компоненты:** Button, Input, Textarea, Card, Badge.
- **Данные / БД:** без изменений.
- **Тесты:** доступные имена, disabled/error states, keyboard activation, prop forwarding.
- **Ручная проверка:** focus, hover, active, disabled на desktop/mobile.
- **Критерии готовности:** компоненты независимы от домена, покрыты связанными тестами.
- **Ожидаемый результат:** первая UI-библиотека.
- **Риски:** избыточный variants API.
- **Ветка / коммит:** `feature/ui-primitives` / `feat: add core UI primitives`.
- **Следующий шаг:** F1-I08.

### F1-I08 — UI состояния и обратная связь

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** единообразно показывать прогресс и системные состояния.
- **Входные зависимости:** F1-I07.
- **Задачи:** ProgressBar, Spinner, Modal/dialog, EmptyState, Alert/feedback; aria-live conventions; portal only if necessary.
- **Предполагаемые файлы:** соответствующие папки `src/components/ui/` и `src/components/feedback/`.
- **Компоненты:** ProgressBar, Spinner, Modal, EmptyState, Alert.
- **Данные / БД:** без изменений.
- **Тесты:** aria roles/values, focus trap/restore для modal, reduced motion.
- **Ручная проверка:** клавиатура, screen-reader semantics, мобильный viewport.
- **Критерии готовности:** общие состояния покрыты без UI-библиотеки.
- **Ожидаемый результат:** доступные feedback primitives.
- **Риски:** сложность собственного dialog; при необходимости использовать нативный `<dialog>` после проверки поддержки.
- **Ветка / коммит:** `feature/ui-feedback` / `feat: add UI feedback components`.
- **Следующий шаг:** F1-I09.

### F1-I09 — Wrappers и общий layout

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** единая композиция приложения и границы контента.
- **Входные зависимости:** F1-I08.
- **Задачи:** AppShell, PageContainer, ContentSection, AuthBoundary interface, TrainingShell; Header/PageHeader placeholders; metadata и skip link.
- **Предполагаемые файлы:** `src/wrappers/*`, `src/components/layout/*`, `src/app/layout.tsx`.
- **Компоненты:** пять wrappers, Header, PageHeader.
- **Данные / БД:** без изменений; AuthBoundary пока поддерживает гостевой режим.
- **Тесты:** landmark/heading structure, class composition, guest rendering.
- **Ручная проверка:** ширины, отступы и scrolling на узком/широком экране.
- **Критерии готовности:** все страницы могут использовать одну оболочку без бизнес-логики.
- **Ожидаемый результат:** рабочая app shell.
- **Риски:** wrapper nesting; преждевременная auth-связность.
- **Ветка / коммит:** `feature/application-shell` / `feat: add application shell wrappers`.
- **Следующий шаг:** F1-I10.

### F1-I10 — Маршруты и навигация

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** сделать весь будущий MVP обозримым и навигируемым.
- **Входные зависимости:** F1-I09.
- **Задачи:** создать home, topics, module detail, training, session, review, progress, dictionary, login; desktop/mobile navigation; active state; минимальные placeholders.
- **Предполагаемые файлы:** маршруты из раздела 5; `src/components/navigation/*`.
- **Компоненты:** PrimaryNavigation, MobileNavigation, RoutePlaceholder.
- **Данные / БД:** статические nav items.
- **Тесты:** link targets, active state, page render, not-found routing.
- **Ручная проверка:** переход по всем маршрутам, back/forward, direct URL.
- **Критерии готовности:** нет битых внутренних ссылок, каждая страница имеет title/h1.
- **Ожидаемый результат:** сквозная карта приложения.
- **Риски:** дублирование desktop/mobile разметки.
- **Ветка / коммит:** `feature/routes-and-navigation` / `feat: add application routes and navigation`.
- **Следующий шаг:** F1-I11.

### F1-I11 — Мобильная адаптация оболочки

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** подтвердить mobile-first основу до сложной тренировки.
- **Входные зависимости:** F1-I10.
- **Задачи:** responsive nav, safe-area insets, breakpoints, sticky actions where needed, touch targets; устранить overflow; CP-1 visual review.
- **Предполагаемые файлы:** CSS Modules layout/navigation/wrappers, tokens при необходимости.
- **Компоненты:** AppShell, Header, navigation, PageContainer.
- **Данные / БД:** без изменений.
- **Тесты:** component states; позднее e2e viewport matrix.
- **Ручная проверка:** 320/375/768/1280 px, portrait/landscape, zoom 200%.
- **Критерии готовности:** интерфейс без горизонтального scroll, основные действия доступны пальцем/клавиатурой, CP-1 принят.
- **Ожидаемый результат:** адаптивная оболочка.
- **Риски:** iOS safe area и fixed navigation.
- **Ветка / коммит:** `feature/responsive-shell` / `feat: make application shell responsive`.
- **Следующий шаг:** F1-I12.

### F1-I12 — Универсальная модель учебных модулей

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** добавлять темы без изменения общего каркаса.
- **Входные зависимости:** F1-I11.
- **Задачи:** типы module/topic/level/status/version; Zod schemas; ModuleRegistry; локальный sample module; queries/selectors.
- **Предполагаемые файлы:** `src/types/learning.ts`, `src/features/training/domain/*`, `src/lib/validation/*`, tests.
- **Компоненты:** ModuleCard использует общий контракт.
- **Данные / БД:** локальная минимальная фикстура; будущая DB mapping.
- **Тесты:** valid/invalid schema, duplicate slug/id, registry lookup.
- **Ручная проверка:** sample module отображается в topics.
- **Критерии готовности:** общий код не импортирует honorifics, invalid content отклоняется.
- **Ожидаемый результат:** расширяемый реестр модулей.
- **Риски:** расхождение TS и DB; смягчается Zod и mapper.
- **Ветка / коммит:** `feature/module-domain` / `feat: define learning module domain`.
- **Следующий шаг:** F1-I13.

### F1-I13 — Универсальная модель упражнений

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** единый типобезопасный формат всех требуемых упражнений.
- **Входные зависимости:** F1-I12.
- **Задачи:** discriminated union, prompts/media-free content, options, matching pairs, blanks, accepted answers, difficulty, scoring metadata; Zod schemas и versioning.
- **Предполагаемые файлы:** `src/features/training/domain/exercise.ts`, `validation/exerciseSchema.ts`, tests.
- **Компоненты:** нет, только contracts.
- **Данные / БД:** schema-ready DTO; без миграций.
- **Тесты:** каждый subtype; duplicate options; invalid correct refs; empty accepted answers; unknown type/version.
- **Ручная проверка:** representative JSON/TS fixtures читаемы и не дублируют поля.
- **Критерии готовности:** 7 базовых типов представлены исчерпывающим union.
- **Ожидаемый результат:** стабильный exercise contract.
- **Риски:** matching/fill model окажется слишком специфичной; проверить примерами обоих модулей.
- **Ветка / коммит:** `feature/exercise-domain` / `feat: define universal exercise model`.
- **Следующий шаг:** F1-I14.

### F1-I14 — Локальная тестовая база заданий

- **Фаза / статус:** 1 / `done`.
- **Цель и зачем:** развивать движок до Supabase и без зависимости от 높임말.
- **Входные зависимости:** F1-I13.
- **Задачи:** создать небольшой нейтральный sample-набор для всех типов; валидировать при импорте; repository interface и local implementation.
- **Предполагаемые файлы:** `src/features/training/data/*`, `tests/fixtures/exercises.*`, repository tests.
- **Компоненты:** нет.
- **Данные / БД:** 1 sample module, темы и 2–3 задания каждого типа; не production content.
- **Тесты:** весь dataset проходит Zod; уникальность id; ссылки разрешаются.
- **Ручная проверка:** список загружается на topics/training.
- **Критерии готовности:** приложение получает упражнения только через repository interface.
- **Ожидаемый результат:** автономный источник контента.
- **Риски:** фикстуры попадут в production; пометить и заменить в F1-I29.
- **Ветка / коммит:** `feature/local-exercise-repository` / `feat: add local exercise repository`.
- **Следующий шаг:** F1-I15.

### F1-I15 — Детерминированная проверка ответов

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** корректно оценивать ответы независимо от UI и OpenAI.
- **Входные зависимости:** F1-I14.
- **Задачи:** checker registry; choice, matching, fill и базовый free response; exact/normalized comparison; immutable evaluation; reason codes.
- **Предполагаемые файлы:** `src/features/training/domain/evaluation/*`, tests.
- **Компоненты:** нет.
- **Данные / БД:** evaluation DTO; без DB.
- **Тесты:** correct/incorrect, reordered matching, duplicates, whitespace, no mutation, unsupported type.
- **Ручная проверка:** table-driven примеры дают ожидаемые feedback objects.
- **Критерии готовности:** все sample exercises оцениваются исчерпывающе и типобезопасно.
- **Ожидаемый результат:** чистое ядро проверки.
- **Риски:** преждевременная корейская нормализация; специфичные правила оставляются модулю.
- **Ветка / коммит:** `feature/answer-evaluation` / `feat: add deterministic answer evaluation`.
- **Следующий шаг:** F1-I16.

### F1-I16 — Движок тренировочной сессии

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** управлять полным жизненным циклом тренировки вне React.
- **Входные зависимости:** F1-I15.
- **Задачи:** session factory/reducer; queue selection/shuffle с seed; submit/next/complete/abandon; idempotency; score and error summary.
- **Предполагаемые файлы:** `src/features/training/domain/session/*`, factories, tests.
- **Компоненты:** нет.
- **Данные / БД:** in-memory session state.
- **Тесты:** transitions, boundaries, deterministic seed, duplicate submit, completion, empty queue.
- **Ручная проверка:** scripted session проходит от старта до результата.
- **Критерии готовности:** illegal transitions отклоняются, состояние сериализуемо.
- **Ожидаемый результат:** независимый session engine.
- **Риски:** reducer усложнится; сохранить небольшой state machine.
- **Ветка / коммит:** `feature/training-session-engine` / `feat: add training session engine`.
- **Следующий шаг:** F1-I17.

### F1-I17 — Интерактивный экран тренировки

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** дать пользователю пройти все общие типы упражнений.
- **Входные зависимости:** F1-I16.
- **Задачи:** exercise renderer registry; формы choice/free/fill/matching; progress; submit lock; feedback; next; TrainingShell integration.
- **Предполагаемые файлы:** `src/features/training/components/*`, session page, hooks, CSS Modules, tests.
- **Компоненты:** TrainingSession, ExerciseRenderer, ChoiceExercise, TextAnswerExercise, MatchingExercise, ExerciseFeedback.
- **Данные / БД:** работает на local repository.
- **Тесты:** user-event flows для каждого renderer, keyboard use, validation and feedback.
- **Ручная проверка:** полная sample-тренировка на mobile/desktop.
- **Критерии готовности:** каждый тип можно ответить, исправность session state подтверждена.
- **Ожидаемый результат:** первая реально используемая тренировка.
- **Риски:** matching на touch; предусмотреть доступную альтернативу select/list controls.
- **Ветка / коммит:** `feature/training-interface` / `feat: build training session interface`.
- **Следующий шаг:** F1-I17A.

### F1-I17A — Ранний вертикальный срез 높임말

- **Фаза / статус:** 1 / `planned`; архитектурная проверка каркаса, не выпуск модуля.
- **Цель и зачем:** проверить общий тренировочный UI на реальном корейском материале до дальнейшей инфраструктурной работы и полноценного производства контента фазы 2.
- **Входные зависимости:** F1-I17; общие module/exercise contracts и local repository уже работают.
- **Задачи:** создать минимальный draft-модуль `honorifics` через стандартный Module Registry; добавить 8–12 отслеживаемых заданий по 2–3 конструкциям и темам «возраст дедушки/бабушки» и «профессия»; подключить данные через dev-only server composition, не импортируя `tests/fixtures` в production-код; задать набору статус `draft`, явно обозначить preview-назначение в метаданных и исключить его из опубликованной production-выборки; пройти 1–2 тренировки; сразу перенести выявленные изменения UI/контрактов в затронутые карточки плана.
- **Предполагаемые файлы:** `src/modules/honorifics/domain/previewModule.ts`, `src/modules/honorifics/data/previewExercises.ts`, `src/modules/honorifics/validation/*`, ближайшие tests; server-side dev composition в training feature.
- **Компоненты:** использует существующие TrainingSession и renderers без обходного preview-компонента; допустимы только исправления общих компонентов, выявленные реальным контентом.
- **Данные / БД:** versioned local draft; не мигрирует в Supabase и не получает `approved`; в фазе 2 либо проходит формализацию и review, либо заменяется.
- **Тесты:** Zod validation, уникальность id/ссылок, регистрация draft-модуля только в разрешённом окружении, интеграционный start→answer→complete для репрезентативной сессии, production build без публичной доступности draft-набора.
- **Ручная проверка:** пользователь проходит desktop и mobile тренировки и оценивает длину prompts, баланс выбора/ввода, отображение корейского текста и полезность feedback.
- **Критерии готовности:** CP-1A принят; каркас пригоден для реального материала либо найденные проблемы оформлены корректирующей итерацией; draft не доступен в production и не выдаётся за языково утверждённый контент.
- **Ожидаемый результат:** раннее подтверждение продуктового и UI-направления без нарушения слоёв и без одноразового некоммитящегося кода.
- **Риски:** черновой контент может восприниматься как финальный; маркировка и production gate обязательны. Если потребуются специфические правила проверки, они фиксируются для F2, а не встраиваются скрыто в общий engine.
- **Ветка / коммит:** `feature/honorifics-early-slice` / `feat: validate training with draft honorifics content`.
- **Следующий шаг:** F1-I18.

### F1-I18 — Локальное сохранение незавершённой тренировки

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** не терять гостевой прогресс при обновлении страницы.
- **Входные зависимости:** F1-I17A.
- **Задачи:** versioned localStorage adapter; save after transition; hydrate; TTL; corruption fallback; explicit restart/clear; SSR-safe hook.
- **Предполагаемые файлы:** `src/features/training/persistence/*`, hook tests, UI resume prompt.
- **Компоненты:** ResumeTrainingPrompt.
- **Данные / БД:** local key содержит только session state и content version, без секретов/PII.
- **Тесты:** missing/corrupt/expired/wrong-version storage; hydration; clear.
- **Ручная проверка:** refresh и закрытие/открытие возвращают текущий вопрос.
- **Критерии готовности:** восстановление безопасно, несовместимые данные сбрасываются с понятным сообщением.
- **Ожидаемый результат:** надёжная гостевая сессия.
- **Риски:** hydration mismatch и quota.
- **Ветка / коммит:** `feature/local-session-persistence` / `feat: persist active training locally`.
- **Следующий шаг:** F1-I19.

### F1-I19 — Экран результата

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** завершить петлю обучения понятным итогом.
- **Входные зависимости:** F1-I18.
- **Задачи:** score, correct/total, topic breakdown, error list, explanations, retry mistakes/new session actions; clear active local session after success.
- **Предполагаемые файлы:** result components in training feature, route/session page styles/tests.
- **Компоненты:** TrainingResult, ScoreSummary, MistakeSummary, ResultActions.
- **Данные / БД:** derived local result snapshot.
- **Тесты:** all-correct, all-wrong, mixed, empty defensiveness, actions.
- **Ручная проверка:** результат понятен без цвета, back/refresh ведут предсказуемо.
- **Критерии готовности:** итог соответствует attempts и доступны следующие действия.
- **Ожидаемый результат:** законченный локальный learning loop.
- **Риски:** double completion; использовать idempotent engine.
- **Ветка / коммит:** `feature/training-results` / `feat: add training results screen`.
- **Следующий шаг:** F1-I20.

### F1-I20 — Loading, error, not-found и empty states

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** предсказуемое поведение при пограничных состояниях.
- **Входные зависимости:** F1-I19.
- **Задачи:** global/route loading; error boundary reset; 404; no modules/exercises/progress/review; invalid/expired session; safe error messages.
- **Предполагаемые файлы:** `src/app/loading.tsx`, `error.tsx`, `not-found.tsx`, feature state components/tests.
- **Компоненты:** RouteError, LoadingView, feature EmptyState variants.
- **Данные / БД:** error codes, без чувствительных деталей.
- **Тесты:** thrown errors, reset, invalid ids, empty repositories.
- **Ручная проверка:** прямые неверные URL, симуляция пустого набора/ошибки.
- **Критерии готовности:** ни один ожидаемый edge case не даёт белый экран.
- **Ожидаемый результат:** устойчивый интерфейс.
- **Риски:** error boundary требует Client Component.
- **Ветка / коммит:** `feature/application-states` / `feat: add loading error and empty states`.
- **Следующий шаг:** F1-I21.

### F1-I21 — Интеграционные тесты каркаса

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** проверить взаимодействие repository, engine, persistence и UI.
- **Входные зависимости:** F1-I20.
- **Задачи:** factories/helpers; integration cases start→answer→resume→complete→retry; module routing; invalid data; добавить integration script в CI без дублирования unit run; добавить push-триггеры только для двух checkpoint-веток CP-2/CP-5.
- **Предполагаемые файлы:** `tests/integration/*`, `tests/factories/*`, `tests/helpers/*`, `vitest.integration.config.mts`, `package.json`, `.github/workflows/ci.yml`.
- **Компоненты:** тестируются готовые feature boundaries.
- **Данные / БД:** isolated fixtures.
- **Тесты:** happy path, incorrect path, reload, content-version mismatch, no exercises.
- **Ручная проверка:** команды стабильны при повторных запусках.
- **Критерии готовности:** критический локальный путь покрыт без внутренних implementation assertions.
- **Ожидаемый результат:** защита от регрессий между слоями.
- **Риски:** медленные/хрупкие тесты; использовать контролируемые clock/random.
- **Ветка / коммит:** `test/framework-integration` / `test: cover training framework integration`.
- **Следующий шаг:** F1-I22.

### F1-I22 — Playwright и сквозные сценарии

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** проверить приложение в реальном браузере.
- **Входные зависимости:** F1-I21.
- **Задачи:** Playwright config/webServer; desktop/mobile projects; traces/screenshots on failure; smoke navigation and full local training; добавить отдельный CI job для pull request в `main`, ручного запуска и push двух checkpoint-веток; не запускать browser suite на остальных iteration branches.
- **Предполагаемые файлы:** `playwright.config.*`, `tests/e2e/*`, `package.json`, `.gitignore`, `.github/workflows/ci.yml`.
- **Компоненты:** сквозная проверка приложения.
- **Данные / БД:** deterministic local fixtures.
- **Тесты:** navigation, complete session, resume after reload, retry mistakes, 404; Chromium минимум, дополнительный браузер после оценки стоимости CI.
- **Ручная проверка:** headed run и просмотр trace при тестовом падении.
- **Критерии готовности:** e2e повторяемы, не зависят от внешних сервисов и подключены к CI для PR/контрольных запусков.
- **Ожидаемый результат:** browser-level safety net.
- **Риски:** флейки и порт-конфликты.
- **Ветка / коммит:** `test/playwright-setup` / `test: add Playwright end-to-end coverage`.
- **Следующий шаг:** F1-I23.

### F1-I23 — Production build, performance и доступность каркаса

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** принять каркас перед внешним деплоем по локальному gate и внешнему CI checkpoint-ветки.
- **Входные зависимости:** F1-I22.
- **Задачи:** полный local quality run; build/start smoke; bundle and client boundary review; metadata; accessibility audit; console/network errors; после отдельного разрешения push `chore/framework-quality-gate` и зелёный внешний CI; corrective iteration if needed; CP-2.
- **Предполагаемые файлы:** только исправления обнаруженных проблем; scripts при необходимости.
- **Компоненты:** весь каркас.
- **Данные / БД:** local only.
- **Тесты:** typecheck, lint, unit, integration, e2e, build.
- **Ручная проверка:** keyboard-only, 200% zoom, mobile/desktop, production server, Lighthouse как диагностический ориентир.
- **Критерии готовности:** локальные ворота и внешний CI зелёные, нет P0/P1 дефектов, CP-2 принят.
- **Ожидаемый результат:** локально стабильный каркас.
- **Риски:** найденные системные дефекты создадут fix iteration.
- **Ветка / коммит:** `chore/framework-quality-gate` / `chore: verify application framework quality`.
- **Следующий шаг:** F1-I24 после разрешения CP-3.

### F1-I24 — Первый Vercel preview deployment

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** подтвердить реальную сборку и hosting pipeline до Supabase.
- **Входные зависимости:** F1-I23, CP-3, доступ к Vercel.
- **Задачи:** связать проект; задать framework/root и Node `24.x`; подтвердить фактический Node `>=24.18.0 <25` и pnpm `10.34.5` в build log; после CP-3 push `chore/vercel-preview` для Git-integrated preview; проверить URL/logs; не публиковать production без отдельного подтверждения.
- **Предполагаемые файлы:** `.vercelignore` или конфигурация только при реальной необходимости; `.env.example` без секретов.
- **Компоненты:** без изменений.
- **Данные / БД:** local content в preview.
- **Тесты:** Vercel build; e2e smoke против preview при безопасной конфигурации.
- **Ручная проверка:** все маршруты, refresh dynamic route, mobile, console.
- **Критерии готовности:** доступный preview воспроизводит локальное поведение.
- **Ожидаемый результат:** проверенный hosting pipeline.
- **Риски:** несоответствие Node/runtime, публичный тестовый URL.
- **Ветка / коммит:** `chore/vercel-preview` / `chore: configure Vercel preview deployment`.
- **Следующий шаг:** F1-I25.

### F1-I25 — Supabase-проект и клиенты приложения

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** безопасно подключить облачный backend без переноса данных.
- **Входные зависимости:** F1-I24, CP-4, Supabase project credentials.
- **Задачи:** создать/подключить project; local CLI config; env Zod schema; browser/server client factories; cookie strategy; service role только для явно серверных задач и не в MVP browser path.
- **Предполагаемые файлы:** `supabase/config.toml`, `src/lib/supabase/*`, `src/lib/validation/env.ts`, `.env.example`, `.gitignore`.
- **Компоненты:** нет.
- **Данные / БД:** проект пуст; Storage bucket не создаётся.
- **Тесты:** env schema, client factory mocks, missing env behavior, build with documented env classes.
- **Ручная проверка:** health query/local connection без утечки ключей в client bundle/logs.
- **Критерии готовности:** разделены public anon/publishable и server-only secrets.
- **Ожидаемый результат:** безопасный infrastructure boundary.
- **Риски:** устаревшие auth helper patterns; сверить официальную документацию.
- **Ветка / коммит:** `feature/supabase-foundation` / `feat: add Supabase client foundation`.
- **Следующий шаг:** F1-I26.

### F1-I26 — Схема PostgreSQL, миграции и seed

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** материализовать нормализованную модель данных с воспроизводимой историей.
- **Входные зависимости:** F1-I25 и утверждённая модель раздела 13.
- **Задачи:** SQL migrations tables/enums/checks/FKs/indexes/timestamps; updated_at triggers only where needed; deterministic seed for dev; generated DB types; добавить CI job локального reset/migration/seed без production credentials, если поддерживаемая Supabase CLI-схема допускает стабильный запуск на GitHub runner.
- **Предполагаемые файлы:** `supabase/migrations/*`, `supabase/seed/*`, `src/types/database.ts`, `.github/workflows/ci.yml`.
- **Компоненты:** нет.
- **Данные / БД:** все core content/user/training/review/progress/AI-review tables; без production import.
- **Тесты:** reset+apply migrations; constraints; FK/cascade behavior; seed idempotency or clean-reset repeatability.
- **Ручная проверка:** schema diff пуст после повторной генерации; таблицы/индексы соответствуют модели.
- **Критерии готовности:** чистая база создаётся одной последовательностью миграций.
- **Ожидаемый результат:** версионируемая схема.
- **Риски:** чрезмерная JSONB-модель или опасные cascade; проверить каждую связь.
- **Ветка / коммит:** `feature/database-schema` / `feat: add initial database schema`.
- **Следующий шаг:** F1-I27.

### F1-I27 — Row Level Security и проверка доступа

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** запретить межпользовательский доступ и изменение утверждённого контента.
- **Входные зависимости:** F1-I26.
- **Задачи:** enable RLS на всех exposed tables; public read only approved/published content; owner policies для profile/session/attempt/review/progress; запрет client writes в content/AI review; SQL security tests; расширить DB CI job матрицей доступов.
- **Предполагаемые файлы:** новая migration, `tests/integration/supabase/*` или SQL tests, `.github/workflows/ci.yml`.
- **Компоненты:** нет.
- **Данные / БД:** policies, grants, helper functions с безопасным `search_path` при необходимости.
- **Тесты:** anonymous/auth user A/user B/admin-server matrix; select/insert/update/delete; unpublished content hidden.
- **Ручная проверка:** policy inspection и попытки доступа с anon/user tokens.
- **Критерии готовности:** deny-by-default доказан тестами, service role не нужен клиенту.
- **Ожидаемый результат:** изолированные пользовательские данные.
- **Риски:** policy recursion/privilege escalation; минимизировать security-definer functions.
- **Ветка / коммит:** `feature/database-rls` / `feat: secure database with row level security`.
- **Следующий шаг:** F1-I28.

### F1-I28 — Supabase Auth

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** связать пользовательский прогресс с безопасной учётной записью.
- **Входные зависимости:** F1-I27, подтверждённый способ входа.
- **Задачи:** login form; magic link/OTP flow; callback; session refresh; logout; profile bootstrap; protected/optional boundaries; redirect sanitization; guest-to-user UX decision.
- **Предполагаемые файлы:** `src/features/authentication/*`, `src/app/login/page.tsx`, callback route, server/auth utilities, middleware/proxy if required.
- **Компоненты:** LoginForm, UserMenu, AuthBoundary.
- **Данные / БД:** `auth.users` + `profiles`; trigger/function или idempotent server bootstrap.
- **Тесты:** form/schema, safe redirect, unauth/auth boundaries, profile ownership; local auth integration.
- **Ручная проверка:** sign in/out, expired link, refresh, two users, mobile.
- **Критерии готовности:** session поддерживается безопасно, чужие данные недоступны.
- **Ожидаемый результат:** рабочая авторизация.
- **Риски:** email delivery/redirect config; предусмотреть local test user.
- **Ветка / коммит:** `feature/supabase-auth` / `feat: add Supabase authentication`.
- **Следующий шаг:** F1-I29.

### F1-I29 — Перенос учебных данных в Supabase

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** заменить sample/local production source на БД, сохранив offline test fixtures.
- **Входные зависимости:** F1-I28.
- **Задачи:** map local domain↔rows; import validated modules/topics/exercises/options/answers; Supabase repository; cache/revalidation strategy; fallback только для test/dev, не скрывающий production errors.
- **Предполагаемые файлы:** seed/import data, `src/features/training/data/supabase*`, mappers/tests.
- **Компоненты:** topics/training получают repository via server composition.
- **Данные / БД:** утверждённый sample content со статусом `published`; local fixtures остаются тестовыми.
- **Тесты:** mapper roundtrip, repository filters/order, unpublished hidden, invalid payload rejected.
- **Ручная проверка:** каталог и тренировка работают из Supabase; network/error states корректны.
- **Критерии готовности:** production path не зависит от локального контента.
- **Ожидаемый результат:** DB-backed content delivery.
- **Риски:** N+1 и overfetching; использовать ограниченные select и индексы.
- **Ветка / коммит:** `feature/supabase-content` / `feat: load learning content from Supabase`.
- **Следующий шаг:** F1-I30.

### F1-I30 — Сохранение сессий и попыток

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** сохранять историю обучения и синхронизировать авторизованный прогресс.
- **Входные зависимости:** F1-I29.
- **Задачи:** server validated start/answer/complete mutations; idempotency keys; session ownership; accepted snapshot/version; reconcile active local guest session after login by explicit user action.
- **Предполагаемые файлы:** training server functions/actions/route handlers, Zod schemas, repositories, integration tests.
- **Компоненты:** sync status/Retry UI при ошибке сети.
- **Данные / БД:** `training_sessions`, `attempts`, `mistake_events`; transaction/RPC если атомарность нужна.
- **Тесты:** auth, idempotent retry, ownership, invalid answer, concurrent submit, offline recovery.
- **Ручная проверка:** завершение/refresh/two devices; попытки видны только владельцу.
- **Критерии готовности:** ни одна подтверждённая попытка не дублируется и не теряется молча.
- **Ожидаемый результат:** постоянная история тренировок.
- **Риски:** client/server divergence и double-submit.
- **Ветка / коммит:** `feature/persist-training-attempts` / `feat: persist training sessions and attempts`.
- **Следующий шаг:** F1-I31.

### F1-I31 — Система прогресса

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** показать освоение модулей и грамматических тем.
- **Входные зависимости:** F1-I30.
- **Задачи:** progress calculation policy; per-module/topic counts, accuracy, last activity, mastery threshold; incremental update or query; progress page/cards; empty/guest state.
- **Предполагаемые файлы:** `src/features/progress/*`, progress route, DB function/view/migration if justified, tests.
- **Компоненты:** ProgressOverview, ModuleProgressCard, TopicProgressList.
- **Данные / БД:** `user_topic_progress`, `user_module_progress` or derived view per section 13.
- **Тесты:** first attempt, repeated attempt, correction, version changes, user isolation, rendering.
- **Ручная проверка:** показатели совпадают с известной серией ответов.
- **Критерии готовности:** расчёт детерминирован, объясним и не считает незавершённые попытки как завершение.
- **Ожидаемый результат:** полезный экран прогресса.
- **Риски:** misleading mastery; формулу документировать в UI copy/tests.
- **Ветка / коммит:** `feature/learning-progress` / `feat: add learning progress tracking`.
- **Следующий шаг:** F1-I32.

### F1-I32 — Повторение ошибок

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** превращать ошибки в приоритетную очередь повторения.
- **Входные зависимости:** F1-I31.
- **Задачи:** queue policy; upsert on wrong, reschedule on review; status due/mastered/suspended; review page/start session; retry mistakes; empty state.
- **Предполагаемые файлы:** `src/features/review/*`, review route, DB function/migration if needed, tests.
- **Компоненты:** ReviewQueueSummary, StartReviewButton, ReviewResult.
- **Данные / БД:** `review_queue`, links to attempts/exercises, due indexes.
- **Тесты:** enqueue, no duplicate active item, correct reschedule, wrong penalty, deleted/unpublished exercise, RLS.
- **Ручная проверка:** ошибка появляется в review, повтор меняет срок/статус.
- **Критерии готовности:** пользователь получает только свои актуальные due items.
- **Ожидаемый результат:** общий механизм повторения ошибок.
- **Риски:** сложный spaced repetition; MVP использует простые интервалы, формула заменяема.
- **Ветка / коммит:** `feature/error-review` / `feat: add mistake review queue`.
- **Следующий шаг:** F1-I33.

### F1-I33 — Стабилизация рабочего каркаса

- **Фаза / статус:** 1 / `planned`.
- **Цель и зачем:** принять фазу 1 как стабильную платформу для 높임말.
- **Входные зависимости:** F1-I32.
- **Задачи:** удалить dev-only preview 높임말 из F1-I17A и его composition; полный security/quality/data review; schema reset; preview smoke; auth/two-user tests; accessibility/mobile/performance; после отдельного разрешения push `chore/framework-stabilization` и зелёный полный внешний CI; исправления отдельными fix iterations; CP-5.
- **Предполагаемые файлы:** только необходимые исправления и статусы.
- **Компоненты:** весь каркас.
- **Данные / БД:** verify migration/seed/RLS/backups.
- **Тесты:** полный набор unit/integration/e2e/build плюс DB access matrix.
- **Ручная проверка:** guest/auth, desktop/mobile, offline/error, preview deployment.
- **Критерии готовности:** preview-код F1-I17A удалён; критерии раздела 16 выполнены; локальные проверки и внешний CI зелёные; нет P0/P1; CP-5 принят.
- **Ожидаемый результат:** рабочий модульно-независимый каркас.
- **Риски:** инфраструктурные дефекты; фаза 2 не начинается до исправления.
- **Ветка / коммит:** `chore/framework-stabilization` / `chore: stabilize learning application framework`.
- **Следующий шаг:** F2-I01.

## 12. Фаза 2 — модуль 높임말 уровня 1급

Граница содержания: уважительные слова, `N-께서`, `N-께서는`, `V-(으)시-`, `N-(이)시-`, `N-께`. Более сложные речевые уровни и конструкции не добавляются автоматически.

### F2-I01 — Формализация учебных правил

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** превратить область 1급 в проверяемые атомарные правила.
- **Входные зависимости:** F1-I33; утверждённая граница модуля.
- **Задачи:** определить rule ids, форму, значение, ограничения, positive/negative examples, common errors и topic mapping для шести групп.
- **Предполагаемые файлы:** `src/modules/honorifics/domain/*`, `data/rules.*`, Zod schema/tests.
- **Компоненты:** нет.
- **Данные / БД:** module/topic/rule seed draft со статусом `draft`.
- **Тесты:** schema, unique ids, required examples, permitted level.
- **Ручная проверка:** языковая сверка каждого правила.
- **Критерии готовности:** правило однозначно связывается с будущими заданиями и статистикой.
- **Ожидаемый результат:** каноническая карта грамматики.
- **Риски:** выход за 1급 и смешение субъектного/адресатного уважения.
- **Ветка / коммит:** `feature/honorifics-rules` / `feat: define honorifics learning rules`.
- **Следующий шаг:** F2-I02.

### F2-I02 — Словарь модуля

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** создать единый источник лексики для заданий и словаря.
- **Входные зависимости:** F2-I01.
- **Задачи:** собрать слова по темам возраст, семья, профессия, работа, жильё, занятия, еда, сон, здоровье, передача; lemma, POS, значения, usage notes, variants.
- **Предполагаемые файлы:** `src/modules/honorifics/data/dictionary.*`, validation/tests, seed draft.
- **Компоненты:** module dictionary presentation uses general feature.
- **Данные / БД:** `dictionary_entries` draft rows, topic links.
- **Тесты:** unique key, nonempty translations, valid POS/topics, Korean text normalization invariants.
- **Ручная проверка:** русские значения и корейские формы проверены человеком.
- **Критерии готовности:** каждое планируемое задание ссылается на каноническую запись.
- **Ожидаемый результат:** проверяемый двуязычный словарь.
- **Риски:** многозначность и слишком широкий перевод.
- **Ветка / коммит:** `feature/honorifics-dictionary` / `feat: add honorifics module dictionary`.
- **Следующий шаг:** F2-I03.

### F2-I03 — Обычные и уважительные пары

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** явно представить лексические пары и направления упражнений.
- **Входные зависимости:** F2-I02.
- **Задачи:** составить plain↔honorific pairs, scope/context notes, symmetric/asymmetric relation, acceptable variants и counterexamples.
- **Предполагаемые файлы:** `data/honorificPairs.*`, schema/tests, seed draft.
- **Компоненты:** нет.
- **Данные / БД:** `honorific_pairs` rows linked to dictionary.
- **Тесты:** refs exist; no duplicate active pair; both entries Korean; required notes for non-1:1 pairs.
- **Ручная проверка:** носитель/преподаватель подтверждает употребление.
- **Критерии готовности:** пары пригодны для прямого, обратного и matching упражнений.
- **Ожидаемый результат:** канонический набор пар.
- **Риски:** контекстные слова ошибочно представлены как точные синонимы.
- **Ветка / коммит:** `feature/honorifics-word-pairs` / `feat: add plain and honorific word pairs`.
- **Следующий шаг:** F2-I04.

### F2-I04 — Проверенный базовый набор заданий

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** покрыть все правила и темы репрезентативными заданиями до UI-расширений.
- **Входные зависимости:** F2-I03.
- **Задачи:** authoring schema; content ids/version; минимум по каждой конструкции/теме/направлению; explanations/source note/reviewer status; balanced distractors.
- **Предполагаемые файлы:** `data/exercises.*`, validation/tests, seed draft.
- **Компоненты:** нет.
- **Данные / БД:** draft exercises/options/accepted answers/topic links.
- **Тесты:** structural validation, reference integrity, coverage matrix, no duplicate prompt+answer.
- **Ручная проверка:** пройти весь набор как учащийся.
- **Критерии готовности:** нет непокрытых правил; контент ещё не публикуется без review.
- **Ожидаемый результат:** базовый content bank.
- **Риски:** количество без качества; coverage не заменяет языковую проверку.
- **Ветка / коммит:** `feature/honorifics-content-bank` / `feat: add honorifics exercise content bank`.
- **Следующий шаг:** F2-I05.

### F2-I05 — Проверка неоднозначных переводов

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** исключить задания с несколькими неучтёнными правильными ответами.
- **Входные зависимости:** F2-I04.
- **Задачи:** audit translations/distractors; маркировать broad/contextual meanings; добавить accepted variants или переписать prompt; content review records; CP-6.
- **Предполагаемые файлы:** исправления dictionary/pairs/exercises, review seed/tests.
- **Компоненты:** нет.
- **Данные / БД:** `content_reviews`; statuses draft→reviewed→approved только после решения проверяющего.
- **Тесты:** ambiguity checklist completeness; published query excludes unapproved.
- **Ручная проверка:** bilingual review всех meaning-choice items.
- **Критерии готовности:** CP-6 принят, каждый вариант имеет одно объяснимое решение.
- **Ожидаемый результат:** утверждённая лексико-грамматическая база.
- **Риски:** субъективность переводов; хранить review note и версию.
- **Ветка / коммит:** `feature/honorifics-content-review` / `feat: review honorifics translations and content`.
- **Следующий шаг:** F2-I06.

### F2-I06 — Выбор русского значения

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** реализовать тип «корейское слово → русское значение».
- **Входные зависимости:** F2-I05.
- **Задачи:** module adapter/content selector; semantic prompt; plausible same-POS distractors; explanation after answer; shuffle without changing correct ref.
- **Предполагаемые файлы:** module selector/adapter, components only if domain-specific presentation needed, tests/data.
- **Компоненты:** общий ChoiceExercise; возможно KoreanTermPrompt.
- **Данные / БД:** approved meaning-choice exercises.
- **Тесты:** selection, shuffle, correct evaluation, no duplicate labels, topic filters.
- **Ручная проверка:** 20+ random runs, readability and ambiguity.
- **Критерии готовности:** упражнение работает в standalone и mixed-compatible формате.
- **Ожидаемый результат:** первая module-specific практика.
- **Риски:** distractor cues по длине/части речи.
- **Ветка / коммит:** `feature/honorifics-meaning-choice` / `feat: add Korean meaning choice practice`.
- **Следующий шаг:** F2-I07.

### F2-I07 — Выбор уважительного эквивалента

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** тренировать ordinary→honorific vocabulary.
- **Входные зависимости:** F2-I06.
- **Задачи:** pair-based generation/selection; context notes; distractors only from valid vocabulary; explanation of pair.
- **Предполагаемые файлы:** honorific selector, data/tests.
- **Компоненты:** общий ChoiceExercise + optional WordPairExplanation.
- **Данные / БД:** approved `honorific-choice` exercises.
- **Тесты:** pair mapping, distractors, answer and explanation links.
- **Ручная проверка:** все пары встречаются, формы не смешиваются с грамматическими окончаниями.
- **Критерии готовности:** прямое направление покрывает утверждённые пары.
- **Ожидаемый результат:** практика уважительной лексики.
- **Риски:** ложное 1:1 представление; показывать usage note.
- **Ветка / коммит:** `feature/honorifics-forward-choice` / `feat: add honorific word choice practice`.
- **Следующий шаг:** F2-I08.

### F2-I08 — Обратный выбор обычного слова

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** закрепить honorific→ordinary recall.
- **Входные зависимости:** F2-I07.
- **Задачи:** reverse selector; asymmetric pair handling; balanced distribution; same explanation model.
- **Предполагаемые файлы:** reverse selector/data/tests.
- **Компоненты:** переиспользуется ChoiceExercise.
- **Данные / БД:** approved `plain-choice` exercises.
- **Тесты:** reverse mapping, asymmetry, filters and scoring.
- **Ручная проверка:** каждый honorific term имеет корректный prompt/answer.
- **Критерии готовности:** обратное направление не предполагает несуществующую взаимно-однозначность.
- **Ожидаемый результат:** двунаправленное закрепление.
- **Риски:** несколько ordinary equivalents; хранить accepted relation/context.
- **Ветка / коммит:** `feature/honorifics-reverse-choice` / `feat: add reverse honorific word practice`.
- **Следующий шаг:** F2-I09.

### F2-I09 — Сопоставление корейских и русских слов

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** тренировать пакетное узнавание значений.
- **Входные зависимости:** F2-I08.
- **Задачи:** set builder без конфликтующих переводов; responsive accessible interaction; keyboard/select fallback; partial progress without premature answer leakage.
- **Предполагаемые файлы:** module matching selector, general matching component enhancements, CSS/tests.
- **Компоненты:** MatchingExercise, MatchColumn/accessible controls.
- **Данные / БД:** `matching-translation` sets.
- **Тесты:** one-to-one integrity, ordering, keyboard/touch, complete/incomplete submit.
- **Ручная проверка:** mobile touch, keyboard, screen-reader semantics.
- **Критерии готовности:** набор можно завершить без drag-and-drop и без неоднозначности.
- **Ожидаемый результат:** доступное bilingual matching.
- **Риски:** маленький экран; не полагаться только на две широкие колонки.
- **Ветка / коммит:** `feature/honorifics-translation-matching` / `feat: add Korean translation matching`.
- **Следующий шаг:** F2-I10.

### F2-I10 — Сопоставление обычных и уважительных слов

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** тренировать связи vocabulary pairs в наборе.
- **Входные зависимости:** F2-I09.
- **Задачи:** pair set builder; exclude contextual conflicts; pair notes after submit; reuse accessible matching.
- **Предполагаемые файлы:** honorific matching selector/data/tests.
- **Компоненты:** общий MatchingExercise, WordPairExplanation.
- **Данные / БД:** `matching-honorific` sets.
- **Тесты:** relation integrity, no duplicates, evaluation, responsive interaction.
- **Ручная проверка:** все наборы языково корректны.
- **Критерии готовности:** plain/honorific matching работает на keyboard/touch.
- **Ожидаемый результат:** пакетное закрепление пар.
- **Риски:** контекстно спорные пары; исключить из matching или уточнить prompt.
- **Ветка / коммит:** `feature/honorifics-pair-matching` / `feat: add honorific word pair matching`.
- **Следующий шаг:** F2-I11.

### F2-I11 — Заполнение пропуска

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** применять частицы/суффиксы/лексику в контексте.
- **Входные зависимости:** F2-I10.
- **Задачи:** cloze authoring rules; exactly marked blanks; text/choice modes only if justified; accept variants; feedback highlights; coverage six grammar groups.
- **Предполагаемые файлы:** fill-blank data/selector/validation, general renderer refinements, tests.
- **Компоненты:** FillBlankExercise, KoreanSentence.
- **Данные / БД:** approved fill-blank exercises and accepted answers.
- **Тесты:** blank count, answer placement, particle variants only when valid, evaluation/explanation.
- **Ручная проверка:** предложения естественны и дают достаточный контекст.
- **Критерии готовности:** каждая конструкция проверяется без подсказки, раскрывающей ответ.
- **Ожидаемый результат:** контекстная грамматическая практика.
- **Риски:** несколько грамматически верных форм; уточнить контекст/accepted answers.
- **Ветка / коммит:** `feature/honorifics-fill-blank` / `feat: add honorifics fill in the blank practice`.
- **Следующий шаг:** F2-I12.

### F2-I12 — Свободный ответ на корейском

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** перейти от узнавания к самостоятельному формированию ответа.
- **Входные зависимости:** F2-I11.
- **Задачи:** Korean prompt + optional Russian translation; textarea/input choice; exact accepted forms; safe feedback; prompt contexts из заданных тем.
- **Предполагаемые файлы:** free-response data/selector/component enhancements/tests.
- **Компоненты:** FreeResponseExercise, TranslationHint toggle.
- **Данные / БД:** accepted free answers linked to rule/topic.
- **Тесты:** empty submit, multiple authored answers, hint behavior, no answer leak before submit.
- **Ручная проверка:** Korean IME, mobile keyboard, copy/paste, long response.
- **Критерии готовности:** можно ответить и получить детерминированный результат без OpenAI.
- **Ожидаемый результат:** продуктивная практика.
- **Риски:** false negatives; следующие две итерации уменьшают их.
- **Ветка / коммит:** `feature/honorifics-free-response` / `feat: add Korean free response practice`.
- **Следующий шаг:** F2-I13.

### F2-I13 — Нормализация корейского ввода

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** не считать ошибкой технические различия ввода.
- **Входные зависимости:** F2-I12.
- **Задачи:** Unicode NFC; trim/collapse whitespace; configurable punctuation/spacing normalization; не исправлять морфологию; сохранить raw и normalized; module policy.
- **Предполагаемые файлы:** `src/modules/honorifics/domain/normalizeKoreanAnswer.ts`, tests, integration into checker registry.
- **Компоненты:** feedback может показать нормализованный вариант без изменения raw input.
- **Данные / БД:** attempts store raw plus normalized answer.
- **Тесты:** composed/decomposed Hangul, leading/multiple spaces, punctuation policy, meaningful spacing differences, non-Korean text.
- **Ручная проверка:** ввод на macOS/iOS/Android при доступности.
- **Критерии готовности:** только формально эквивалентные варианты совпадают автоматически.
- **Ожидаемый результат:** меньше технических false negatives.
- **Риски:** чрезмерная нормализация примет неверный ответ.
- **Ветка / коммит:** `feature/korean-input-normalization` / `feat: normalize Korean exercise answers`.
- **Следующий шаг:** F2-I14.

### F2-I14 — Несколько допустимых ответов

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** учитывать реально допустимые формулировки без ИИ.
- **Входные зависимости:** F2-I13.
- **Задачи:** accepted answer variants with labels/priority; canonical answer; equivalence tests; reject broad unsafe patterns; content audit for free/fill.
- **Предполагаемые файлы:** accepted-answer domain/data/validation/tests; checker refinement.
- **Компоненты:** правильные варианты перечисляются компактно после ответа.
- **Данные / БД:** `accepted_answers` with normalized value and uniqueness constraints.
- **Тесты:** each variant, duplicate normalized forms, canonical ordering, invalid regex absence.
- **Ручная проверка:** проверяющий подтверждает каждую альтернативу.
- **Критерии готовности:** известные корректные варианты принимаются, неизвестные не принимаются автоматически.
- **Ожидаемый результат:** объяснимая гибкая проверка.
- **Риски:** разрастание вариантов; связывать с review/version.
- **Ветка / коммит:** `feature/honorifics-accepted-answers` / `feat: support accepted honorifics answers`.
- **Следующий шаг:** F2-I15.

### F2-I15 — Показ объяснений

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** превращать оценку в обучающую обратную связь.
- **Входные зависимости:** F2-I14.
- **Задачи:** structured explanation: rule, why correct, why common distractor wrong, example; progressive disclosure; links to topic; never expose answer before submit.
- **Предполагаемые файлы:** explanation schema/data, `HonorificsExplanation/`, feedback integration/tests.
- **Компоненты:** HonorificsExplanation, RuleReference.
- **Данные / БД:** explanation fields/version/review status.
- **Тесты:** correct/incorrect/distractor-specific rendering, missing optional notes, accessibility.
- **Ручная проверка:** объяснения краткие, корректные и соответствуют 1급.
- **Критерии готовности:** каждое published exercise имеет минимум общее объяснение.
- **Ожидаемый результат:** понятная учебная обратная связь.
- **Риски:** слишком длинный UI или неутверждённое объяснение.
- **Ветка / коммит:** `feature/honorifics-explanations` / `feat: add honorifics answer explanations`.
- **Следующий шаг:** F2-I16.

### F2-I16 — Смешанная тренировка

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** чередовать recall, recognition и grammar application.
- **Входные зависимости:** F2-I15.
- **Задачи:** configurable mix; minimum type/topic coverage; seeded random; avoid immediate duplicate concepts; user start UI; graceful shortage handling.
- **Предполагаемые файлы:** module mixed-session builder, start controls/tests.
- **Компоненты:** TrainingConfigurator, ExerciseTypeFilter.
- **Данные / БД:** session config stores mode/types/topics/content version.
- **Тесты:** distribution constraints, shortage, deterministic seed, filters, completion.
- **Ручная проверка:** несколько сессий ощущаются разнообразными и завершаются.
- **Критерии готовности:** все 7 renderer types могут участвовать в одном общем session engine.
- **Ожидаемый результат:** основной режим модуля.
- **Риски:** случайность даёт перекос; constrained sampler.
- **Ветка / коммит:** `feature/honorifics-mixed-training` / `feat: add mixed honorifics training`.
- **Следующий шаг:** F2-I17.

### F2-I17 — Уровни сложности

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** дать постепенное усложнение в рамках 1급.
- **Входные зависимости:** F2-I16.
- **Задачи:** define `intro|practice|challenge`; rules based on prompt support/type/context/distractors, not higher grammar; filter/config; content audit.
- **Предполагаемые файлы:** difficulty policy/data/selectors/UI/tests.
- **Компоненты:** DifficultySelector, DifficultyBadge.
- **Данные / БД:** exercise difficulty values/index usage.
- **Тесты:** allowed level, filter, mix fallback, no uncovered topic per supported level.
- **Ручная проверка:** сложность различается, но содержание остаётся 1급.
- **Критерии готовности:** каждый уровень описан и имеет достаточный approved pool.
- **Ожидаемый результат:** управляемая сложность.
- **Риски:** subjective labels; привязать к измеримым признакам.
- **Ветка / коммит:** `feature/honorifics-difficulty` / `feat: add honorifics difficulty levels`.
- **Следующий шаг:** F2-I18.

### F2-I18 — Повторение ошибок модуля

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** использовать общий review engine с полезной специализацией 높임말.
- **Входные зависимости:** F2-I17.
- **Задачи:** module-specific reason codes; prioritize rule/word pair; show prior wrong vs accepted; mixed review; CP-7.
- **Предполагаемые файлы:** honorifics error classification, review adapters/components/tests.
- **Компоненты:** HonorificsMistakeContext inside general review.
- **Данные / БД:** mistake metadata includes rule/topic/pair refs; queue stays generic.
- **Тесты:** wrong classification, due selection, corrected answer, repeat failure, user isolation.
- **Ручная проверка:** допустить ошибки каждого типа и пройти review.
- **Критерии готовности:** CP-7 принят; ошибка приводит к релевантному объяснимому повтору.
- **Ожидаемый результат:** замкнутый learning loop модуля.
- **Риски:** duplicate queue items across variants; canonical concept key.
- **Ветка / коммит:** `feature/honorifics-error-review` / `feat: integrate honorifics mistake review`.
- **Следующий шаг:** F2-I19.

### F2-I19 — Статистика по грамматическим конструкциям

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** показать сильные и слабые места по шести правилам.
- **Входные зависимости:** F2-I18.
- **Задачи:** rule metrics attempts/accuracy/recent trend/last practiced; minimum sample messaging; progress UI; avoid ranking when insufficient data.
- **Предполагаемые файлы:** module progress adapter/components, DB query/view/RPC if justified, tests.
- **Компоненты:** GrammarRuleProgress, HonorificsProgressSummary.
- **Данные / БД:** attempts already link topic/rule snapshot; optional aggregate table/view.
- **Тесты:** per-rule attribution, multiple rule exercise policy, zero/small sample, RLS.
- **Ручная проверка:** metrics match controlled session set.
- **Критерии готовности:** показатели объяснимы и не раскрывают чужие данные.
- **Ожидаемый результат:** диагностическая статистика.
- **Риски:** double counting multi-rule items; определить primary rule + secondary tags.
- **Ветка / коммит:** `feature/honorifics-rule-progress` / `feat: add honorifics grammar progress`.
- **Следующий шаг:** F2-I20.

### F2-I20 — Автотесты всех учебных правил

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** доказать полноту правил и корректность evaluator/content links.
- **Входные зависимости:** F2-I19.
- **Задачи:** table-driven positive/negative cases for each rule; conjugation examples in scope; particle distinctions; N-(이)시 split; content coverage; regression set for ambiguity.
- **Предполагаемые файлы:** `src/modules/honorifics/tests/*`, integration/e2e additions.
- **Компоненты:** все module renderers/feedback.
- **Данные / БД:** test fixtures mirror approved content versions.
- **Тесты:** unit rule/normalization/checker, content validation, integration mixed/review/progress, e2e major modes.
- **Ручная проверка:** test matrix reviewed against rule inventory.
- **Критерии готовности:** every rule has correct, common-error and boundary tests; full suite/build green.
- **Ожидаемый результат:** доказуемая техническая корректность.
- **Риски:** tests повторяют ошибочный content; независимый human review остаётся обязательным.
- **Ветка / коммит:** `test/honorifics-rule-coverage` / `test: cover all honorifics learning rules`.
- **Следующий шаг:** F2-I21.

### F2-I21 — Финальная проверка корейского контента

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** не выпускать технически валидный, но языково ошибочный материал.
- **Входные зависимости:** F2-I20 и доступность проверяющего.
- **Задачи:** экспорт review inventory; проверить prompts/answers/translations/distractors/explanations/level/context; записать reviewer/time/decision; исправления как отдельные fix iterations; CP-8.
- **Предполагаемые файлы:** исправления content/seed/tests; без нового документа, если отдельно не запрошен.
- **Компоненты:** визуальная проверка всего контента.
- **Данные / БД:** content_reviews; только approved versions публикуются.
- **Тесты:** повторная validation/coverage/full suite после каждой правки.
- **Ручная проверка:** 100% published items проверены человеком.
- **Критерии готовности:** нет pending/rejected items в release pool; CP-8 принят.
- **Ожидаемый результат:** языково утверждённый контент.
- **Риски:** нет квалифицированного reviewer — итерация блокируется, автопубликации нет.
- **Ветка / коммит:** `chore/honorifics-language-review` / `chore: approve honorifics learning content`.
- **Следующий шаг:** F2-I22.

### F2-I22 — Стабилизация и выпуск v0.1.0

- **Фаза / статус:** 2 / `planned`.
- **Цель и зачем:** выпустить первую стабильную версию MVP с возможностью отката.
- **Входные зависимости:** F2-I21, CP-9, release checklist.
- **Задачи:** freeze content version; full tests/build/security/a11y/mobile; migrations backup/verification; preview acceptance; production deploy; smoke; tag/release only with permission; monitor and rollback decision.
- **Предполагаемые файлы:** version metadata, only required fixes/status updates.
- **Компоненты:** весь MVP.
- **Данные / БД:** approved seed/migrations; backup/PITR status confirmed according to plan tier.
- **Тесты:** complete matrix in section 18 against preview then production smoke.
- **Ручная проверка:** guest/auth full session, resume, review, progress, all honorific modes, two-user isolation.
- **Критерии готовности:** sections 16–19 and checklist 24 satisfied; CP-9; version `v0.1.0` live and rollback ready.
- **Ожидаемый результат:** stable MVP release.
- **Риски:** production-only config/data defects; staged deployment and rollback trigger.
- **Ветка / коммит:** `chore/release-v0-1-0` / `chore: prepare v0.1.0 release`.
- **Следующий шаг:** post-release observation; новые возможности планируются отдельно.

## 13. Модель данных Supabase PostgreSQL

Общие правила: UUID primary keys; `created_at timestamptz not null default now()`; `updated_at` только для изменяемых сущностей; удаление учебного контента преимущественно soft/status-based; пользовательские timestamps задаются сервером; все client-visible таблицы имеют RLS. Контент имеет стабильный logical id и `content_version`, чтобы старые попытки оставались объяснимыми после обновления.

### 13.1. Пользователи и профили

**`auth.users`** — управляется Supabase Auth. Основные поля поставщика: id, email/provider metadata, timestamps. Не дублируется в public schema. Доступ через Auth API и server session.

**`profiles`** — пользовательские настройки.

- Поля: `user_id uuid PK/FK auth.users`, `display_name text null`, `preferred_language text not null default 'ru'`, `timezone text null`, `created_at`, `updated_at`.
- Ограничения: длина display name; whitelist locale; один профиль на пользователя.
- Индексы: PK достаточно; индекс по normalized display name только если появится поиск, не в MVP.
- Связи: 1:1 user; 1:N со всеми user-owned сущностями через user id.
- RLS: пользователь читает/обновляет/создаёт только строку `user_id = auth.uid()`; anon — нет; удаление через управляемый account flow, не прямой browser delete.

### 13.2. Учебный контент

**`learning_modules`** — модуль, например `honorifics`.

- Поля: `id`, `slug`, `level`, `title_ko`, `title_ru`, `description_ru`, `status draft|reviewed|published|archived`, `content_version`, `sort_order`, timestamps.
- Ограничения/индексы: unique slug; unique `(slug, content_version)` если версии отдельными rows; check sort/order/version; index `(status, sort_order)`.
- Связи: 1:N topics/exercises/dictionary; прогресс.
- RLS: anon/auth SELECT только `published`; client writes запрещены; server/admin workflow создаёт/изменяет.

**`grammar_topics`** — атомарная грамматическая тема/правило.

- Поля: `id`, `module_id`, `code`, `title`, `summary_ru`, `rule_payload jsonb`, `level`, `status`, `sort_order`, `content_version`, timestamps.
- Обязательность: module/code/title/rule/status/version обязательны.
- Ограничения/индексы: unique `(module_id, code, content_version)`; FK module restrict/archive; index `(module_id, status, sort_order)`; JSON schema валидируется сервером Zod, важные query fields не прячутся в JSONB.
- RLS: SELECT только если topic и module опубликованы; client writes запрещены.

**`dictionary_entries`** — каноническая лексема и русские значения.

- Поля: `id`, `module_id`, `lemma_ko`, `normalized_lemma_ko`, `part_of_speech`, `meanings_ru jsonb`, `usage_note_ru null`, `status`, `content_version`, timestamps.
- Ограничения/индексы: nonempty meanings; unique `(module_id, normalized_lemma_ko, part_of_speech, content_version)`; indexes module/status и normalized lemma; GIN только при доказанной потребности поиска.
- Связи: пары, exercise refs через junction/payload mapper.
- RLS: published read; no client writes.

**`honorific_pairs`** — связь обычной и уважительной лексемы.

- Поля: `id`, `module_id`, `plain_entry_id`, `honorific_entry_id`, `relation_type exact|contextual`, `usage_note_ru`, `status`, `content_version`, timestamps.
- Ограничения/индексы: plain ≠ honorific; unique active/version pair; оба entries должны принадлежать module (проверяется transaction/function); indexes по обоим entry id и module/status.
- RLS: published read через published module/pair; no client writes.

**`exercises`** — версия задания и общий payload.

- Поля: `id`, `logical_id`, `module_id`, `primary_topic_id`, `type`, `difficulty`, `prompt_ko`, `prompt_ru null`, `payload jsonb`, `explanation_ru`, `status draft|reviewed|approved|rejected|archived`, `content_version`, `source manual|ai`, `source_generation_id uuid null unique`, timestamps.
- Ограничения/индексы: unique `(logical_id, content_version)`; allowed type/difficulty/status; approved requires explanation and approved review той же версии; `source_generation_id` обязателен только для промоутированного AI-кандидата и должен быть null для manual; indexes `(module_id,status,type,difficulty)`, primary topic, logical id.
- Связи: N:M topics через `exercise_topics`; 1:N options/answers/attempts/reviews; optional односторонняя FK `source_generation_id → generated_exercises.id` без дублирующей обратной ссылки.
- RLS: anon/auth SELECT только `approved` в published module; client write запрещён.

**`exercise_topics`** — secondary topic coverage.

- Поля: `exercise_id`, `topic_id`, `role primary|secondary`.
- Ограничения/индексы: composite PK; consistent module checked server-side; index topic.
- RLS: чтение следует доступности exercise; no client writes.

**`exercise_options`** — варианты choice/matching.

- Поля: `id`, `exercise_id`, `option_key`, `label_ko null`, `label_ru null`, `value_payload jsonb`, `is_correct`, `explanation_ru null`, `sort_order`.
- Ограничения/индексы: unique `(exercise_id, option_key)`; как минимум один label; correctness shape validated against exercise type; index `(exercise_id, sort_order)`.
- RLS: SELECT только с approved exercise. Для предотвращения утечки `is_correct` до ответа публичное чтение идёт через безопасную view/RPC/серверный mapper, не прямым browser select; client writes запрещены.

**`accepted_answers`** — допустимые свободные/blank ответы.

- Поля: `id`, `exercise_id`, `raw_value`, `normalized_value`, `is_canonical`, `variant_note_ru null`, `review_status`, timestamps.
- Ограничения/индексы: unique `(exercise_id, normalized_value)`; ровно один canonical для applicable exercise; index exercise.
- RLS: правильные ответы не выдаются браузеру до submit; доступ через серверную проверку; client writes запрещены.

### 13.3. Тренировки, попытки и ошибки

**`training_sessions`** — запуск тренировки.

- Поля: `id`, `user_id`, `module_id`, `mode`, `difficulty null`, `status active|completed|abandoned`, `exercise_queue uuid[]` или нормализованная `session_exercises`, `current_index`, `content_version`, `random_seed`, `started_at`, `completed_at null`, `last_activity_at`, `idempotency_key`.
- Ограничения/индексы: user required для cloud rows; valid timestamps/index; unique `(user_id,idempotency_key)`; indexes `(user_id,status,last_activity_at desc)`, module.
- RLS: владелец CRUD только своих rows; module must be readable; updates ограничиваются валидным server mutation path.

**`session_exercises`** (предпочтительнее array при необходимости запросов) — фиксированная очередь.

- Поля: `session_id`, `exercise_id`, `position`, `exercise_version`, `snapshot_payload` при необходимости исторической воспроизводимости.
- Ограничения/индексы: PK `(session_id, position)`, unique `(session_id,exercise_id,position)`, nonnegative position.
- RLS: следует владению session.

**`attempts`** — одна подтверждённая отправка ответа.

- Поля: `id`, `session_id`, `user_id`, `exercise_id`, `attempt_number`, `raw_answer jsonb`, `normalized_answer jsonb`, `is_correct`, `score`, `reason_code`, `answer_version`, `idempotency_key`, `answered_at`, `duration_ms null`.
- Ограничения/индексы: score range; user equals session owner enforced server-side; unique `(user_id,idempotency_key)`; indexes session/order, `(user_id,exercise_id,answered_at desc)`, wrong attempts partial index.
- RLS: владелец SELECT/INSERT через validated server path; UPDATE/DELETE запрещены клиенту для целостности истории.

**`mistake_events`** — нормализованное событие ошибки для аналитики/review.

- Поля: `id`, `attempt_id unique`, `user_id`, `exercise_id`, `module_id`, `primary_topic_id`, `concept_key`, `error_type`, `created_at`.
- Ограничения/индексы: создаётся только для incorrect attempt; indexes `(user_id,created_at desc)`, `(user_id,concept_key)`.
- RLS: владелец SELECT; insert only trusted transaction/server; no update/delete browser.

**`review_queue`** — текущее состояние повторения концепта/задания.

- Поля: `id`, `user_id`, `module_id`, `exercise_id null`, `concept_key`, `status due|scheduled|mastered|suspended`, `due_at`, `interval_stage`, `consecutive_correct`, `last_attempt_id`, timestamps.
- Ограничения/индексы: unique `(user_id,module_id,concept_key)`; nonnegative counters; indexes `(user_id,status,due_at)`, exercise.
- RLS: владелец SELECT; mutation через server/RPC, чтобы очередь и attempt менялись атомарно.

### 13.4. Прогресс

**`user_topic_progress`** — материализованный текущий срез по теме.

- Поля: `user_id`, `topic_id`, `attempts_count`, `correct_count`, `accuracy`, `mastery_status not_started|learning|practiced`, `last_practiced_at`, `content_version`, `updated_at`.
- Ограничения/индексы: PK `(user_id,topic_id)`; counts/ranges consistent; index `(user_id,last_practiced_at desc)`.
- RLS: владелец SELECT; update only trusted function triggered by completed attempt.

**`user_module_progress`** — агрегат для каталога/overview.

- Поля: `user_id`, `module_id`, counts, `accuracy`, `completed_sessions`, `mastery_status`, `last_practiced_at`, `updated_at`.
- Ограничения/индексы: PK `(user_id,module_id)`; range checks.
- RLS: владелец SELECT; update trusted function. Если производительность позволяет, заменить view/query и не хранить дублирующий агрегат; решение принимается по измерениям F1-I31.

### 13.5. ИИ-контент и история проверки

**`ai_generation_requests`** — журнал серверного вызова без секретов.

- Поля: `id`, `requested_by`, `purpose`, `model`, `prompt_template_version`, `input_hash`, `status queued|running|succeeded|failed|timed_out`, `request_count`, `token_input/output null`, `estimated_cost null`, `latency_ms null`, `error_code null`, timestamps.
- Ограничения/индексы: no raw sensitive prompt by default; indexes requester/time/status/input hash; retention policy.
- RLS: обычный клиент не читает; server/admin only.

**`generated_exercises`** — сырой валидированный результат до публикации.

- Поля: `id`, `generation_request_id`, `candidate_payload jsonb`, `schema_version`, `validation_status pending|valid|invalid`, `content_status generated|reviewed|approved|rejected|promoted`, timestamps.
- Ограничения/индексы: promotion only from `approved` and structurally `valid`; index status/time; promoted candidate связывается единственной unique-ссылкой `exercises.source_generation_id`, циклические FK не создаются.
- RLS: no public read/write; reviewers/server only.

Промоушен выполняется транзакционно. Если утверждённый payload переносится без содержательных изменений, создаётся `exercises(source='ai', status='approved')`, а кандидат становится `promoted`. Если при переносе содержание редактируется, упражнение создаётся со статусом `reviewed` и требует финального `approved` для новой версии.

**`content_reviews`** — неизменяемая история решения по версии контента.

- Поля: `id`, `entity_type`, `entity_id`, `content_version`, `reviewer_user_id null`, `reviewer_label`, `decision reviewed|approved|rejected`, `notes`, `created_at`.
- Ограничения/индексы: entity version required; indexes entity/version/time and decision; review does not overwrite history.
- RLS: public не читает notes; trusted reviewer/server inserts; updates/deletes запрещены. Публикация требует последнего допустимого `approved` для той же версии.

## 14. OpenAI API — отложенная опциональная архитектура

Интеграция не входит в 56 итераций MVP и включается отдельным планом. Этот раздел фиксирует только архитектурные ограничения, а не заранее реализуемую AI-инфраструктуру. Базовые задания и свободные ответы работают детерминированно.

- API key — только server environment; route handler/server function никогда не возвращает его клиенту.
- Вход и structured output имеют отдельные Zod-схемы и версию prompt/schema.
- Сначала rate limit per user/IP, дневной budget и максимальные tokens; при превышении — понятный отказ без поломки тренировки.
- Журналируются purpose/model/tokens/cost/status/latency и safe hashes; персональные ответы не попадают в prompt без явной необходимости/политики.
- Таймаут через abort; retry только для транзиентных ошибок и только с idempotency key, ограниченный exponential backoff.
- Кандидат создаётся в `generated_exercises` со статусом `generated`, проходит Zod и контентную проверку, затем `reviewed`/`approved`/`rejected`; после контролируемого переноса получает `promoted`.
- Ни один AI-кандидат не входит в публичную выборку автоматически; публично доступно только созданное из него упражнение с отдельным допустимым статусом.
- Нестандартный свободный ответ может получить AI suggestion, но детерминированная оценка не переписывается молча; пользователь видит, что ответ требует/получил дополнительную проверку.
- Kill switch отключает API без redeploy контента; при таймауте UI продолжает работать и предлагает каноническое объяснение.

## 15. Правила архитектуры

1. Domain functions чистые и тестируемые, React не хранит правила грамматики.
2. Сервер повторно валидирует всё, что пришло из браузера.
3. DB rows не передаются напрямую в UI: mapper формирует domain DTO и исключает правильные ответы до submit.
4. Идентификаторы/версии контента стабильны; попытка хранит версию.
5. Общий engine не знает `honorifics`; модуль не дублирует session/progress/review.
6. Секреты и service role никогда не импортируются в Client Component.
7. Отсутствие сети/ИИ не ломает базовую тренировку.
8. RLS — обязательная граница, а не замена серверной валидации.
9. Абстракция создаётся после второго реального случая или когда явно отделяет volatile infrastructure.
10. Ошибки имеют безопасные коды; внутренние детали остаются в server log.
11. Доступность и mobile поведение входят в критерии готовности компонента.
12. Любое изменение schema — миграция вперёд; ручные production edits запрещены.
13. Происхождение контента (`manual|ai`) не кодируется его жизненным циклом; AI provenance хранится одной односторонней ссылкой.

## 16. Критерии готовности рабочего каркаса

- Все маршруты открываются и имеют корректные loading/error/empty/not-found состояния.
- Общий UI и wrappers доступны с клавиатуры, адаптивны от 320 px и не зависят от 높임말.
- Универсальные module/exercise/session/evaluation contracts валидируются Zod и покрыты тестами.
- Гость может локально начать, возобновить и завершить sample-тренировку, увидеть результат и повторить ошибки.
- Авторизованный пользователь может сохранять сессии/попытки, видеть прогресс и очередь повторения.
- Supabase schema воспроизводится миграциями; RLS two-user/anon tests проходят.
- Preview Vercel работает; секреты отсутствуют в репозитории и client bundle.
- Временный dev-only preview 높임말 из F1-I17A удалён; фаза 2 начинает канонический модуль без параллельного источника данных.
- TypeScript, ESLint, форматирование, unit, component, integration, e2e и production build зелёные.
- Внешние CI-запуски checkpoint-веток CP-2 и CP-5 зелёные.
- Нет известных P0/P1; пользователь принял CP-5.

## 17. Критерии готовности модуля 높임말 и MVP

### Модуль 높임말 готов, когда

- Содержание ограничено заявленным 1급 и покрывает шесть групп правил и заданные бытовые темы.
- Работают девять режимов: free response, meaning choice, два направления пары, два matching, fill blank, mixed и mistake review.
- Корейский ввод нормализуется безопасно; утверждённые альтернативы принимаются.
- Каждое задание имеет правильный ответ, explanation, rule/topic link, difficulty и approved content version.
- Статистика доступна по каждой грамматической конструкции.
- Технические тесты и 100% ручная языковая проверка опубликованного контента завершены.
- Пользователь принял CP-8.

### MVP готов, когда

- Выполнены критерии каркаса и модуля.
- Guest и authenticated happy paths проходят в production-like preview.
- Данные двух пользователей изолированы; создание попыток идемпотентно.
- Миграции, env, deployment и rollback процедуры проверены.
- Production smoke успешен, мониторинг первых ошибок выполнен, есть разрешение CP-9.
- OpenAI не является зависимостью готовности.

## 18. Матрица тестирования

| Область | Unit/component | Integration | E2E | Ручная проверка |
|---|---|---|---|---|
| UI primitives | states, props, a11y roles | — | smoke in pages | focus, contrast, touch |
| Module/exercise schemas | valid/invalid/boundaries | repository mapping | catalog opens | inspect representative content |
| Evaluator | every type and reason | answer→attempt | correct/wrong flows | explanation correctness |
| Session engine | transitions/idempotency | persistence lifecycle | start→resume→complete | refresh/back/offline |
| Auth | validation/redirect | session/profile/RLS | sign in/out where CI secrets allow | expired link, mobile |
| Supabase content | mappers | migration/seed/queries | published content loads | dashboard/schema review |
| Attempts | DTO/idempotency | transaction/RLS/concurrency | authenticated completion | two users/two tabs |
| Progress | calculation boundaries | DB aggregates | progress after session | compare controlled data |
| Review queue | scheduling policy | enqueue/reschedule/RLS | mistake→review | due/empty/retry |
| Korean normalization | Unicode/spacing/punctuation | checker variants | IME answer | macOS/iOS/Android if available |
| 높임말 rules | positive/negative/common error | content coverage | representative each mode | qualified language review |
| Responsive/a11y | semantic components | — | mobile viewport + keyboard | 320/375/768/1280, zoom 200% |
| CI | scripts/config validation | локальный полный gate каждой итерации | push checkpoint-веток CP-2/CP-5 и явные PR | сверка локальных и CI-команд |
| Deployment | env schema | DB smoke | preview smoke | logs, routes, rollback readiness |

Минимальный release suite: `format:check`, `lint`, `typecheck`, unit/component, integration, DB/RLS, Playwright critical paths, `next build`, production-server smoke. Coverage thresholds вводятся после появления осмысленного baseline; высокий процент не заменяет rule/branch cases.

## 19. Definition of Done

Для любой итерации:

- заявленный scope реализован без скрытого расширения;
- acceptance criteria и связанные тесты выполнены;
- typecheck/lint/format/tests/build зелёные;
- ручная проверка из карточки выполнена и зафиксирована в «Статус проекта»;
- нет известных критических ошибок или незадокументированных рисков;
- accessibility/mobile/security/data последствия проверены пропорционально изменению;
- документация не создаётся, кроме явно разрешённых `APPLICATION_PLAN.md` и session snapshot;
- статус обоих файлов обновлён целиком;
- `git diff` проверен, нет секретов/случайных файлов;
- создан один небольшой коммит с указанным смыслом; push/merge только с разрешения.

## 20. Основные риски и меры

- **Качество корейского контента:** schema и тесты не выявят языковую ошибку; обязательны content statuses и человек-проверяющий.
- **Неоднозначный свободный ответ:** canonical + reviewed variants, осторожная normalization, без автоматического AI verdict.
- **Утечка правильных ответов:** server DTO/view исключает flags и accepted answers до submit.
- **RLS ошибка:** deny-by-default и anon/user A/user B тесты для каждой user table.
- **Расхождение local/domain/DB:** Zod schema, mappers, generated DB types, migration reset tests.
- **Двойная отправка:** disabled UI, idempotency keys и unique constraints.
- **Потеря гостевой сессии:** versioned local persistence и явный guest→account import.
- **Флейки e2e:** deterministic fixtures/random/clock, trace on failure, внешние сервисы не нужны core suite.
- **Мобильный matching:** доступная не-drag альтернатива и ранняя проверка 320 px.
- **Рост client bundle:** Server Components default и аудит client boundaries.
- **Затраты/ошибки ИИ:** интеграция выключена; в будущем лимиты, budget, timeouts, review gate.
- **Vendor/runtime changes:** версии фиксируются, официальная документация проверяется перед интеграциями.
- **Деплой/миграция:** backward-compatible migrations, preview first, backup и проверенный rollback.

## 21. Открытые вопросы

1. Разрешено ли заменить текущий неотслеживаемый `package.json` при F1-I01/F1-I02?
2. Подтверждается ли magic link/OTP как основной метод входа MVP?
3. Есть ли уже Vercel/Supabase проекты или их потребуется создать позже?
4. Кто даёт окончательное `approved` корейскому контенту и русским переводам?
5. Нужен ли гостевой режим в production, или тренировки должны требовать входа? Рекомендация: гостевой локальный режим + вход для синхронизации.
6. Допустим ли простой rule-based интервал повторения для MVP? Рекомендация: да; полноценный spaced-repetition алгоритм отложить.
7. Должен ли русский перевод вопроса быть показан сразу или по кнопке? Рекомендация: на `intro` сразу, на `practice/challenge` по кнопке.
8. Нужны ли приватные preview deployments? Решается перед CP-3.

## 22. Отложенные возможности

- OpenAI генерация/проверка по архитектуре раздела 14.
- Полная тёмная тема и выбор темы.
- Расширенный spaced repetition и персональная адаптация сложности.
- Аудио/произношение/голосовое распознавание.
- Админский authoring UI; до него контент проходит versioned seed/import workflow.
- Supabase Storage, если появятся аудио/пользовательские файлы.
- Дополнительные уровни и модули; социальные/платные функции только отдельным product decision.
- PWA/offline cache, native clients, background jobs/Railway — только при подтверждённой необходимости.

## 23. Порядок деплоя и отката

### Деплой

1. Завершить iteration DoD и проверить чистый diff/секреты.
2. Применить миграции в локальной чистой базе, затем staging/preview Supabase при наличии; выполнить schema/RLS tests.
3. Создать Vercel preview из ветки; использовать preview env, не production secrets без необходимости.
4. Выполнить full automated suite и ручной smoke по preview.
5. Получить контрольное подтверждение пользователя.
6. Для production: подтвердить backup/PITR, применить backward-compatible migration, затем deploy приложения.
7. Выполнить smoke: home/topics/login/training/submit/result/review/progress и two-user isolation выборочно.
8. Проверить build/runtime/auth/database logs и error rate; зафиксировать статус.

### Откат неудачного изменения

1. Остановить дальнейший rollout и определить: app, config, content или DB.
2. App/config: продвинуть последний успешный immutable Vercel deployment или revert-коммит новой веткой; не переписывать историю.
3. Content: снять проблемную version со статуса `approved/published`, вернуть предыдущую approved version.
4. DB: предпочитать forward-fix migration. Destructive down migration допустима только после backup, оценки данных и явного подтверждения.
5. При несовместимой новой схеме сначала развернуть совместимую версию приложения; затем безопасную corrective migration.
6. Повторить smoke/RLS проверки, проверить целостность attempts/progress/review.
7. Обновить текущий статус и создать корректирующую итерацию; отдельный postmortem-документ только по запросу.

Триггеры отката: невозможность входа/тренировки, потеря/дублирование попыток, нарушение RLS, массовые 5xx, неверный опубликованный учебный ответ или несовместимая миграция.

## 24. Чек-лист выпуска v0.1.0

- [ ] CP-5, CP-8 и CP-9 подтверждены.
- [ ] Scope соответствует MVP; higher-level grammar не попала в release pool.
- [ ] Все published exercises имеют approved review той же версии.
- [ ] Нет открытых P0/P1; P2 явно приняты или исправлены.
- [ ] `format:check`, lint, typecheck, unit/component/integration/DB/RLS/e2e проходят.
- [ ] CI использует закреплённые Node.js/pnpm, frozen lockfile и успешно выполняет release jobs.
- [ ] Production build и start smoke проходят на зафиксированной Node LTS.
- [ ] Миграции применяются с чистого состояния; schema diff ожидаем.
- [ ] RLS проверена для anon, user A, user B и trusted server.
- [ ] Секреты отсутствуют в Git, browser bundle и пользовательских ошибках.
- [ ] Guest/auth start→answer→resume→complete→result работает.
- [ ] Review queue и progress обновляются корректно.
- [ ] Все девять режимов 높임말 проверены.
- [ ] Korean IME, Unicode normalization и допустимые ответы проверены.
- [ ] 320/375/768/1280 px, keyboard-only, zoom 200%, reduced motion и контраст проверены.
- [ ] Preview принят; env/auth redirect URLs соответствуют production.
- [ ] Backup/PITR и rollback target подтверждены.
- [ ] Production deployment выполнен только после разрешения.
- [ ] Production smoke и первичная проверка logs успешны.
- [ ] `APPLICATION_PLAN.md` и `.Codex/sessions/current.md` актуальны.
- [ ] Коммит выпуска создан; тег `v0.1.0` и push выполняются только с разрешения.
