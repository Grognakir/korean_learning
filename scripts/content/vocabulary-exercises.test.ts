import { describe, expect, it } from "vitest";

import {
  assertPublicExerciseShape,
  toPublicExercise,
} from "../../src/features/training/presentation/PublicExercise";
import type { Exercise } from "../../src/features/training/domain";

import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "./contentValidation";

describe("phase-2 vocabulary exercise bank", () => {
  const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);
  const units = graph.units.items;
  const entriesById = new Map(
    graph.dictionaryEntries.items.map((entry) => [entry.logicalId, entry]),
  );
  const exercises = graph.exercisesVocabulary.items;
  const links = graph.dictionaryUnitLinks.items;

  it("reviews at least 12 senses and 4 exercises per unit with target links", () => {
    expect(units).toHaveLength(16);
    expect(exercises).toHaveLength(64);

    for (const unit of units) {
      const unitLinks = links.filter(
        (link) => link.unitLogicalId === unit.logicalId && link.role === "primary",
      );
      expect(unitLinks.length).toBeGreaterThanOrEqual(12);

      for (const link of unitLinks) {
        const entry = entriesById.get(link.entryLogicalId);
        expect(entry).toBeTruthy();
        expect(entry!.status).toBe("reviewed");
        expect(entry!.status).not.toBe("draft");
      }

      const unitExercises = exercises.filter(
        (exercise) => exercise.unitLogicalId === unit.logicalId,
      );
      expect(unitExercises.length).toBeGreaterThanOrEqual(4);

      const types = new Set(unitExercises.map((exercise) => exercise.exerciseType));
      expect(types.has("meaning-choice")).toBe(true);
      expect(types.has("free-response") || types.has("meaning-choice")).toBe(true);
      expect(types.has("matching-translation")).toBe(true);

      const hasKoRu = unitExercises.some(
        (exercise) =>
          exercise.exerciseType === "meaning-choice" &&
          exercise.options.some((option) => /[а-яё]/i.test(option.label.ru)),
      );
      const hasRuKo = unitExercises.some(
        (exercise) =>
          (exercise.exerciseType === "free-response" && exercise.acceptedAnswers.length > 0) ||
          (exercise.exerciseType === "meaning-choice" &&
            exercise.options.some((option) => /[가-힣]/u.test(option.label.ko))),
      );
      expect(hasKoRu).toBe(true);
      expect(hasRuKo).toBe(true);
    }
  });

  it("keeps target links, forbids добавлено, and avoids draft targets in reviewed exercises", () => {
    for (const exercise of exercises) {
      expect(exercise.dictionaryEntryLogicalIds.length).toBeGreaterThan(0);
      for (const entryId of exercise.dictionaryEntryLogicalIds) {
        const entry = entriesById.get(entryId);
        expect(entry).toBeTruthy();
        if (exercise.status === "reviewed" || exercise.status === "approved") {
          expect(entry!.status).not.toBe("draft");
        }
        expect(JSON.stringify(entry)).not.toMatch(/добавлено/i);
      }
      expect(JSON.stringify(exercise)).not.toMatch(/добавлено/i);
    }
  });

  it("uses non-duplicate same-POS distractors and never accepts transliteration", () => {
    for (const exercise of exercises) {
      if (exercise.exerciseType === "meaning-choice") {
        const labels = exercise.options.map((option) => `${option.label.ko}::${option.label.ru}`);
        expect(new Set(labels).size).toBe(labels.length);

        const target = entriesById.get(exercise.dictionaryEntryLogicalIds[0]!)!;
        const distractors = exercise.options.filter(
          (option) => option.id !== exercise.correctOptionId,
        );
        for (const distractor of distractors) {
          expect(
            distractor.label.ru === target.gloss.ru && distractor.label.ko === target.lemma,
          ).toBe(false);
        }
      }

      if (exercise.exerciseType === "free-response") {
        const target = entriesById.get(exercise.dictionaryEntryLogicalIds[0]!)!;
        expect(exercise.acceptedAnswers).toContain(target.lemma);
        if (target.transliteration) {
          expect(exercise.acceptedAnswers).not.toContain(target.transliteration);
        }
      }
    }
  });

  it("keeps public mapper free of answer leaks for vocabulary shapes", () => {
    const meaning = exercises.find((exercise) => exercise.exerciseType === "meaning-choice")!;
    const matching = exercises.find(
      (exercise) => exercise.exerciseType === "matching-translation",
    )!;
    const freeResponse = exercises.find((exercise) => exercise.exerciseType === "free-response")!;

    const meaningDomain = {
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000201",
      logicalId: meaning.logicalId,
      moduleSlug: "u01",
      topicIds: [],
      type: "meaning-choice" as const,
      difficulty: "easy" as const,
      prompt: meaning.prompt,
      explanation: meaning.explanation,
      contentVersion: "1.0.0" as const,
      scoring: { points: 1, partialCredit: false },
      options: meaning.options,
      correctOptionId: meaning.correctOptionId!,
    } satisfies Exercise;

    const matchingDomain = {
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000202",
      logicalId: matching.logicalId,
      moduleSlug: "u01",
      topicIds: [],
      type: "matching-translation" as const,
      difficulty: "easy" as const,
      prompt: matching.prompt,
      explanation: matching.explanation,
      contentVersion: "1.0.0" as const,
      scoring: { points: 2, partialCredit: true },
      pairs: matching.pairs,
    } satisfies Exercise;

    const freeDomain = {
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000203",
      logicalId: freeResponse.logicalId,
      moduleSlug: "u01",
      topicIds: [],
      type: "free-response" as const,
      difficulty: "medium" as const,
      prompt: freeResponse.prompt,
      explanation: freeResponse.explanation,
      contentVersion: "1.0.0" as const,
      scoring: { points: 1, partialCredit: false },
      answerLanguage: "ko" as const,
      acceptedAnswers: freeResponse.acceptedAnswers.map((value, index) => ({
        id: `ans${index + 1}`,
        value,
        isCanonical: index === 0,
      })),
    } satisfies Exercise;

    for (const domain of [meaningDomain, matchingDomain, freeDomain] as const) {
      const publicExercise = toPublicExercise(domain, { seed: 13 });
      assertPublicExerciseShape(publicExercise);
      expect(JSON.stringify(publicExercise)).not.toContain("correctOptionId");
      expect(JSON.stringify(publicExercise)).not.toContain("acceptedAnswers");
    }
  });
});
