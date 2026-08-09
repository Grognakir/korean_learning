# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-10

## Чем занимаемся

F2-I19 выполнен. Следующая карточка — F2-I20 (responsive/a11y + CP-7 stop).

## F2-I19 — результат

- Concept keys: `skill:targetLogicalId` (+ legacy exercise id fallback)
- Migration: nullable `mistake_events.primary_topic_id`; skill concept resolve; `user_skill_progress` upsert on session complete
- Progress UI: module → skills (bars) → grammar topics
- Review: custom skill/unit filters → create-review-session API
- Intervals unchanged (1/3/7 day)

## Коммит / ветка

- Branch: `codex/f2-i19-skill-progress-review`
- Commit: `feat: track skill progress and review`

## Следующий шаг

F2-I20 — responsive, keyboard, a11y gate; stop at CP-7.
