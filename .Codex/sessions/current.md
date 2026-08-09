# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F2-I03 выполнен. F2-I01–I02 уже в `main`. Следующая карточка — F2-I04.

## F2-I03 — результат

- Migration `20260809000010_curriculum_skills_schema.sql`
- Enums: `learning_skill`, `single-choice`, review entity types for passage/source
- Tables: `reading_passages`, `dictionary_entry_modules`, `exercise_dictionary_entries`, `content_sources`, `content_provenance`, `user_skill_progress`
- Sample backfill via seed: topic `logical_id`, exercises `learning_skill=grammar`
- RLS: published passages public; sources/provenance service-only; skill progress owner-select

## Gate

- db 20, rls 13, unit 310, content 15, integration 17, e2e 20, build green

## Коммит / ветка

- Branch: `codex/f2-i03-curriculum-schema`
- Commit: `feat: extend database for curriculum skills`

## Следующий шаг

F2-I04 — 16 units + 80 grammar topics. Push/merge по указанию пользователя.
