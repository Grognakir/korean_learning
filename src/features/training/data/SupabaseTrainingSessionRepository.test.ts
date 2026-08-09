import { describe, expect, it } from "vitest";

import { restoreTrainingSessionState } from "@/features/training/data/SupabaseTrainingSessionRepository";

describe("restoreTrainingSessionState", () => {
  it("restores an in-progress session to the latest answered exercise", () => {
    const state = restoreTrainingSessionState({
      moduleSlug: "sample-module",
      seed: 7,
      persisted: {
        session: {
          id: "11111111-1111-4111-8111-111111111111",
          user_id: "22222222-2222-4222-8222-222222222222",
          module_id: "ad66b9f8-61b6-4fd0-9e98-6ec426547dd0",
          mode: "practice",
          difficulty: null,
          status: "active",
          current_index: 1,
          content_version: "1.0.0",
          random_seed: "seed",
          started_at: "2026-08-09T10:00:00.000Z",
          completed_at: null,
          last_activity_at: "2026-08-09T10:05:00.000Z",
          idempotency_key: "session-1",
          complete_idempotency_key: null,
        },
        exercises: [
          {
            session_id: "11111111-1111-4111-8111-111111111111",
            exercise_id: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
            position: 0,
            exercise_version: "1.0.0",
            snapshot_payload: null,
          },
          {
            session_id: "11111111-1111-4111-8111-111111111111",
            exercise_id: "11111111-1111-4111-8111-111111111112",
            position: 1,
            exercise_version: "1.0.0",
            snapshot_payload: null,
          },
        ],
        attempts: [],
      },
      attempts: [
        {
          submissionId: "attempt-1",
          exerciseId: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
          submittedAt: "2026-08-09T10:01:00.000Z",
          submission: {
            exerciseId: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
            type: "plain-choice",
            optionId: "option-a",
          },
          evaluation: {
            exerciseId: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
            type: "plain-choice",
            isCorrect: true,
            score: 1,
            maxScore: 1,
            scoreRatio: 1,
            reasonCode: "correct",
            submission: {
              exerciseId: "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a",
              type: "plain-choice",
              optionId: "option-a",
            },
            correctAnswer: { kind: "choice", optionId: "option-a" },
            explanation: { ko: null, ru: "ok" },
          },
        },
      ],
    });

    expect(state.currentIndex).toBe(0);
    expect(state.attempts).toHaveLength(1);
    expect(state.status).toBe("active");
  });
});
