# Phase 2 quality report (F2-I23 corrective stabilization)

Generated: 2026-08-10  
CP-8: accepted  
CP-9: pending  
Corrective remote migration / deploy: completed

## Result

- `sample-module` archived in authoring seed/TS
- Demo session UI/route removed; training uses filtered curriculum sessions
- Supabase dictionary links, grammar exercise links and per-unit material counts fixed
- Outage result uses the short cache profile; programmer errors are not hidden
- Approved free-response answers and grammar topic codes satisfy runtime contracts
- Canonical dotted exercise ids and non-grammar exercises pass the runtime validator
- Supabase exercise relations use complete pagination beyond the REST 1000-row limit
- Remote curriculum importer keeps each exercise and its deferred target links in one transaction
- Gate green: unit 366 / content 46 / integration 20 / DB 24 / RLS 13 / E2E 34 + local/Supabase builds, bundles, performance and scans

## Remote result

- PR #18 and #19 merged; production commit `7520673`
- Migration `20260810000002_curriculum_runtime_contracts.sql` applied
- Refreshed curriculum upsert applied in 10 successful chunks
- Published data: 16 modules / 80 grammar topics / 192 dictionary entries and unit links / 16 reading passages / 286 approved exercises
- Runtime-contract violations: 0 for answers, grammar targets, vocabulary targets and reading targets
- Production smoke: 16 topic cards; dictionary u01 `12 из 12`; grammar u01.n01 `2` exercises; interactive session opens `1 из 2`, Enter submits, feedback is `Верно`, progress becomes `1 из 2`; console errors 0
- Post-merge CI main and Vercel production deployment passed

## Still required

1. User accepts CP-9
2. Create tag/release `v0.1.0`

## Rollback rehearsal (local)

- Sample archive is reversible: set `learning_modules.status` / topic statuses back to `published`
- No destructive delete of sample rows
