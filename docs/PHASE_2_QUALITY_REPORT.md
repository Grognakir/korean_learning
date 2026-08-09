# Phase 2 quality report (F2-I23 corrective stabilization)

Generated: 2026-08-10  
CP-8: accepted  
CP-9: pending  
Corrective remote migration / deploy: pending explicit permission

## Local result

- `sample-module` archived in authoring seed/TS
- Demo session UI/route removed; training uses filtered curriculum sessions
- Supabase dictionary links, grammar exercise links and per-unit material counts fixed
- Outage result uses the short cache profile; programmer errors are not hidden
- Approved free-response answers and grammar topic codes satisfy runtime contracts
- Gate green locally: unit 362 / content 44 / integration 20 / DB 24 / RLS 13 / E2E 34 + local/Supabase builds, bundles and scans

## Still required for F2-I23 DoD

1. Push and merge the corrective patch
2. Apply `20260810000002_curriculum_runtime_contracts.sql` and refreshed curriculum upsert remote
3. Deploy Vercel and repeat the preview/production smoke matrix
4. CP-9 → tag `v0.1.0`

## Rollback rehearsal (local)

- Sample archive is reversible: set `learning_modules.status` / topic statuses back to `published`
- No destructive delete of sample rows
