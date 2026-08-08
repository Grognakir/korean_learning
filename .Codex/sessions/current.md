# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

UI polish каталогов/home закрыт на `fix/topics-modules-grid`. F1-I23 CI зелёный. План остановлен на **CP-2**.

## Принятые решения

- CP-1A принят.
- F1-I23 CI: https://github.com/Grognakir/korean_learning/actions/runs/31256971883
- Page top padding: `3.75rem` (60px) на всех app pages.
- Без section eyebrows на основных экранах.
- Сетки каталогов: 1→2→3, 1–2 карточки слева.
- Dictionary как progress/review empty state.

## Открытые задачи

- [ ] Пользователь: **CP-2 принят** (закрывает F1-I23).
- [ ] После CP-2: F1-I24 только при отдельном **CP-3** (Vercel).
- [ ] Опционально: push `fix/topics-modules-grid`.

## Контекст

Ветка: `fix/topics-modules-grid` (17 коммитов поверх `ff2411b`).
Следующая карточка: F1-I24 `chore/vercel-preview` — blocked до CP-2 + CP-3.
