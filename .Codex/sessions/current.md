# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

PERF-I09 принят локально и удалённо на commit `dcbb774`. Затем закрыты PERF-I10 (сборка не падает при недоступном контент-хранилище) и PERF-I11 (deployment сам сообщает, из какого хранилища взят контент). Блокировка деплоя снята.

## Разблокировка деплоя

- Сборка `9368236` падала на `Collecting page data for /topics/[moduleSlug]`, потому что Supabase отвечал `JWT issued at future`.
- После обновления `SUPABASE_SECRET_KEY` в окружении Vercel ошибка не воспроизводится: Preview-сборка `c945588` с источником Supabase прошла без ошибок, без placeholder `content-unavailable` и без падения.
- Ключи проекта нового формата (`sb_secret_`, `sb_publishable_`) не являются JWT, поэтому к расхождению часов нечувствительны; прежнее сообщение мог выдать только старый ключ вида `eyJ`.

## Почему диагностика заняла шесть сборок

- Локальные production-фикстуры и удалённый Supabase публикуют один и тот же единственный слаг `sample-module`, поэтому таблица маршрутов сборки не различает источники.
- `honorifics` отсутствует в обоих источниках: это локальный draft для `NODE_ENV=development`, намеренно не импортированный в Supabase (`supabase/seed.sql`). Значит `404` на `/topics/honorifics` тоже ничего не доказывает.
- Записи плана о том, что в Supabase опубликован `honorifics`, были фактически неверны и исправлены в PERF-I11. Проверка REST-запросом публикуемым ключом вернула `[{"slug":"sample-module","status":"published"}]`.
- Переменные окружения в Vercel помечены `Sensitive`, поэтому значения не читаются; надёжный приём — удалить строку и смотреть на её отсутствие, а не пытаться свериться со значением.

## PERF-I11 (выполнено локально)

- `describeContentSource(env)` в `src/modules/contentSource.ts` — одна строка без секретов: для Supabase host проекта, для локального источника значение `CONTENT_SOURCE` либо `unset`.
- `scripts/validate-deployment-env.ts` печатает её после успешной валидации, поэтому источник виден в начале каждого build log Vercel.
- `readContent` в `src/modules/cachedLearningContent.ts` логирует `Learning content unavailable: <причина>` перед возвратом `unavailable`: после PERF-I10 сбой становился значением и исчезал из логов полностью.
- Контракт PERF-I10 не изменён: ошибка по-прежнему не пересекает границу `"use cache"`.
- Gate: format/lint/typecheck green, 303 unit, 17 integration, 20 e2e, bundles без изменений (159 KB gzip).

## PERF-I10 (выполнено локально)

Результат спайка: ошибка, брошенная внутри `"use cache"`, роняет билд на пререндере даже если вызывающий компонент её ловит. Как только сбой возвращается значением, сборка с полностью недоступным хранилищем проходит.

- `ContentResult<T>` (`ready` / `unavailable`); `LearningContentError` ловится внутри cached-области, прочие ошибки пробрасываются.
- Условный `cacheLife`: `learningContent` для готового контента, `learningContentUnavailable` (5 s / 15 s / 60 s) для сбоя.
- Потребители переключаются по `status`; `resolveSession` — `ready` / `unknown` / `unavailable`.
- `PLACEHOLDER_MODULE_SLUG = "content-unavailable"` — единственный параметр `generateStaticParams` при пустом или недоступном каталоге. Использовать `honorifics` нельзя: конфликтует с `tests/modules/honorifics-production-build.test.ts`.

## Окружения Vercel

- Production: задано `CONTENT_SOURCE=local`, поэтому публичный сайт отдаёт локальные фикстуры. Противоречит PERF-I00 шаг 3 и PERF-I01 шаг 4.
- Preview: строка `CONTENT_SOURCE` удалена, источник выбирается автоматически и равен `supabase`.
- Для проверки без кеша заведена переменная `VERCEL_FORCE_NO_BUILD_CACHE=1` в окружении Preview — её нужно убрать после приёмки.
- Кнопки «Use existing Build Cache» в диалоге Redeploy у пользователя нет; надёжный способ отключить кеш — именно эта переменная.

## Принятые решения

- `cacheComponents: true`, `partialPrefetching: true`, `cacheLife.learningContent` в `next.config.ts`.
- Узкие cached loaders в `src/modules/cachedLearningContent.ts` (`"use cache"` + `cacheTag`).
- Корневой `src/app/loading.tsx` удалён; локальные skeleton через `CatalogSectionSkeleton`.
- `revalidatePath("/progress")` в complete route.
- `dynamicParams` недоступен вместе с Cache Components, поэтому проверка существования маршрута живёт в Proxy: `publishedModuleSlugs.ts`, `resolveRouteExistence.ts`, `proxy.ts` (`rewrite("/_not-found", { status: 404 })`, fail-open при сбое контента).
- Пользовательский критерий: повторное посещение обязано открываться из client cache без любого loading.

## Тулчейн

- На машине только Node `v22.15.0`; требуемый `.nvmrc` `24.18.0` не установлен, менеджера версий нет. Gate PERF-I11 выполнен на 22.15.0 по явному согласию пользователя, `pnpm` печатает `Unsupported engine`.
- `pnpm` доступен как `corepack pnpm`.
- Playwright: в оболочке агента `PLAYWRIGHT_BROWSERS_PATH` указывает на кеш песочницы, браузеров там нет. Запускать с `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright`.

## Открытые задачи

- [ ] Смерджить накопленные ветки: `preview/verify-supabase-content-source` и `feature/perf-i11-content-source-observability` — требуется явное разрешение пользователя.
- [ ] Проверить на Preview, что build log печатает `Content source: supabase (...)`.
- [ ] Переключить Production на `CONTENT_SOURCE=supabase` и повторить удалённый smoke.
- [ ] Убрать `VERCEL_FORCE_NO_BUILD_CACHE` из окружения Preview после приёмки.
- [ ] При необходимости исследовать первый прямой `/topics`: Production smoke показал median TTFB 374 мс против примерно 100–112 мс у остальных маршрутов.

## Контекст для следующей сессии

Preview приёмки `dcbb774`: `https://korean-learning-lq3vd4ujg-grognakirs-projects.vercel.app`; публичный Production: `https://korean-learning-gray.vercel.app`. Preview-ветка проверки источника: `https://korean-learning-git-preview-verify-s-1900d7-grognakirs-projects.vercel.app` (закрыт Vercel SSO, curl видит только редирект на `vercel.com/sso-api`).
