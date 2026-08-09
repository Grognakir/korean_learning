import { describe, expect, it } from "vitest";

import { normalizeAnswer } from "../../src/features/training/domain/evaluation/normalizeAnswer";
import {
  assertPublicExerciseShape,
  toPublicExercise,
} from "../../src/features/training/presentation/PublicExercise";
import type { Exercise } from "../../src/features/training/domain";

import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "./contentValidation";

function stripUsageMarkers(patternKo: string): string {
  return patternKo.replace(/[①②③④⑤⑥⑦⑧⑨⑩]/gu, "").trim();
}

describe("phase-2 grammar exercise bank", () => {
  const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);
  const topics = graph.grammarTopics.items;
  const exercises = graph.exercisesGrammar.items;

  it("covers every grammar topic with recognition and application approvals", () => {
    expect(topics).toHaveLength(80);
    expect(exercises).toHaveLength(160);
    expect(exercises.every((exercise) => exercise.status === "approved")).toBe(true);
    expect(
      exercises.every(
        (exercise) => !/не утвержд|чернов|not language-approved/i.test(exercise.explanation.ru),
      ),
    ).toBe(true);

    for (const topic of topics) {
      const forTopic = exercises.filter(
        (exercise) => exercise.grammarTopicLogicalId === topic.logicalId,
      );
      expect(forTopic.length).toBeGreaterThanOrEqual(2);
      expect(forTopic.some((exercise) => exercise.exerciseType === "single-choice")).toBe(true);
      expect(forTopic.some((exercise) => exercise.exerciseType === "free-response")).toBe(true);
    }
  });

  it("keeps unique prompt+answer pairs and valid topic targets", () => {
    const topicIds = new Set(topics.map((topic) => topic.logicalId));
    const seen = new Set<string>();

    for (const exercise of exercises) {
      expect(exercise.grammarTopicLogicalId).toBeTruthy();
      expect(topicIds.has(exercise.grammarTopicLogicalId!)).toBe(true);
      expect(exercise.unitLogicalId).toMatch(/^unit\.u\d{2}$/);

      const answerKey =
        exercise.exerciseType === "single-choice"
          ? exercise.correctOptionId
          : exercise.acceptedAnswers.join("|");
      const key = `${exercise.prompt.ru}::${answerKey}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it("does not embed the target pattern in prompts", () => {
    const topicById = new Map(topics.map((topic) => [topic.logicalId, topic]));

    for (const exercise of exercises) {
      const topic = topicById.get(exercise.grammarTopicLogicalId!);
      expect(topic).toBeTruthy();
      const promptText = `${exercise.prompt.ko}\n${exercise.prompt.ru}`;
      expect(promptText.includes(topic!.patternKo)).toBe(false);
    }
  });

  it("uses same-unit distractors for recognition items", () => {
    const topicsByUnit = new Map<string, Set<string>>();
    for (const topic of topics) {
      const set = topicsByUnit.get(topic.unitLogicalId) ?? new Set<string>();
      set.add(topic.patternKo);
      topicsByUnit.set(topic.unitLogicalId, set);
    }

    for (const exercise of exercises) {
      if (exercise.exerciseType !== "single-choice") continue;
      const unitPatterns = topicsByUnit.get(exercise.unitLogicalId)!;
      for (const option of exercise.options) {
        expect(unitPatterns.has(option.label.ko)).toBe(true);
      }
      const correct = exercise.options.find((option) => option.id === exercise.correctOptionId);
      expect(correct).toBeTruthy();
      const topic = topics.find((item) => item.logicalId === exercise.grammarTopicLogicalId);
      expect(correct!.label.ko).toBe(topic!.patternKo);
    }
  });

  it("normalizes accepted application answers with NFC/whitespace rules", () => {
    for (const exercise of exercises) {
      if (exercise.exerciseType !== "free-response") continue;
      expect(exercise.acceptedAnswers.length).toBeGreaterThanOrEqual(1);
      const canonical = exercise.acceptedAnswers[0]!;
      expect(normalizeAnswer(`  ${canonical}  `)).toBe(normalizeAnswer(canonical));
      const topic = topics.find((item) => item.logicalId === exercise.grammarTopicLogicalId)!;
      expect(exercise.acceptedAnswers).toContain(topic.patternKo);
      const stripped = stripUsageMarkers(topic.patternKo);
      if (stripped !== topic.patternKo) {
        expect(exercise.acceptedAnswers).toContain(stripped);
      }
    }
  });

  it("keeps public mapper free of answer leaks for grammar exercise shapes", () => {
    const recognition = exercises.find((exercise) => exercise.exerciseType === "single-choice")!;
    const application = exercises.find((exercise) => exercise.exerciseType === "free-response")!;

    const recognitionDomain = {
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000101",
      logicalId: recognition.logicalId,
      moduleSlug: "u01",
      topicIds: [recognition.grammarTopicLogicalId!],
      type: "single-choice" as const,
      difficulty: "easy" as const,
      prompt: recognition.prompt,
      explanation: recognition.explanation,
      contentVersion: "1.0.0" as const,
      scoring: { points: 1, partialCredit: false },
      options: recognition.options,
      correctOptionId: recognition.correctOptionId!,
      passage: null,
    } satisfies Exercise;

    const applicationDomain = {
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000102",
      logicalId: application.logicalId,
      moduleSlug: "u01",
      topicIds: [application.grammarTopicLogicalId!],
      type: "free-response" as const,
      difficulty: "medium" as const,
      prompt: application.prompt,
      explanation: application.explanation,
      contentVersion: "1.0.0" as const,
      scoring: { points: 1, partialCredit: false },
      answerLanguage: "ko" as const,
      acceptedAnswers: application.acceptedAnswers.map((value, index) => ({
        id: `ans${index + 1}`,
        value,
        isCanonical: index === 0,
      })),
    } satisfies Exercise;

    for (const domain of [recognitionDomain, applicationDomain] as const) {
      const publicExercise = toPublicExercise(domain, { seed: 11 });
      assertPublicExerciseShape(publicExercise);
      expect(JSON.stringify(publicExercise)).not.toContain("correctOptionId");
      expect(JSON.stringify(publicExercise)).not.toContain("acceptedAnswers");
    }
  });

  it("records provenance for every grammar exercise", () => {
    const subjects = new Set(
      graph.provenance.items
        .filter((row) => row.subjectLogicalId.startsWith("exercise.grammar."))
        .map((row) => row.subjectLogicalId),
    );
    for (const exercise of exercises) {
      expect(subjects.has(exercise.logicalId)).toBe(true);
    }
  });
});
