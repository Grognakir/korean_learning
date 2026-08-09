import { describe, expect, it } from "vitest";

import { asUserClient, createTestAuthUser } from "./rlsHelpers";
import { runSql } from "./helpers";

const U01_MODULE_ID = "e321a5a0-9cb2-4cbd-acfe-0bc1ac533ce1";
const U01_EXERCISE_ID = "e680cccf-f429-4166-acef-54aadfda5330";
const U01_TOPIC_ID = "2f299044-c8a6-43c6-a4d8-4cc7693a2d1e";
const NOW = "2026-08-10T12:00:00.000Z";

describe("skill progress and skill concept keys", () => {
  it("records mistakes without primary topic and matches skill concept keys", async () => {
    const user = await createTestAuthUser("skill-concept");
    const client = asUserClient(user);

    const { data: session, error: sessionError } = await client
      .from("training_sessions")
      .insert({
        user_id: user.id,
        module_id: U01_MODULE_ID,
        mode: "practice",
        content_version: "1.0.0",
        random_seed: "skill-seed",
        idempotency_key: "skill-session",
      })
      .select("id")
      .single();

    expect(sessionError).toBeNull();

    await client.from("session_exercises").insert({
      session_id: session!.id,
      exercise_id: U01_EXERCISE_ID,
      position: 0,
      exercise_version: "1.0.0",
    });

    const conceptKey = "grammar:exercise.grammar.u01.n01.recognition";
    const { error: attemptError } = await client.rpc("submit_training_attempt", {
      p_session_id: session!.id,
      p_exercise_id: U01_EXERCISE_ID,
      p_idempotency_key: "skill-attempt-wrong",
      p_raw_answer: { text: "x" },
      p_normalized_answer: { text: "x" },
      p_is_correct: false,
      p_score: 0,
      p_reason_code: "incorrect",
      p_answer_version: "1.0.0",
      p_mistake_module_id: U01_MODULE_ID,
      p_mistake_concept_key: conceptKey,
      p_mistake_error_type: "incorrect",
      p_now: NOW,
    });

    expect(attemptError).toBeNull();

    const { data: mistakes, error: mistakeError } = await client
      .from("mistake_events")
      .select("concept_key,primary_topic_id")
      .eq("user_id", user.id);

    expect(mistakeError).toBeNull();
    expect(mistakes).toHaveLength(1);
    expect(mistakes?.[0]?.concept_key).toBe(conceptKey);
    expect(mistakes?.[0]?.primary_topic_id).toBeNull();

    const existsLegacy = runSql(
      `select public.approved_exercise_exists_for_concept('${U01_MODULE_ID}', 'exercise.grammar.u01.n01.recognition')::text;`,
    );
    const existsSkill = runSql(
      `select public.approved_exercise_exists_for_concept('${U01_MODULE_ID}', '${conceptKey}')::text;`,
    );
    expect(existsLegacy).toBe("true");
    expect(existsSkill).toBe("true");

    const { data: resolved, error: resolveError } = await client.rpc(
      "resolve_approved_exercises_for_concepts",
      {
        p_module_id: U01_MODULE_ID,
        p_concept_keys: [conceptKey, "exercise.grammar.u01.n01.recognition"],
      },
    );

    expect(resolveError).toBeNull();
    expect(resolved?.length).toBeGreaterThanOrEqual(1);
    expect(resolved?.some((row) => row.exercise_id === U01_EXERCISE_ID)).toBe(true);
  });

  it("upserts user_skill_progress when a session is completed", async () => {
    const user = await createTestAuthUser("skill-progress");
    const client = asUserClient(user);

    const { data: session, error: sessionError } = await client
      .from("training_sessions")
      .insert({
        user_id: user.id,
        module_id: U01_MODULE_ID,
        mode: "practice",
        content_version: "1.0.0",
        random_seed: "skill-progress-seed",
        idempotency_key: "skill-progress-session",
      })
      .select("id")
      .single();

    expect(sessionError).toBeNull();

    await client.from("session_exercises").insert({
      session_id: session!.id,
      exercise_id: U01_EXERCISE_ID,
      position: 0,
      exercise_version: "1.0.0",
    });

    const { error: attemptError } = await client.rpc("submit_training_attempt", {
      p_session_id: session!.id,
      p_exercise_id: U01_EXERCISE_ID,
      p_idempotency_key: "skill-progress-attempt",
      p_raw_answer: { text: "ok" },
      p_normalized_answer: { text: "ok" },
      p_is_correct: true,
      p_score: 1,
      p_reason_code: "correct",
      p_answer_version: "1.0.0",
      p_now: NOW,
    });
    expect(attemptError).toBeNull();

    const { error: completeError } = await client.rpc("complete_training_session", {
      p_session_id: session!.id,
      p_idempotency_key: "skill-progress-complete",
      p_completed_at: NOW,
    });
    expect(completeError).toBeNull();

    const { data: skillRows, error: skillError } = await client
      .from("user_skill_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("module_id", U01_MODULE_ID);

    expect(skillError).toBeNull();
    expect(skillRows).toHaveLength(1);
    expect(skillRows?.[0]?.learning_skill).toBe("grammar");
    expect(skillRows?.[0]?.attempts).toBe(1);
    expect(skillRows?.[0]?.correct).toBe(1);

    const { data: topicRows, error: topicError } = await client
      .from("user_topic_progress")
      .select("topic_id,attempts_count")
      .eq("user_id", user.id)
      .eq("topic_id", U01_TOPIC_ID);

    expect(topicError).toBeNull();
    expect(topicRows?.[0]?.attempts_count).toBe(1);
  });
});
