import { describe, expect, it } from "vitest";

import { buildSkillConceptKey, parseConceptKey } from "./conceptKey";

describe("conceptKey", () => {
  it("builds skill-prefixed keys and parses them back", () => {
    const key = buildSkillConceptKey("grammar", "grammar.u01.n01");
    expect(key).toBe("grammar:grammar.u01.n01");
    expect(parseConceptKey(key)).toEqual({
      kind: "skill-target",
      skill: "grammar",
      targetLogicalId: "grammar.u01.n01",
    });
  });

  it("keeps bare exercise logical ids as legacy keys", () => {
    expect(parseConceptKey("choose-home-meaning")).toEqual({
      kind: "legacy-exercise",
      exerciseLogicalId: "choose-home-meaning",
    });
  });
});
