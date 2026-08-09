import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "./contentValidation";

/**
 * §3.2 minimum for CP-8: publishable bank must be approved.
 * Non-minimum dictionary/passages/exam exercises may remain draft.
 */
describe("phase-2 §3.2 minimum coverage", () => {
  const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);
  const units = graph.units.items;
  const topics = graph.grammarTopics.items;
  const entriesById = new Map(
    graph.dictionaryEntries.items.map((entry) => [entry.logicalId, entry]),
  );
  const selection = JSON.parse(
    readFileSync(path.join(PHASE_2_CONTENT_ROOT, "reading-bank-selection.json"), "utf8"),
  ) as { selected: Array<{ unitLogicalId: string; passageLogicalId: string; status: string }> };
  const canonicalPassageIds = new Set(selection.selected.map((row) => row.passageLogicalId));

  const grammarExercises = graph.exercisesGrammar.items.filter(
    (item) => item.status === "approved",
  );
  const vocabularyExercises = graph.exercisesVocabulary.items.filter(
    (item) => item.status === "approved",
  );
  const readingExercises = graph.exercisesReading.items.filter(
    (item) => item.status === "approved" && item.logicalId.startsWith("exercise.reading.bank."),
  );
  const passages = graph.readingPassages.items.filter(
    (item) => item.status === "approved" && canonicalPassageIds.has(item.logicalId),
  );
  const links = graph.dictionaryUnitLinks.items;

  it("covers 16 approved units and 80 approved grammar topics", () => {
    expect(units).toHaveLength(16);
    expect(topics).toHaveLength(80);
    expect(units.every((unit) => unit.status === "approved")).toBe(true);
    expect(topics.every((topic) => topic.status === "approved")).toBe(true);
    expect(units.every((unit) => Boolean(unit.review?.reviewedAt && unit.review.note))).toBe(true);
    expect(topics.every((topic) => Boolean(topic.review?.reviewedAt && topic.review.note))).toBe(
      true,
    );
  });

  it("has ≥2 approved grammar exercises per topic (recognition + application)", () => {
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
      expect(
        forTopic.every(
          (exercise) =>
            Boolean(exercise.review?.note) &&
            !/не утвержд|чернов|not language-approved/i.test(exercise.explanation.ru),
        ),
      ).toBe(true);
    }
  });

  it("has ≥12 approved senses and ≥4 approved vocabulary exercises per unit", () => {
    for (const unit of units) {
      const unitLinks = links.filter(
        (link) => link.unitLogicalId === unit.logicalId && link.role === "primary",
      );
      expect(unitLinks.length).toBeGreaterThanOrEqual(12);

      for (const link of unitLinks) {
        const entry = entriesById.get(link.entryLogicalId);
        expect(entry).toBeTruthy();
        expect(entry!.status).toBe("approved");
        expect(entry!.review?.reviewedAt && entry!.review.note).toBeTruthy();
      }

      const unitExercises = vocabularyExercises.filter(
        (exercise) => exercise.unitLogicalId === unit.logicalId,
      );
      expect(unitExercises.length).toBeGreaterThanOrEqual(4);
      expect(
        unitExercises.every(
          (exercise) => !/не утвержд|чернов|not language-approved/i.test(exercise.explanation.ru),
        ),
      ).toBe(true);
    }
  });

  it("has ≥1 approved canonical passage and ≥3 approved reading exercises per unit", () => {
    expect(selection.selected).toHaveLength(16);
    expect(selection.selected.every((row) => row.status === "approved")).toBe(true);

    for (const unit of units) {
      const unitPassages = passages.filter((passage) => passage.unitLogicalId === unit.logicalId);
      expect(unitPassages.length).toBeGreaterThanOrEqual(1);
      expect(
        unitPassages.every((passage) => Boolean(passage.review?.reviewedAt && passage.review.note)),
      ).toBe(true);

      const unitExercises = readingExercises.filter(
        (exercise) => exercise.unitLogicalId === unit.logicalId,
      );
      expect(unitExercises.length).toBeGreaterThanOrEqual(3);
      expect(
        unitExercises.every(
          (exercise) => !/не утвержд|чернов|not language-approved/i.test(exercise.explanation.ru),
        ),
      ).toBe(true);
    }
  });

  it("requires explanations on every approved exercise in the minimum banks", () => {
    for (const exercise of [...grammarExercises, ...vocabularyExercises, ...readingExercises]) {
      expect(exercise.explanation.ru.trim().length).toBeGreaterThan(0);
      expect(exercise.status).toBe("approved");
    }
  });

  it("records contested decisions explicitly in the language-review manifest", () => {
    const manifest = JSON.parse(
      readFileSync(path.join(PHASE_2_CONTENT_ROOT, "language-review-decisions.json"), "utf8"),
    ) as {
      decisions: Array<{ logicalId: string; contested: boolean; decision: string }>;
    };
    const contested = manifest.decisions.filter((item) => item.contested);
    expect(contested.length).toBeGreaterThanOrEqual(10);
    expect(contested.every((item) => item.decision === "approve")).toBe(true);
    for (const id of [
      "grammar.u07.n03",
      "grammar.u12.n01",
      "grammar.u07.n05",
      "grammar.u09.n02",
      "passage.u02.section.37",
      "passage.u07.section.s031",
      "passage.u09.section.149",
    ]) {
      expect(contested.some((item) => item.logicalId === id)).toBe(true);
    }
  });
});
