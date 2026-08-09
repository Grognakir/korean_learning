import { describe, expect, it } from "vitest";

import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "./contentValidation";

const ELIGIBLE = new Set(["draft", "needs_review", "reviewed", "approved"]);

/**
 * §3.2 minimum for CP-8 language review eligibility.
 * F2-I21 does not require approved status yet; it proves the publishable bank exists.
 */
describe("phase-2 §3.2 minimum coverage", () => {
  const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);
  const units = graph.units.items;
  const topics = graph.grammarTopics.items;
  const entriesById = new Map(
    graph.dictionaryEntries.items.map((entry) => [entry.logicalId, entry]),
  );
  const grammarExercises = graph.exercisesGrammar.items.filter((item) => ELIGIBLE.has(item.status));
  const vocabularyExercises = graph.exercisesVocabulary.items.filter((item) =>
    ELIGIBLE.has(item.status),
  );
  const readingExercises = graph.exercisesReading.items.filter((item) => ELIGIBLE.has(item.status));
  const passages = graph.readingPassages.items.filter((item) => ELIGIBLE.has(item.status));
  const links = graph.dictionaryUnitLinks.items;

  it("covers 16 units and 80 grammar topics", () => {
    expect(units).toHaveLength(16);
    expect(topics).toHaveLength(80);
  });

  it("has ≥2 grammar exercises per topic (recognition + application)", () => {
    for (const topic of topics) {
      const forTopic = grammarExercises.filter(
        (exercise) => exercise.grammarTopicLogicalId === topic.logicalId,
      );
      expect(forTopic.length).toBeGreaterThanOrEqual(2);
      expect(forTopic.some((exercise) => exercise.exerciseType === "single-choice")).toBe(true);
      expect(
        forTopic.some(
          (exercise) =>
            exercise.exerciseType === "free-response" || exercise.exerciseType === "fill-blank",
        ),
      ).toBe(true);
    }
  });

  it("has ≥12 reviewed senses and ≥4 vocabulary exercises per unit", () => {
    for (const unit of units) {
      const unitLinks = links.filter(
        (link) => link.unitLogicalId === unit.logicalId && link.role === "primary",
      );
      expect(unitLinks.length).toBeGreaterThanOrEqual(12);

      for (const link of unitLinks) {
        const entry = entriesById.get(link.entryLogicalId);
        expect(entry).toBeTruthy();
        expect(ELIGIBLE.has(entry!.status)).toBe(true);
        expect(entry!.status === "reviewed" || entry!.status === "approved").toBe(true);
      }

      const unitExercises = vocabularyExercises.filter(
        (exercise) => exercise.unitLogicalId === unit.logicalId,
      );
      expect(unitExercises.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("has ≥1 passage and ≥3 reading exercises per unit", () => {
    for (const unit of units) {
      const unitPassages = passages.filter((passage) => passage.unitLogicalId === unit.logicalId);
      expect(unitPassages.length).toBeGreaterThanOrEqual(1);

      const unitExercises = readingExercises.filter(
        (exercise) => exercise.unitLogicalId === unit.logicalId,
      );
      expect(unitExercises.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("requires explanations on every eligible exercise in the minimum banks", () => {
    for (const exercise of [...grammarExercises, ...vocabularyExercises, ...readingExercises]) {
      expect(exercise.explanation.ru.trim().length).toBeGreaterThan(0);
    }
  });
});
