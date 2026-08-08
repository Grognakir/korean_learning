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
});

describe("RLS trusted server access", () => {
  it("allows service role to read protected tables", async () => {
    const admin = createLocalAdminClient();
    await expectSelectCount(admin, "exercise_options", 12);
    await expectSelectCount(admin, "accepted_answers", 4);
    await expectSelectCount(admin, "content_reviews", 15);
  });
});
