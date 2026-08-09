import { describe, expect, it } from "vitest";

import {
  asUserClient,
  createTestAuthUser,
  expectMutationDenied,
  expectSelectCount,
  expectSelectDenied,
} from "./rlsHelpers";
import { createLocalAdminClient, createLocalAnonClient, runSql } from "./helpers";

const SAMPLE_MODULE_ID = "ad66b9f8-61b6-4fd0-9e98-6ec426547dd0";
const SAMPLE_EXERCISE_ID = "0f6808ba-3ce6-4c94-8d29-e2d52ca2c65a";

describe("RLS content visibility", () => {
  const anon = createLocalAnonClient();

  it("allows anon to read published content tables", async () => {
    await expectSelectCount(anon, "learning_modules", 1);
    await expectSelectCount(anon, "grammar_topics", 2);
    await expectSelectCount(anon, "exercises", 14);
    await expectSelectCount(anon, "exercise_topics", 14);
  });

  it("hides draft modules from anon", async () => {
    runSql(
      "insert into public.learning_modules (id, slug, level, title_ko, title_ru, description_ru, status, content_version, sort_order) values ('11111111-1111-4111-8111-111111111111', 'draft-only-module', '1급', 'draft', 'draft', 'draft', 'draft', '1.0.0', 99);",
    );

    await expectSelectCount(anon, "learning_modules", 1);
  });

  it("blocks direct reads of exercise_options and accepted_answers", async () => {
    await expectSelectDenied(anon, "exercise_options");
    await expectSelectDenied(anon, "accepted_answers");
  });

  it("exposes exercise options without is_correct through the public view", async () => {
    const { data, error } = await anon.from("exercise_options_public").select("*").limit(1);
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.[0]).not.toHaveProperty("is_correct");
  });

  it("blocks anon reads of review and AI tables", async () => {
    await expectSelectDenied(anon, "content_reviews");
    await expectSelectDenied(anon, "ai_generation_requests");
    await expectSelectDenied(anon, "generated_exercises");
  });
});

describe("RLS user isolation", () => {
  it("isolates profiles and training sessions between users", async () => {
    const userA = await createTestAuthUser("user-a");
    const userB = await createTestAuthUser("user-b");
    const clientA = asUserClient(userA);
    const clientB = asUserClient(userB);

    await expectSelectCount(clientA, "profiles", 1);
    await expectSelectCount(clientB, "profiles", 1);

    const { data: session, error: sessionError } = await clientA
      .from("training_sessions")
      .insert({
        user_id: userA.id,
        module_id: SAMPLE_MODULE_ID,
        mode: "practice",
        content_version: "1.0.0",
        random_seed: "seed-a",
        idempotency_key: "session-a",
      })
      .select("id")
      .single();

    expect(sessionError).toBeNull();
    expect(session?.id).toBeTruthy();

    await expectSelectCount(clientA, "training_sessions", 1);
    await expectSelectCount(clientB, "training_sessions", 0);

    const { count: foreignCount, error: foreignReadError } = await clientB
      .from("training_sessions")
      .select("*", { count: "exact", head: true })
      .eq("id", session!.id);

    expect(foreignReadError).toBeNull();
    expect(foreignCount).toBe(0);
  });

  it("rejects spoofed user_id on profile insert", async () => {
    const userA = await createTestAuthUser("spoof-a");
    const userB = await createTestAuthUser("spoof-b");
    const clientA = asUserClient(userA);

    await expectMutationDenied(() =>
      clientA.from("profiles").insert({
        user_id: userB.id,
        display_name: "Spoofed",
      }),
    );
  });

  it("blocks direct client writes to attempts and review_queue", async () => {
    const user = await createTestAuthUser("attempt-user");
    const client = asUserClient(user);

    const { data: session, error: sessionError } = await client
      .from("training_sessions")
      .insert({
        user_id: user.id,
        module_id: SAMPLE_MODULE_ID,
        mode: "practice",
        content_version: "1.0.0",
        random_seed: "seed-attempt",
        idempotency_key: "attempt-session",
      })
      .select("id")
      .single();

    expect(sessionError).toBeNull();

    await expectMutationDenied(() =>
      client.from("attempts").insert({
        session_id: session!.id,
        user_id: user.id,
        exercise_id: SAMPLE_EXERCISE_ID,
        attempt_number: 1,
        raw_answer: { value: "test" },
        normalized_answer: { value: "test" },
        is_correct: true,
        score: 1,
        reason_code: "exact",
        answer_version: "1.0.0",
        idempotency_key: "attempt-1",
      }),
    );

    await expectMutationDenied(() =>
      client.from("review_queue").insert({
        user_id: user.id,
        module_id: SAMPLE_MODULE_ID,
        concept_key: "test-concept",
      }),
    );
  });

  it("allows authenticated users to submit attempts through trusted RPC", async () => {
    const user = await createTestAuthUser("rpc-attempt-user");
    const client = asUserClient(user);
    const SAMPLE_TOPIC_ID = "d8b1e1e2-97d8-4413-a890-730f85b32b51";

    const { data: session, error: sessionError } = await client
      .from("training_sessions")
      .insert({
        user_id: user.id,
        module_id: SAMPLE_MODULE_ID,
        mode: "practice",
        content_version: "1.0.0",
        random_seed: "seed-rpc",
        idempotency_key: "rpc-session",
      })
      .select("id")
      .single();

    expect(sessionError).toBeNull();

    const { error: exerciseLinkError } = await client.from("session_exercises").insert({
      session_id: session!.id,
      exercise_id: SAMPLE_EXERCISE_ID,
      position: 0,
      exercise_version: "1.0.0",
    });

    expect(exerciseLinkError).toBeNull();

    const { data: attempt, error: attemptError } = await client.rpc("submit_training_attempt", {
      p_session_id: session!.id,
      p_exercise_id: SAMPLE_EXERCISE_ID,
      p_idempotency_key: "rpc-attempt-1",
      p_raw_answer: { optionId: "a" },
      p_normalized_answer: { optionId: "a" },
      p_is_correct: false,
      p_score: 0,
      p_reason_code: "incorrect",
      p_answer_version: "1.0.0",
      p_mistake_module_id: SAMPLE_MODULE_ID,
      p_mistake_primary_topic_id: SAMPLE_TOPIC_ID,
      p_mistake_concept_key: "sample-choice",
      p_mistake_error_type: "incorrect",
    });

    expect(attemptError).toBeNull();
    expect(attempt?.id).toBeTruthy();
  });
});

describe("RLS trusted server access", () => {
  it("allows service role to read protected tables", async () => {
    const admin = createLocalAdminClient();
    await expectSelectCount(admin, "exercise_options", 412);
    await expectSelectCount(admin, "accepted_answers", 4);
    await expectSelectCount(admin, "content_reviews", 15);
    await expectSelectCount(admin, "content_sources", 4);
  });
});

describe("RLS curriculum skill tables", () => {
  const anon = createLocalAnonClient();

  it("hides draft reading passages and authoring provenance from anon", async () => {
    runSql(
      "insert into public.reading_passages (id, logical_id, primary_module_id, title_ko, title_ru, body_ko, status, content_version) values ('22222222-2222-4222-8222-222222222222', 'reading.sample.draft', 'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0', 'draft-ko', 'draft', 'body', 'draft', '1.0.0');",
    );

    await expectSelectCount(anon, "reading_passages", 0);
    await expectSelectDenied(anon, "content_sources");
    await expectSelectDenied(anon, "content_provenance");
  });

  it("exposes published reading passages under a published module", async () => {
    runSql(
      "insert into public.reading_passages (id, logical_id, primary_module_id, title_ko, title_ru, body_ko, status, content_version) values ('33333333-3333-4333-8333-333333333333', 'reading.sample.published', 'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0', 'title-ko', 'passage', 'hello', 'published', '1.0.0');",
    );

    await expectSelectCount(anon, "reading_passages", 1);
  });

  it("isolates user_skill_progress between users", async () => {
    const userA = await createTestAuthUser("skill-a");
    const userB = await createTestAuthUser("skill-b");
    const clientA = asUserClient(userA);
    const clientB = asUserClient(userB);

    runSql(
      `insert into public.user_skill_progress (user_id, module_id, learning_skill, attempts, correct, accuracy, mastery) values ('${userA.id}', 'ad66b9f8-61b6-4fd0-9e98-6ec426547dd0', 'grammar', 2, 1, 0.5, 'learning');`,
    );

    await expectSelectCount(clientA, "user_skill_progress", 1);
    await expectSelectCount(clientB, "user_skill_progress", 0);

    await expectMutationDenied(() =>
      clientA.from("user_skill_progress").insert({
        user_id: userA.id,
        module_id: SAMPLE_MODULE_ID,
        learning_skill: "vocabulary",
        attempts: 1,
        correct: 0,
        accuracy: 0,
        mastery: "learning",
      }),
    );
  });
});
