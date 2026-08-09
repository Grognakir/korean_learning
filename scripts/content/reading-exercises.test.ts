import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertPublicExerciseShape,
  toPublicExercise,
} from "../../src/features/training/presentation/PublicExercise";
import type { Exercise } from "../../src/features/training/domain";

import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "./contentValidation";

describe("phase-2 reading exercise bank", () => {
  const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);
  const selection = JSON.parse(
    readFileSync(path.join(PHASE_2_CONTENT_ROOT, "reading-bank-selection.json"), "utf8"),
  ) as {
    selected: Array<{
      unitLogicalId: string;
      passageLogicalId: string;
      status: string;
      hasBlankMarkers: boolean;
    }>;
  };

  const bankExercises = graph.exercisesReading.items.filter((exercise) =>
    exercise.logicalId.startsWith("exercise.reading.bank."),
  );
  const examExercises = graph.exercisesReading.items.filter((exercise) =>
    exercise.logicalId.startsWith("exercise.reading.exam."),
  );
  const passagesById = new Map(
    graph.readingPassages.items.map((passage) => [passage.logicalId, passage]),
  );

  it("selects one canonical passage and three bank questions per unit", () => {
    expect(selection.selected).toHaveLength(16);
    expect(bankExercises).toHaveLength(48);
    expect(examExercises).toHaveLength(100);
    expect(graph.exercisesReading.items).toHaveLength(148);

    for (const unit of graph.units.items) {
      const selected = selection.selected.find((row) => row.unitLogicalId === unit.logicalId);
      expect(selected).toBeTruthy();
      const passage = passagesById.get(selected!.passageLogicalId);
      expect(passage).toBeTruthy();
      expect(passage!.unitLogicalId).toBe(unit.logicalId);
      expect(["reviewed", "needs_review"]).toContain(passage!.status);
      expect(passage!.bodyRu).toBeNull();

      const unitBank = bankExercises.filter(
        (exercise) => exercise.unitLogicalId === unit.logicalId,
      );
      expect(unitBank).toHaveLength(3);
      expect(
        unitBank.every(
          (exercise) =>
            exercise.readingPassageLogicalId === selected!.passageLogicalId &&
            exercise.contentVersion === passage!.contentVersion &&
            exercise.exerciseType === "single-choice",
        ),
      ).toBe(true);
    }
  });

  it("keeps correct options supported by the passage and avoids marker replacement answers", () => {
    for (const exercise of bankExercises) {
      const passage = passagesById.get(exercise.readingPassageLogicalId!)!;
      const correct = exercise.options.find((option) => option.id === exercise.correctOptionId);
      expect(correct).toBeTruthy();

      if (exercise.logicalId.endsWith(".q01")) {
        expect(correct!.label.ko).toBe(passage.title.ko);
      } else if (exercise.logicalId.endsWith(".q02")) {
        expect(passage.bodyKo.includes(correct!.label.ko)).toBe(true);
      } else if (exercise.logicalId.endsWith(".q03")) {
        expect(passage.bodyKo.includes(correct!.label.ko)).toBe(true);
        expect(exercise.prompt.ko).toContain("____");
        expect(correct!.label.ko).not.toMatch(/[㉠㉡㉢㉣]/u);
      }

      expect(exercise.explanation.ru).toMatch(/Фрагмент:/);
      expect(JSON.stringify(exercise)).not.toMatch(/аудирован/i);
    }
  });

  it("keeps exam imports draft and hides answers in public DTO", () => {
    expect(examExercises.every((exercise) => exercise.status === "draft")).toBe(true);
    expect(bankExercises.every((exercise) => exercise.status === "draft")).toBe(true);

    const sample = bankExercises[0]!;
    const domain = {
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000301",
      logicalId: sample.logicalId,
      moduleSlug: "u01",
      topicIds: [],
      type: "single-choice" as const,
      difficulty: "easy" as const,
      prompt: sample.prompt,
      explanation: sample.explanation,
      contentVersion: "1.0.0" as const,
      scoring: { points: 1, partialCredit: false },
      options: sample.options,
      correctOptionId: sample.correctOptionId!,
      passage: {
        logicalId: sample.readingPassageLogicalId!,
        title: passagesById.get(sample.readingPassageLogicalId!)!.title,
        bodyKo: passagesById.get(sample.readingPassageLogicalId!)!.bodyKo,
      },
    } satisfies Exercise;

    const publicExercise = toPublicExercise(domain, { seed: 21 });
    assertPublicExerciseShape(publicExercise);
    expect(JSON.stringify(publicExercise)).not.toContain("correctOptionId");
    expect(JSON.stringify(publicExercise)).not.toContain("acceptedAnswers");
  });
});
