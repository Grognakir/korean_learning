# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-10

## Чем занимаемся

Corrective stabilization F2-I23 завершена локально. Исправлены связи Supabase, счётчики, кэш недоступности и runtime-контракты учебной сессии; внешняя публикация ещё не выполнялась.

## Принятые решения

- CP-9 и тег `v0.1.0` не подтверждать до исправления найденных P1-дефектов.
- Источник production остаётся Supabase; возврат к локальным фикстурам не использовать как исправление.
- Supabase-адаптеры проверяются на реальных DB-shaped fixtures; двойной Next cache удалён, оставлен request single-flight.
- Approved free-response answers получают `approved`; коды грамматик нормализуются в slug-формат и защищены DB constraint.

## Открытые задачи

- [ ] Получить отдельное разрешение на push/merge и внешние изменения.
- [ ] Применить remote migration `20260810000002` и обновлённый curriculum upsert.
- [ ] Дождаться Vercel deployment и повторить production smoke.
- [ ] После успешного smoke запросить CP-9; тег `v0.1.0` без CP-9 не создавать.

## Контекст для следующей сессии

`main` @ `2d3c1ca`, изменения не закоммичены. Gate: format/lint/typecheck; unit 362; content 44; integration 20; DB 24; RLS 13; E2E 34; local и remote-Supabase production builds; bundle/secret/DTO scans — зелёные. Production-like smoke на текущем remote подтверждает после кода: grammar filter 2 задания, dictionary u01 12 слов, counts 32–38. Учебная сессия безопасно деградирует до «Сервис недоступен», пока remote accepted answers остаются pending; migration `20260810000002` и regenerated seed исправляют это локально и должны быть применены remote перед деплоем.
