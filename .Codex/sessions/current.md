# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

F1-I19 завершена: экран результата тренировки. Следующая итерация — F1-I20 (loading/error/empty states), не начинать в этом шаге.

## Принятые решения

- CP-1A принят.
- Result snapshot строится только из completed `TrainingSessionState`.
- «Повторить ошибки» → `mode: "review"` без shuffle (исходный порядок mistake ids).
- После snapshot active localStorage очищается идемпотентно; снимок живёт в состоянии вкладки.
- «Новая тренировка» → `/training`.

## Открытые задачи

- [ ] Следующая карточка: F1-I20 (`feature/application-states`) — только по запросу.
- [ ] Не пушить ветку без разрешения.

## Контекст

Ветка: `feature/training-results` (от `fix/training-modules-grid` → F1-I18).
Gate: 211 tests + build зелёные.
