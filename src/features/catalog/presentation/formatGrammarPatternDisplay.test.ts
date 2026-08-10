import { describe, expect, it } from "vitest";

import { formatGrammarPatternDisplay } from "./formatGrammarPatternDisplay";

describe("formatGrammarPatternDisplay", () => {
  it("adds a space before circled sense marks", () => {
    expect(formatGrammarPatternDisplay("N은/는①")).toBe("N은/는 ①");
    expect(formatGrammarPatternDisplay("N에①")).toBe("N에 ①");
    expect(formatGrammarPatternDisplay("수②")).toBe("수 ②");
  });

  it("leaves patterns without sense marks unchanged", () => {
    expect(formatGrammarPatternDisplay("N입니다/입니까?")).toBe("N입니다/입니까?");
  });
});
