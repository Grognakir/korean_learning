import { describe, expect, it } from "vitest";

import { sampleExercises } from "@/modules/sample/sampleExercises";

import { assertPublicExerciseShape, toPublicExercise } from "./PublicExercise";
import { toExerciseView } from "./toExerciseView";

describe("single-choice exercise views", () => {
  const reading = sampleExercises.find(
    (exercise) => exercise.logicalId === "single-choice-reading-intro",
  );
  const grammar = sampleExercises.find((exercise) => exercise.logicalId === "single-choice-copula");

  it("exposes a Korean passage without answer leakage", () => {
    expect(reading).toBeDefined();
    const view = toExerciseView(reading!, { seed: 17 });
    expect(view.type).toBe("single-choice");
    if (view.type !== "single-choice") {
      return;
    }
    expect(view.passage?.bodyKo).toContain("왕루");
    expect(view.options.map((option) => option.id).sort()).toEqual(["food", "intro"]);

    const publicExercise = toPublicExercise(reading!, { seed: 17 });
    assertPublicExerciseShape(publicExercise);
    expect(JSON.stringify(publicExercise)).not.toContain("correctOptionId");
  });

  it("shuffles single-choice options stably by seed", () => {
    expect(grammar).toBeDefined();
    const first = toExerciseView(grammar!, { seed: 3 });
    const second = toExerciseView(grammar!, { seed: 3 });
    expect(first).toEqual(second);
    if (first.type !== "single-choice") {
      throw new Error("Expected single-choice view");
    }
    expect(first.options.map((option) => option.id).sort()).toEqual(["ieyo", "imnida"]);

    const orders = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map((seed) => {
        const view = toExerciseView(grammar!, { seed });
        if (view.type !== "single-choice") {
          throw new Error("Expected single-choice view");
        }
        return view.options.map((option) => option.id).join(",");
      }),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});
