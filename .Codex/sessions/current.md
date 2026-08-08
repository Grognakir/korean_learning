# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

F1-I23: локальный quality gate каркаса выполнен. Итерация `blocked` до push ветки, зелёного внешнего CI и явного CP-2. F1-I24 не начинать.

## Принятые решения

- CP-1A принят.
- `dynamicParams = false` на `/topics/[moduleSlug]` и `/training/[sessionId]` — реальный HTTP 404 вместо soft-200 при streaming/`loading.tsx`.
- Honorifics preview session в `generateStaticParams` только при `NODE_ENV === "development"`.
- Production composition без draft honorifics подтверждена smoke + e2e.
- Metadata `description` добавлены на публичные routes.
- Client boundaries: pages/layouts остаются Server Components; `"use client"` только у interactive UI/hooks/`error.tsx`.

## Открытые задачи

- [ ] Пользователь: разрешить push `chore/framework-quality-gate`.
- [ ] Дождаться зелёного внешнего CI (checks + e2e).
- [ ] Пользователь: принять CP-2 (`CP-2 принят`).
- [ ] Не начинать F1-I24 без CP-2 и отдельного CP-3.

## Контекст

Ветка: `chore/framework-quality-gate`.
Локальный gate: frozen install + 219 unit + 17 integration + 16 e2e + build/start smoke — зелёные.
P0/P1: нет. P2: ручной 200% zoom / Lighthouse не автоматизированы (диагностика, не blocker).
