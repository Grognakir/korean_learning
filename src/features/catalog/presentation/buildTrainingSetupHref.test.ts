import { describe, expect, it } from "vitest";

import { buildTrainingSetupHref } from "./buildTrainingSetupHref";

describe("buildTrainingSetupHref", () => {
  it("builds deterministic skill and grammar query links", () => {
    expect(
      buildTrainingSetupHref({
        skill: "grammar",
        unitSlug: "u01",
        grammarTopicId: "grammar.u01.n01",
      }),
    ).toBe("/training?skill=grammar&unit=u01&grammar=grammar.u01.n01");
    expect(buildTrainingSetupHref({ skill: "reading", unitSlug: "u02" })).toBe(
      "/training?skill=reading&unit=u02",
    );
  });
});
