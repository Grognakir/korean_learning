import { describe, expect, it } from "vitest";

import { asUserClient, createTestAuthUser } from "./rlsHelpers";

const SAMPLE_MODULE_ID = "ad66b9f8-61b6-4fd0-9e98-6ec426547dd0";
const SAMPLE_EXERCISE_ID = "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a";
const SAMPLE_TOPIC_ID = "4ded8be2-7e86-4d25-80d0-c0f0e277324f";
const CONCEPT_KEY = "write-greeting";
const NOW = "2026-08-09T12:00:00.000Z";

async function startSession(
  client: ReturnType<typeof asUserClient>,
  userId: string,
  input: { readonly mode: "practice" | "review"; readonly key: string },
) {
  const { data: session, error } = await client
    .from("training_sessions")
    .insert({
      user_id: userId,
      module_id: SAMPLE_MODULE_ID,
      mode: input.mode,
      content_version: "1.0.0",
      random_seed: `seed-${input.key}`,
      idempotency_key: input.key,
    })
    .select("id")
    .single();

  expect(error).toBeNull();

  await client.from("session_exercises").insert({
    session_id: session!.id,
    exercise_id: SAMPLE_EXERCISE_ID,
    position: 0,
    exercise_version: "1.0.0",
  });

  return session!.id;
}

async function submitAttempt(
  client: ReturnType<typeof asUserClient>,
  input: {
    readonly sessionId: string;
    readonly key: string;
    readonly isCorrect: boolean;
    readonly now?: string;
  },
) {
  const { error } = await client.rpc("submit_training_attempt", {
    p_session_id: input.sessionId,
    p_exercise_id: SAMPLE_EXERCISE_ID,
    p_idempotency_key: input.key,
    p_raw_answer: { text: "x" },
    p_normalized_answer: { text: "x" },
    p_is_correct: input.isCorrect,
    p_score: input.isCorrect ? 1 : 0,
    p_reason_code: input.isCorrect ? "correct" : "incorrect",
    p_answer_version: "1.0.0",
    p_mistake_module_id: input.isCorrect ? null : SAMPLE_MODULE_ID,
    p_mistake_primary_topic_id: input.isCorrect ? null : SAMPLE_TOPIC_ID,
    p_mistake_concept_key: input.isCorrect ? null : CONCEPT_KEY,
    p_mistake_error_type: input.isCorrect ? null : "incorrect",
    p_now: input.now ?? NOW,
  });

  expect(error).toBeNull();
}

describe("review queue policy", () => {
  it("creates one due item on practice wrong and upserts without duplicates", async () => {
    const user = await createTestAuthUser("review-upsert");
    const client = asUserClient(user);
    const sessionId = await startSession(client, user.id, {
      mode: "practice",
      key: "review-practice-1",
    });

    await submitAttempt(client, {
      sessionId,
      key: "review-wrong-1",
      isCorrect: false,
    });

    // second wrong needs a new session position — complete a fresh session
    const sessionId2 = await startSession(client, user.id, {
      mode: "practice",
      key: "review-practice-2",
    });
    await submitAttempt(client, {
      sessionId: sessionId2,
      key: "review-wrong-2",
      isCorrect: false,
      now: "2026-08-09T13:00:00.000Z",
    });

    const { data, error } = await client
      .from("review_queue")
      .select("*")
      .eq("user_id", user.id)
      .eq("concept_key", CONCEPT_KEY);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0]?.status).toBe("due");
    expect(data?.[0]?.interval_stage).toBe(0);
    expect(data?.[0]?.due_at).toBe("2026-08-09T13:00:00+00:00");
  });

  it("does not create or advance an item on practice correct", async () => {
    const user = await createTestAuthUser("review-practice-correct");
    const client = asUserClient(user);
    const sessionId = await startSession(client, user.id, {
      mode: "practice",
      key: "review-practice-correct",
    });

    await submitAttempt(client, {
      sessionId,
      key: "review-correct-practice",
      isCorrect: true,
    });

    const { data } = await client.from("review_queue").select("id").eq("user_id", user.id);
    expect(data).toHaveLength(0);
  });

  it("advances review correct through the fixed schedule to mastered", async () => {
    const user = await createTestAuthUser("review-schedule");
    const client = asUserClient(user);

    const practiceId = await startSession(client, user.id, {
      mode: "practice",
      key: "review-seed-wrong",
    });
    await submitAttempt(client, {
      sessionId: practiceId,
      key: "review-seed-wrong-attempt",
      isCorrect: false,
    });

    const transitions = [
      { key: "r1", now: NOW, dueAt: "2026-08-10T12:00:00+00:00", stage: 1 },
      { key: "r2", now: "2026-08-10T12:00:00.000Z", dueAt: "2026-08-13T12:00:00+00:00", stage: 2 },
      { key: "r3", now: "2026-08-13T12:00:00.000Z", dueAt: "2026-08-20T12:00:00+00:00", stage: 3 },
    ] as const;

    for (const step of transitions) {
      const sessionId = await startSession(client, user.id, {
        mode: "review",
        key: `sess-${step.key}`,
      });
      await submitAttempt(client, {
        sessionId,
        key: step.key,
        isCorrect: true,
        now: step.now,
      });

      const { data } = await client
        .from("review_queue")
        .select("*")
        .eq("user_id", user.id)
        .single();

      expect(data?.status).toBe("scheduled");
      expect(data?.interval_stage).toBe(step.stage);
      expect(data?.due_at).toBe(step.dueAt);
    }

    const finalSession = await startSession(client, user.id, {
      mode: "review",
      key: "sess-r4",
    });
    await submitAttempt(client, {
      sessionId: finalSession,
      key: "r4",
      isCorrect: true,
      now: "2026-08-20T12:00:00.000Z",
    });

    const { data: mastered } = await client
      .from("review_queue")
      .select("*")
      .eq("user_id", user.id)
      .single();

    expect(mastered?.status).toBe("mastered");
    expect(mastered?.due_at).toBeNull();
    expect(mastered?.consecutive_correct).toBe(4);
  });

  it("resets on review wrong and reactivates mastered after a new practice wrong", async () => {
    const user = await createTestAuthUser("review-reset");
    const client = asUserClient(user);

    const practiceId = await startSession(client, user.id, {
      mode: "practice",
      key: "reset-seed",
    });
    await submitAttempt(client, {
      sessionId: practiceId,
      key: "reset-seed-attempt",
      isCorrect: false,
    });

    const advanceId = await startSession(client, user.id, {
      mode: "review",
      key: "reset-advance",
    });
    await submitAttempt(client, {
      sessionId: advanceId,
      key: "reset-advance-attempt",
      isCorrect: true,
    });

    const wrongReviewId = await startSession(client, user.id, {
      mode: "review",
      key: "reset-wrong",
    });
    await submitAttempt(client, {
      sessionId: wrongReviewId,
      key: "reset-wrong-attempt",
      isCorrect: false,
      now: "2026-08-09T14:00:00.000Z",
    });

    const { data: reset } = await client
      .from("review_queue")
      .select("*")
      .eq("user_id", user.id)
      .single();
    expect(reset?.status).toBe("due");
    expect(reset?.interval_stage).toBe(0);
    expect(reset?.consecutive_correct).toBe(0);

    for (const [index, now] of [
      "2026-08-09T14:00:00.000Z",
      "2026-08-10T14:00:00.000Z",
      "2026-08-13T14:00:00.000Z",
      "2026-08-20T14:00:00.000Z",
    ].entries()) {
      const sessionId = await startSession(client, user.id, {
        mode: "review",
        key: `reset-master-${index}`,
      });
      await submitAttempt(client, {
        sessionId,
        key: `reset-master-attempt-${index}`,
        isCorrect: true,
        now,
      });
    }

    const { data: mastered } = await client
      .from("review_queue")
      .select("*")
      .eq("user_id", user.id)
      .single();
    expect(mastered?.status).toBe("mastered");

    const reactivateId = await startSession(client, user.id, {
      mode: "practice",
      key: "reset-reactivate",
    });
    await submitAttempt(client, {
      sessionId: reactivateId,
      key: "reset-reactivate-attempt",
      isCorrect: false,
      now: "2026-08-21T14:00:00.000Z",
    });

    const { data: reactivated } = await client
      .from("review_queue")
      .select("*")
      .eq("user_id", user.id)
      .single();
    expect(reactivated?.status).toBe("due");
    expect(reactivated?.interval_stage).toBe(0);
  });

  it("returns due items through sync_review_queue_availability and hides future ones", async () => {
    const user = await createTestAuthUser("review-due-query");
    const client = asUserClient(user);

    const practiceId = await startSession(client, user.id, {
      mode: "practice",
      key: "due-seed",
    });
    await submitAttempt(client, {
      sessionId: practiceId,
      key: "due-seed-attempt",
      isCorrect: false,
    });

    const reviewId = await startSession(client, user.id, {
      mode: "review",
      key: "due-advance",
    });
    await submitAttempt(client, {
      sessionId: reviewId,
      key: "due-advance-attempt",
      isCorrect: true,
      now: NOW,
    });

    const { data: beforeDue } = await client.rpc("sync_review_queue_availability", {
      p_now: NOW,
    });
    expect(beforeDue).toHaveLength(0);

    const { data: whenDue } = await client.rpc("sync_review_queue_availability", {
      p_now: "2026-08-10T12:00:00.000Z",
    });
    expect(whenDue).toHaveLength(1);
    expect(whenDue?.[0]?.concept_key).toBe(CONCEPT_KEY);
  });
});
