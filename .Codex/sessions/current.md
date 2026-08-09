# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-10

## Чем занимаемся

F2-I22 выполнен. **Остановка на CP-8** — без подтверждения пользователя F2-I23 не начинать.

## F2-I22 — результат

- Manifest: `content/phase-2/language-review-decisions.json` (576 individual decisions)
- Apply: `scripts/content/apply-language-review.ts` (`pnpm content:language-review`)
- Approved §3.2 minimum: 16 units, 80 grammar, 192 primary senses, 16 passages, 160/64/48 exercises
- Contested explicit (10): `-아/어서` ①/②, `-(으)러`, `-(으)십시오`, blank passages u02/u07/u09, homonyms 다리/배/저
- Left draft: 899 dictionary senses, 162 non-canonical passages, 100 exam reading exercises, 쪽/쭉 lemmas
- Seed regenerated; coverage tests require `approved`

## Коммит / ветка

- Branch: `codex/f2-i22-language-review`
- Commit: `chore: approve baseline level one content`

## Checkpoint

**CP-8:** пользователь подтверждает языковой минимум. После принятия — F2-I23.

## Следующий шаг

После CP-8 — F2-I23 preview/release / CP-9 / tag `v0.1.0`.
