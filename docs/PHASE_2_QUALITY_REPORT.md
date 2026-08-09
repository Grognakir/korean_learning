# Phase 2 quality report (F2-I21)

Generated: 2026-08-10  
CP-7: accepted  
Language approval: pending F2-I22 / CP-8  
Speculative spare content: not generated (F2-I21 policy)

## Result

- Status: **passed** (automated technical gate, two consecutive runs)
- P0/P1 technical defects: none found in gate scope
- Curriculum lifecycle status unchanged (banks remain draft/reviewed until F2-I22)

## Gate counts (both passes)

| Layer | Count |
| --- | ---: |
| unit | 358 |
| content | 43 |
| integration | 19 |
| DB | 24 |
| RLS | 13 |
| E2E | 34 (17 desktop + 17 mobile) |

## Pass 2 durations (`pnpm gate:phase-two`)

| Step | Result | Duration ms |
| --- | --- | ---: |
| format | pass | 4760 |
| lint | pass | 6611 |
| typecheck | pass | 2153 |
| unit | pass | 19798 |
| content-validate | pass | 583 |
| content-audit | pass | 962 |
| content-tests | pass | 1091 |
| scan-secrets | pass | 585 |
| scan-dto | pass | 580 |
| integration | pass | 2326 |
| build | pass | 5234 |
| bundles | pass | 466 |

Pass 1 additionally green for: DB reset/upgrade + RLS matrix, full Playwright, `perf:smoke`.

## Content status snapshot

- units: 16 draft
- grammar topics: 80 draft
- dictionary entries: mostly draft + reviewed minimum bank links
- reading passages: 178 not approved for publication (canonical bank present; exam imports remain draft)
- reading exercises: 148 (100 exam draft + 48 baseline bank)
- Absolute local path hits: 0

## §3.2 minimum coverage (eligibility)

Structural publishable minimum confirmed by `phase-two-minimum-coverage.test.ts`:

- 16 units, 80 grammar topics
- ≥2 grammar exercises/topic (recognition + application)
- ≥12 reviewed senses/unit, ≥4 vocabulary exercises/unit
- ≥1 passage + ≥3 reading exercises/unit
- explanations present on eligible bank exercises

Approved publication remains F2-I22.

## Bundle budgets (gzip)

- `/dictionary`: 15 KB / 150 KB
- `/review`: 15 KB / 150 KB
- `/topics`: 15 KB / 180 KB
- `/training`: 150 KB / 180 KB
- `/training/[sessionId]`: 92 KB / 220 KB

## Security / DTO

- `pnpm scan:secrets` passed
- `pnpm scan:dto-leaks` passed
- content audit absolute-path hits empty

## CI updates

- content audit, secret scan, DTO scan, perf smoke added
- e2e runs on push/PR
- `codex/**` branches included in CI triggers
- quality report artifact upload

## Known nonblocking

- Curriculum content not yet `approved` (blocked on CP-8 / language review)
- Local Node engine warning when not on 24.18.0; CI uses `.nvmrc`

## Next

- F2-I22 manual language review and approved transitions
