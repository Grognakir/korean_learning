import { describe, expect, it } from "vitest";

import { parseTrainingSetupRequest, trainingSetupRequestSchema } from "./trainingSetupSchema";

describe("trainingSetupRequestSchema", () => {
  it("accepts a deterministic three-skill request", () => {
    const request = {
      skill: "grammar",
      unitSlug: "u01",
      grammarTopicId: "grammar.u01.n01",
      difficulty: "easy",
      sessionSize: 5,
    };
    expect(trainingSetupRequestSchema.parse(request)).toEqual(request);
    expect(JSON.stringify(request)).not.toMatch(/correct|answer|is_correct/i);
  });

  it("rejects invalid skills and empty units", () => {
    expect(parseTrainingSetupRequest({ skill: "speaking", unitSlug: "u01" })).toBeNull();
    expect(
      parseTrainingSetupRequest({
        skill: "reading",
        unitSlug: "",
        grammarTopicId: null,
        difficulty: null,
        sessionSize: 5,
      }),
    ).toBeNull();
  });
});
