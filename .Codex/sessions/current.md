# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

План `docs/PERFORMANCE_AND_VERCEL_FIX_PLAN.md` (PERF-I00—I11) закрыт на Production commit `c262230`. Corrective stabilization завершена; следующий шаг фазы 1 основного плана — F1-I32 (mistake review queue), без перенумерации фаз.

## Итог окружений

- Preview и Production: `Content source: supabase (cyoezrdxqncroflgkyry.supabase.co)` в prebuild.
- Production URL: `https://korean-learning-gray.vercel.app`.
- `CONTENT_SOURCE=supabase` в Production; Preview без явного `CONTENT_SOURCE` (автоопределение).
- `VERCEL_FORCE_NO_BUILD_CACHE` убран после проверки.
- Удалённый каталог: один published модуль `sample-module` (сид). `honorifics` — только local draft для development.

## Удалённый smoke Production (`c262230`)

- Валидные маршруты `200`, контент «Первые шаги в корейском» / `sample-module`, без «Сервис недоступен».
- `/topics/honorifics`, `/topics/missing-module`, `/training/honorifics-preview`, `/training/missing-session` → `404`.
- `PERF_REPEATS=10 pnpm perf:smoke`: median TTFB 98–106 мс; `/topics` 104 мс (было 374 мс).

## PERF-I08 (закрытие)

- `pnpm perf:smoke` — read-only отчёт по `PERF_BASE_URL`.
- `pnpm check:bundles` добавлен в GitHub Actions сразу после `pnpm build`.
- Speed Insights / Web Analytics — только по отдельному разрешению.

## Ключевые решения PERF

- Cache Components + Partial Prefetching; узкие `"use cache"` loaders; без корневого `loading.tsx`.
- `ContentResult` + короткий `learningContentUnavailable` при сбое хранилища (PERF-I10).
- `describeContentSource` в prebuild + лог причины деградации (PERF-I11).
- 404 для неизвестных slug через Proxy rewrite на `/_not-found`.

## Тулчейн агента

- Node на машине агента: `v22.15.0` при требуемом `24.18.0` (согласовано для gate); `corepack pnpm`.
- Playwright: `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright`.

## Открытые задачи

- [ ] F1-I32 — mistake review queue (основной план фазы 1).
- [ ] Опционально: Vercel Speed Insights / Web Analytics по разрешению.
- [ ] Опционально: браузерный client-navigation baseline на Production (PERF-I09 уже принят на Preview).

## Контекст для следующей сессии

Production: `https://korean-learning-gray.vercel.app`. План PERF считать исполненным по §8, кроме опциональной внешней аналитики. Не начинать F1-I32 в той же итерации, что закрытие PERF, без явного запроса.
