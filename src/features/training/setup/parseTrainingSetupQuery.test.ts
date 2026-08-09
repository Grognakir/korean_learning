import { describe, expect, it } from "vitest";

import { buildTrainingSetupHref, parseTrainingSetupQuery } from "./parseTrainingSetupQuery";

describe("parseTrainingSetupQuery", () => {
  it("reads skill filters and ignores unknown values", () => {
    expect(parseTrainingSetupQuery({})).toEqual({
      skill: null,
      unitSlug: null,
      grammarTopicId: null,
      difficulty: null,
      sessionSize: null,
    });
    expect(
      parseTrainingSetupQuery({
        skill: "grammar",
        unit: "u01",
        grammar: "grammar.u01.n01",
        difficulty: "easy",
        size: "8",
      }),
    ).toEqual({
      skill: "grammar",
      unitSlug: "u01",
      grammarTopicId: "grammar.u01.n01",
      difficulty: "easy",
      sessionSize: 8,
    });
    expect(parseTrainingSetupQuery({ skill: "speaking" }).skill).toBeNull();
  });
});

describe("buildTrainingSetupHref", () => {
  it("keeps deterministic query order for setup links", () => {
    expect(
      buildTrainingSetupHref({
        skill: "reading",
        unitSlug: "u01",
        sessionSize: 5,
      }),
    ).toBe("/training?skill=reading&unit=u01&size=5");
  });
});
