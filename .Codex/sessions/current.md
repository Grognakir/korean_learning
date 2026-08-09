# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

PERF-I09 принят локально и удалённо на commit `dcbb774`. После приёмки закрыты две находки: восстановлен реальный HTTP 404 для неизвестных slug и усилен `navigation-repeat.spec.ts`.

## Принятые решения

- `cacheComponents: true`, `partialPrefetching: true`, `cacheLife.learningContent` в `next.config.ts`.
- Узкие cached loaders в `src/modules/cachedLearningContent.ts` (`"use cache"` + `cacheTag`).
- Корневой `src/app/loading.tsx` удалён; локальные skeleton через `CatalogSectionSkeleton`.
- `revalidatePath("/progress")` в complete route для свежести прогресса после тренировки.
- `dynamicParams` недоступен вместе с Cache Components, а `notFound()` внутри `Suspense` даёт soft-200. По официальной рекомендации Next.js проверка существования перенесена в Proxy: `src/modules/publishedModuleSlugs.ts` (slug-only чтение, in-memory TTL 300 s), `src/modules/resolveRouteExistence.ts` (правила зеркалят `resolveSession`), `src/proxy.ts` (`rewrite("/_not-found", { status: 404 })`, fail-open при сбое контента).
- Пользовательский критерий: первое посещение может показывать локальный skeleton, но повторное посещение обязано открываться из client cache без любого loading.
- `navigation-repeat.spec.ts` теперь ставит `MutationObserver` на `aria-busy` до клика и ждёт стабилизации UI перед замером, поэтому наблюдает весь переход, а не только момент после появления `h1`.

## Удалённая приёмка PERF-I09 (commit `dcbb774`)

- Preview desktop, 10 переходов `/topics` ↔ `/training`: median 81,5 мс, p95 109 мс, root loading 0.
- Preview mobile, 10 переходов: median 86 мс, p95 95 мс, root loading 0.
- Пороги плана `median ≤ 150 мс`, `p95 ≤ 250 мс` выполнены.
- Публичный Production доступен, все девять smoke-маршрутов без 5xx; `/topics` и `/training` больше не показывают «Сервис недоступен».
- Browser console Preview/Production: 0 warnings/errors.

## Локальный gate (2026-08-09)

- `next build`: публичные маршруты `◐ Partial Prerender`.
- Lint + typecheck: green.
- Unit 287 + integration 17: green.
- Playwright 20 tests (desktop + mobile): green; `navigation-repeat` стабилен 5/5 прогонов.
- Bundle budgets: green (~159 KB gzip для `/topics`, `/training`).
- Статусы: `/topics/missing-module`, `/training/missing-session`, `/training/honorifics-preview` → 404 с not-found UI и `noindex`; валидные маршруты → 200.

## Открытые задачи

- [ ] Передеплоить Preview с proxy-проверкой 404 и повторить удалённый smoke: подтвердить 404 на неизвестных slug и отсутствие регресса median/p95.
- [ ] Запускать Playwright через закреплённые Node/pnpm и ставить соответствующий Chromium в CI (локально помогает `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright`).
- [ ] При необходимости исследовать первый прямой `/topics`: Production smoke показал median TTFB 374 мс против примерно 100–112 мс у остальных маршрутов.

## Контекст для следующей сессии

Preview приёмки `dcbb774`: `https://korean-learning-lq3vd4ujg-grognakirs-projects.vercel.app`; публичный Production: `https://korean-learning-gray.vercel.app`. Повторная client navigation на Production `/topics` ↔ `/training`: 62–66 мс без root loading. Proxy теперь выполняет slug-проверку только для `/topics/<slug>` и `/training/<id>`, поэтому остальные маршруты не получили дополнительной работы.
