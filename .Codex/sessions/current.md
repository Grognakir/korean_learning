# Current session — F1-I31

**Branch:** `feature/learning-progress`  
**Iteration:** F1-I31 — add learning progress tracking  
**Status:** done (awaiting commit/push)

## Summary

- Migration `20260809000008_learning_progress_refresh.sql`:
  - `compute_topic_mastery_status`, `compute_module_mastery_status`
  - `refresh_user_progress_for_session` on session completion
  - `rebuild_user_progress` (service_role only)
  - extended `complete_training_session` to refresh aggregates
- Progress feature: domain formula, Supabase repository, `/progress` page
- UI: `ProgressOverview`, `ModuleProgressCard`, `TopicProgressList`, guest/empty states

## Gate

- format / lint / typecheck / 267 unit / 17 integration / build ✅
- test:db progress tests added (require local Supabase)

## Next

- Commit: `feat: add learning progress tracking`
- Push migration to remote Supabase
- Then F1-I32 mistake review queue
