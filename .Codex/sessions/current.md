# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-09

## Чем занимаемся

F2-I10 выполнен. Следующая карточка — F2-I11 (theme/grammar detail pages).

## F2-I10 — результат

- `/topics` принимает `?view=themes|grammar` (unknown → themes)
- Кастомный segmented/tab control (`CatalogViewSwitch`) без native `<select>`
- Themes: compact `UnitSummaryCard` из `getCachedPublicUnits`
- Grammar: grouping по уроку/category (`GrammarCatalogList`)
- Loading/error/empty через существующие feedback states
- Counts только из published/approved public DTO
- Tests: parse/group/switch/page + e2e navigation back/forward

## Коммит / ветка

- Branch: `codex/f2-i10-dual-catalog`
- Commit: `feat: add theme and grammar catalogs`

## Следующий шаг

F2-I11 — curriculum detail pages.
