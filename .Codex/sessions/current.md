# Current session — F1-I30

**Branch:** `feature/persist-training-attempts`  
**Iteration:** F1-I30 — persist training sessions and attempts  
**Status:** done (awaiting commit)

## Summary

Implemented server-backed training session persistence for authenticated users:

- Migration `20260809000007_training_persistence_rpcs.sql` with `submit_training_attempt` and `complete_training_session` SECURITY DEFINER RPCs
- API routes: `POST /api/training/sessions`, `.../attempts`, `.../complete`, `POST /api/training/import`
- Application layer + `SupabaseTrainingSessionRepository`
- Cloud sync hook (`useCloudTrainingPersistence`) wired into `TrainingSession` for logged-in users
- `GuestSessionImportPrompt` for explicit guest→account import after login
- Guest local persistence unchanged; no silent merge

## Gate

- format:check ✅
- lint ✅
- typecheck ✅
- test:run 257 ✅
- test:integration 17 ✅
- build ✅
- test:rls — not run (Supabase CLI unavailable in agent env; new RPC test added)

## Next

- Commit: `feat: persist training sessions and attempts`
- Then F1-I31 learning progress tracking

## Notes

- Remote Supabase still needs migration apply before cloud sync works in production.
- Node gate run on 22.15.0 locally; project expects 24.18.0.
