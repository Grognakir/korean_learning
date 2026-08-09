import { describe, expect, it } from "vitest";

import { createLocalAdminClient, runSql } from "./helpers";
import {
  asUserClient,
  createTestAuthUser,
  expectMutationDenied,
  expectSelectCount,
} from "./rlsHelpers";

const SAMPLE_MODULE_ID = "ad66b9f8-61b6-4fd0-9e98-6ec426547dd0";
const SAMPLE_EXERCISE_ID = "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a";
const SAMPLE_TOPIC_ID = "4ded8be2-7e86-4d25-80d0-c0f0e277324f";

function completedAtAfterNow(): string {
  return new Date(Date.now() + 60_000).toISOString();
}

describe("learning progress aggregates", () => {
  it("refreshes topic and module progress when a session completes", async () => {
    const user = await createTestAuthUser("progress-user");
    const client = asUserClient(user);

    const { data: session, error: sessionError } = await client
      .from("training_sessions")
      .insert({
        user_id: user.id,
        module_id: SAMPLE_MODULE_ID,
        mode: "practice",
        content_version: "1.0.0",
        random_seed: "seed-progress",
        idempotency_key: "progress-session",
      })
      .select("id")
      .single();

    expect(sessionError).toBeNull();

    await client.from("session_exercises").insert({
      session_id: session!.id,
      exercise_id: SAMPLE_EXERCISE_ID,
      position: 0,
      exercise_version: "1.0.0",
    });

    const { error: attemptError } = await client.rpc("submit_training_attempt", {
      p_session_id: session!.id,
      p_exercise_id: SAMPLE_EXERCISE_ID,
      p_idempotency_key: "progress-attempt-1",
      p_raw_answer: { optionId: "a" },
      p_normalized_answer: { optionId: "a" },
      p_is_correct: true,
      p_score: 1,
      p_reason_code: "correct",
      p_answer_version: "1.0.0",
    });
    expect(attemptError).toBeNull();

    const { error: completeError } = await client.rpc("complete_training_session", {
      p_session_id: session!.id,
      p_idempotency_key: "progress-complete",
      p_completed_at: completedAtAfterNow(),
    });

    expect(completeError).toBeNull();

    const { data: topicProgress } = await client
      .from("user_topic_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("topic_id", SAMPLE_TOPIC_ID)
      .single();

    expect(topicProgress?.attempts_count).toBe(1);
    expect(topicProgress?.correct_count).toBe(1);
    expect(topicProgress?.mastery_status).toBe("learning");

    const { data: moduleProgress } = await client
      .from("user_module_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("module_id", SAMPLE_MODULE_ID)
      .single();

    expect(moduleProgress?.completed_sessions).toBe(1);
    expect(moduleProgress?.attempts_count).toBe(1);
  });

  it("does not double-count progress on idempotent completion", async () => {
    const user = await createTestAuthUser("progress-idempotent");
    const client = asUserClient(user);

    const { data: session } = await client
      .from("training_sessions")
      .insert({
        user_id: user.id,
        module_id: SAMPLE_MODULE_ID,
        mode: "practice",
        content_version: "1.0.0",
        random_seed: "seed-idempotent",
        idempotency_key: "progress-idempotent-session",
      })
      .select("id")
      .single();

    await client.from("session_exercises").insert({
      session_id: session!.id,
      exercise_id: SAMPLE_EXERCISE_ID,
      position: 0,
      exercise_version: "1.0.0",
    });

    await client.rpc("submit_training_attempt", {
      p_session_id: session!.id,
      p_exercise_id: SAMPLE_EXERCISE_ID,
      p_idempotency_key: "progress-idempotent-attempt",
      p_raw_answer: { optionId: "a" },
      p_normalized_answer: { optionId: "a" },
      p_is_correct: false,
      p_score: 0,
      p_reason_code: "incorrect",
      p_answer_version: "1.0.0",
    });

    await client.rpc("complete_training_session", {
      p_session_id: session!.id,
      p_idempotency_key: "progress-idempotent-complete",
    });

    await client.rpc("complete_training_session", {
      p_session_id: session!.id,
      p_idempotency_key: "progress-idempotent-complete",
    });

    await expectSelectCount(client, "user_module_progress", 1);

    const { data: moduleProgress } = await client
      .from("user_module_progress")
      .select("completed_sessions, attempts_count")
      .eq("user_id", user.id)
      .single();

    expect(moduleProgress?.completed_sessions).toBe(1);
    expect(moduleProgress?.attempts_count).toBe(1);
  });

  it("matches rebuild output with incremental refresh", async () => {
    const user = await createTestAuthUser("progress-rebuild");
    const client = asUserClient(user);
    const admin = createLocalAdminClient();

    const { data: session } = await client
      .from("training_sessions")
      .insert({
        user_id: user.id,
        module_id: SAMPLE_MODULE_ID,
        mode: "practice",
        content_version: "1.0.0",
        random_seed: "seed-rebuild",
        idempotency_key: "progress-rebuild-session",
      })
      .select("id")
      .single();

    await client.from("session_exercises").insert({
      session_id: session!.id,
      exercise_id: SAMPLE_EXERCISE_ID,
      position: 0,
      exercise_version: "1.0.0",
    });

    await client.rpc("submit_training_attempt", {
      p_session_id: session!.id,
      p_exercise_id: SAMPLE_EXERCISE_ID,
      p_idempotency_key: "progress-rebuild-attempt",
      p_raw_answer: { optionId: "a" },
      p_normalized_answer: { optionId: "a" },
      p_is_correct: true,
      p_score: 1,
      p_reason_code: "correct",
      p_answer_version: "1.0.0",
    });

    await client.rpc("complete_training_session", {
      p_session_id: session!.id,
      p_idempotency_key: "progress-rebuild-complete",
    });

    const { data: incrementalTopic } = await client
      .from("user_topic_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    await admin.rpc("rebuild_user_progress", { p_user_id: user.id });

    const { data: rebuiltTopic } = await client
      .from("user_topic_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    expect(rebuiltTopic).toMatchObject({
      user_id: incrementalTopic?.user_id,
      topic_id: incrementalTopic?.topic_id,
      attempts_count: incrementalTopic?.attempts_count,
      correct_count: incrementalTopic?.correct_count,
      mastery_status: incrementalTopic?.mastery_status,
      content_version: incrementalTopic?.content_version,
      last_practiced_at: incrementalTopic?.last_practiced_at,
    });
  });

  it("blocks direct client writes to progress tables", async () => {
    const user = await createTestAuthUser("progress-write-block");
    const client = asUserClient(user);

    await expectMutationDenied(() =>
      client.from("user_topic_progress").insert({
        user_id: user.id,
        topic_id: SAMPLE_TOPIC_ID,
        content_version: "1.0.0",
        attempts_count: 99,
        correct_count: 99,
        accuracy: 1,
        mastery_status: "practiced",
      }),
    );
  });
});

describe("compute_topic_mastery_status SQL helper", () => {
  it("marks practiced at the 80% boundary with 5 attempts", () => {
    const result = runSql(
      "select public.compute_topic_mastery_status(5, 4)::text as status;",
    ).trim();

    expect(result).toBe("practiced");
  });
});
