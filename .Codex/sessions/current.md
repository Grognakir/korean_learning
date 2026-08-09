# Current session — F1-I29 complete

## Iteration
- **ID:** F1-I29 — load learning content from Supabase
- **Branch:** `feature/supabase-content`
- **Status:** done (local commit pending user push)

## Delivered
- Async `ExerciseRepository` / `ModuleRepository` boundary
- `SupabaseModuleRepository`, `SupabaseExerciseRepository` (server-only, service role, cached)
- Row mappers + `PublicExercise` DTO (no answer keys to client)
- `evaluateTrainingSubmissionAction` — server evaluation by exercise id/version
- `getLearningContent()` + `CONTENT_SOURCE` / Vercel gate
- Pages: topics, module, training, session — async content load + ServiceUnavailableState
- TrainingSession: `publicExercises` + async evaluate prop
- Seed generator: topic `rule_payload` stores Korean titles

## Gate (2026-08-09)
- format:check ✅
- lint ✅
- typecheck ✅
- test:run 251 ✅
- test:integration 17 ✅
- build ✅
- test:db / test:rls — not re-run this step (unchanged migrations)

## Next
- **F1-I30** — persist training sessions and attempts
- Do **not** start F1-I30 until explicit user go-ahead
