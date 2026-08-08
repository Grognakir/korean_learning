# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-08

## Чем занимаемся

F1-I23 локально и в CI зелёный. UI polish каталогов на `fix/topics-modules-grid` (поверх quality-gate). Ждём явное CP-2. F1-I24 не начинать без CP-2 и CP-3.

## Принятые решения

- CP-1A принят.
- F1-I23: push выполнен; CI success — https://github.com/Grognakir/korean_learning/actions/runs/31256971883
- Каталожные сетки: 1→2→3 колонки, 1–2 карточки слева.
- Home: компактный hero, без section blurb, tighter vertical rhythm.
- Dictionary: тот же PageHeader + empty state, что progress/review.
- Единый меньший gap header→content на основных экранах.

## Открытые задачи

- [ ] Пользователь: **CP-2 принят**.
- [ ] После CP-2: F1-I24 только при отдельном **CP-3** (Vercel).
- [ ] При необходимости: push `fix/topics-modules-grid` / влить в checkpoint-ветку.

## Контекст

Ветка: `fix/topics-modules-grid` (от `chore/framework-quality-gate` @ `ff2411b`).
Следующая карточка плана: F1-I24 `chore/vercel-preview` — blocked до CP-2+CP-3.
