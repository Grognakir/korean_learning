# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F2-I01 выполнен: baseline content validation для фазы 2. Следующая карточка — только F2-I02, отдельной веткой.

## F2-I01 — результат

- `content/phase-2/source-manifest.json` — минимальный manifest (`schemaVersion=phase-2.v1`, `sources=[]`).
- `pnpm content:validate` — JSON + schema version + запрет импорта `content/phase-2` из `src/`.
- `pnpm test:content` — 5 integrity tests.
- ESLint `no-restricted-imports` для app graph.
- CI checks: `content:validate && test:content`.

## Gate

- format / lint / typecheck green
- unit 310, content 5, integration 17, e2e 20, db 16, rls 10, build green
- sample-module без изменений

## Коммит / ветка

- Branch: `codex/f2-i01-content-baseline`
- Commit message: `chore: prepare phase two content validation`

## Следующий шаг

F2-I02 — canonical content contracts. Не начинать без отдельного шага; push/merge только по разрешению.
