# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-10

## Чем занимаемся

F2-FIX-01 завершена: исправлены регрессии закрытых итераций и документационный дрейф перед CP-7. F2-I21 не начата; проект остаётся на пользовательской контрольной точке CP-7.

## Принятые решения

- Source comparison 93/92/90 хранится и тестируется как принятый audit baseline; runtime не перечитывает исходные локальные расшифровки.
- Производные количества 803/731/179 остаются справочным audit baseline при `artifactsPresent: false`.
- Спекулятивный запас контента до языковой проверки не создаётся; дефицит после F2-I22 закрывается отдельной `F2-FIX-*` карточкой.
- Catalog tabs используют настоящие ссылки с `replace`, поэтому работают до гидратации и сохраняют клавиатурную семантику.
- Server content loaders используют прямые импорты вместо общего training barrel; `/review` уменьшен со 161 до 15 КБ gzip.

## Открытые задачи

- [ ] Пользователю принять CP-7: оба catalog views и три skill flows на целевых ширинах.
- [ ] После явного принятия CP-7 начать только F2-I21.

## Контекст для следующей сессии

Ветка `codex/f2-fix-pre-quality-gate`. Исправлены integration mock, идемпотентность `accepted_answers`, DB/content counts, разделение 100 exam + 48 baseline reading exercises, E2E history/selectors, pre-hydration tabs и client bundle leakage. Два последовательных полных gate зелёные: format/lint/typecheck, unit 358/358, content 38/38, integration 19/19, DB 24/24, RLS 13/13, E2E 34/34, build, bundle budgets и performance smoke. Следующий шаг — только CP-7, не F2-I21 без подтверждения.
