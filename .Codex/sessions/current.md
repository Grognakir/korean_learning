# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F2-I02 выполнен: canonical Zod contracts и provenance graph validation. Следующая карточка — только F2-I03.

## F2-I02 — результат

- `scripts/content/schemas.ts` — manifest/unit/grammar/dictionary/links/passage/exercise/provenance.
- `content/phase-2/source-manifest.json` — 4 canonical sources (`curriculum-*`) без приватных путей.
- Пустые collection JSON (`items: []`) для всех целевых файлов.
- Graph checks: duplicate IDs, dangling refs, lifecycle transitions, approved→provenance, senseKey/homonyms, absolute paths.

## Gate

- content:validate + test:content (15) green
- format / lint / typecheck / unit 310 / integration 17 / build green

## Коммит / ветка

- Branch: `codex/f2-i02-content-contracts`
- Commit message: `feat: define canonical learning content contracts`

## Следующий шаг

F2-I03 — extend database for curriculum skills. Push/merge только по разрешению.
