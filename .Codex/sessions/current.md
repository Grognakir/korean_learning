# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-10

## Чем занимаемся

F2-I23 in progress. CP-8 accepted. Local release stabilization done; **remote import / preview / tag blocked on explicit permission + CP-9**.

## F2-I23 — локально сделано

- `sample-module` archived (TS + seed); curriculum is published baseline
- Removed demo link / `demo-session` compat route
- E2E/perf smoke retargeted to filtered curriculum sessions (`filt__*`)
- DB/RLS progress tests use published `u01` ids
- Audit checkpoint → CP-9 pending

## Нужно от пользователя

1. Явное разрешение: remote Supabase migrations (если pending) + curriculum import на linked project
2. Явное разрешение: Vercel preview deploy / smoke
3. После preview — **CP-9** и tag `v0.1.0`

## Ветка

`codex/f2-i23-release-stabilization`

## Коммит (карточка)

`chore: release level one learning curriculum` (после remote/preview или локальный partial — по согласованию)
