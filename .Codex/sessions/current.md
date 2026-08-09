# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F2-I09 выполнен. Следующая карточка — F2-I10 (dual catalog).

## F2-I09 — результат

- `src/features/catalog|dictionary|reading` — repositories + public DTOs
- Local published fixture (не импортирует `content/phase-2` в app graph)
- Supabase adapters: только `published` / `approved`; options через `exercise_options_public`
- `resolveCurriculumContent` / `cachedCurriculumContent`
- Public shape asserts forbid correct flags / provenance hashes
- Integration parity: local fixture ≡ supabase-fixture adapter

## Коммит / ветка

- Branch: `codex/f2-i09-content-repositories`
- Commit: `feat: add curriculum content repositories`

## Следующий шаг

F2-I10 — theme and grammar catalogs.
