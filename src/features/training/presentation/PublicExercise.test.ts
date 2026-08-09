import { describe, expect, it } from "vitest";

import { sampleExercises } from "@/modules/sample/sampleExercises";

import { assertPublicExerciseShape, toPublicExercise, toPublicExercises } from "./PublicExercise";

describe("PublicExercise", () => {
  it("removes answer keys from the serialized public payload", () => {
    const [publicExercise] = toPublicExercises(sampleExercises, { seed: 1 });

    assertPublicExerciseShape(publicExercise);
    expect(JSON.stringify(publicExercise)).not.toContain("correctOptionId");
    expect(JSON.stringify(publicExercise)).not.toContain("acceptedAnswers");
    expect(JSON.stringify(publicExercise)).not.toContain("is_correct");
  });

  it("keeps metadata required by session UI and result snapshots", () => {
    const exercise = sampleExercises[0]!;
    const publicExercise = toPublicExercise(exercise, { seed: 1 });

    expect(publicExercise.logicalId).toBe(exercise.logicalId);
    expect(publicExercise.moduleSlug).toBe(exercise.moduleSlug);
    expect(publicExercise.topicIds).toEqual(exercise.topicIds);
    expect(publicExercise.contentVersion).toBe(exercise.contentVersion);
    expect(publicExercise.prompt).toEqual({
      ko: exercise.prompt.ko,
      ru: exercise.prompt.ru,
    });
  });
});
