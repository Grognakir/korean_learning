# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

Реализована PERF-I09 (Cache Components + cached loaders + static shell + локальные Suspense) на ветке `feature/perf-i09-cache-navigation`. Локальный gate пройден; deploy и удалённая приёмка — следующий шаг.

## Принятые решения

- `cacheComponents: true`, `partialPrefetching: true`, `cacheLife.learningContent` в `next.config.ts`.
- Узкие cached loaders в `src/modules/cachedLearningContent.ts` (`"use cache"` + `cacheTag`).
- Корневой `src/app/loading.tsx` удалён; локальные skeleton через `CatalogSectionSkeleton`.
- `dynamicParams = false` снят с `[moduleSlug]` и `[sessionId]` — несовместим с Cache Components; 404 через `notFound()` в panel-компонентах.
- `revalidatePath("/progress")` в complete route для свежести прогресса после тренировки.
- Playwright `tests/e2e/navigation-repeat.spec.ts`: повторная навигация без «Загрузка страницы…» — 4/4 passed (desktop + mobile).

## Локальный gate (2026-08-09)

- `next build`: public routes `◐ Partial Prerender` (не `ƒ Dynamic` целиком из-за cookies).
- Unit/integration: 278 + 17 tests passed.
- E2E navigation-repeat: 4 passed.
- Bundle budgets: green (~159 KB gzip для `/topics`, `/training`).
- Lint + typecheck: green.

## Открытые задачи

- [ ] Commit + push ветки `feature/perf-i09-cache-navigation`, merge в `main`.
- [ ] Vercel redeploy; проверить Preview без «Сервис недоступен» на `/topics`, `/training`.
- [ ] Удалённый navigation gate (10 циклов desktop/mobile, median/p95).
- [ ] PERF-I08 remote smoke через `scripts/performance-smoke.mts`.
- [ ] PERF-I00: подтвердить Production 200 после deploy с env + новым кодом.

## Контекст для следующей сессии

Build matrix после PERF-I09: `/`, `/topics`, `/training`, `/progress`, `/review`, `/dictionary`, `/login` — `◐` с revalidate 5m / expire 1d для content routes. API routes и `/auth/callback` остаются `ƒ Dynamic`. Preview URL для commit `5f716e9`: `korean-learning-i1yc48naj-grognakirs-projects.vercel.app`; после merge нужен новый deployment SHA.
