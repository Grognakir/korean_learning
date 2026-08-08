# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

F1-I20 завершена: loading / error / not-found / empty states. Следующая итерация — F1-I21 (integration tests), не начинать в этом шаге.

## Принятые решения

- CP-1A принят.
- Next.js 16 `error.tsx` использует `retry` (рекомендовано docs; `reset` оставлен API для спецслучаев).
- Пользовательские сообщения без stack/SQL/env/raw error; `console.error` только в development.
- Неизвестные module/session → `notFound()`.
- Guest progress/review — EmptyState до облака; `ServiceUnavailableState` готов к reuse.

## Открытые задачи

- [ ] Следующая карточка: F1-I21 (`test/framework-integration`) — только по запросу.
- [ ] Не пушить ветку без разрешения.

## Контекст

Ветка: `feature/application-states`.
Gate: 219 tests + build зелёные.
