import { describe, expect, it } from "vitest";

import { parseGrammarQuery } from "./parseGrammarQuery";

describe("parseGrammarQuery", () => {
  it("reads the first non-empty grammar logical id", () => {
    expect(parseGrammarQuery(undefined)).toBeNull();
    expect(parseGrammarQuery("")).toBeNull();
    expect(parseGrammarQuery(" grammar.u01.n01 ")).toBe("grammar.u01.n01");
    expect(parseGrammarQuery(["grammar.u02.n01", "other"])).toBe("grammar.u02.n01");
  });
});
