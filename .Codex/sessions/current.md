# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-10

## Чем занимаемся

F2-I23 in progress. CP-8 accepted. Remote curriculum imported; Production `CONTENT_SOURCE=supabase` set; fixing cached curriculum reads (service role) after preview smoke found «Сервис недоступен».

## F2-I23 — сделано

- Local release stabilization merged (#16)
- Remote: migrations pushed, curriculum chunk-import, `sample-module` archived
- Remote counts: 16 published modules, 80 grammar, 192 dict, 16 passages, 272 approved exercises
- Vercel: `CONTENT_SOURCE=supabase` on Production + Preview
- Hotfix branch: curriculum catalog/dictionary/reading use service-role client inside cache (cookie client breaks `"use cache"`)

## Нужно

1. Merge cache fix → production redeploy → smoke matrix
2. **CP-9** then tag `v0.1.0` (do not tag without CP-9)

## Ветка

`codex/f2-i23-curriculum-cache-fix`
