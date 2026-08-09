# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-10

## Чем занимаемся

F2-I23 полностью развёрнута и проверена в production. Реализация фазы 2 готова к пользовательской приёмке CP-9 и последующему тегу `v0.1.0`.

## Принятые решения

- Тег `v0.1.0` не создавать без явного подтверждения CP-9.
- Источник production остаётся Supabase; возврат к локальным фикстурам не использовать как исправление.
- Канонические точечные exercise ids разрешены доменным валидатором; словарные и читательские задания не обязаны иметь grammar topic.
- Все связанные строки банка загружаются постранично; импорт не разделяет упражнение и его target-связи между транзакциями.
- Migration `20260810000002` и curriculum upsert применены к linked Supabase; production commit — `7520673`.

## Открытые задачи

- [ ] Получить явное подтверждение CP-9 от пользователя.
- [ ] После CP-9 создать тег/release `v0.1.0`.

## Контекст для следующей сессии

`main` @ `7520673`; PR #18 и #19 смержены. Gate: format/lint/typecheck; unit 366; content 46; integration 20; DB 24; RLS 13; E2E 34; local и remote-Supabase production builds; bundle/performance/secret/DTO scans — зелёные. Remote: 16 modules, 80 grammar topics, 192 published dictionary entries/links, 16 passages, 286 approved exercises, runtime violations 0. Production smoke на `https://korean-learning-gray.vercel.app`: topics 16, dictionary u01 12/12, grammar filter 2, session 1/2 работает, Enter и feedback/progress проверены, console errors 0. Следующее действие только после CP-9 — tag/release `v0.1.0`.
