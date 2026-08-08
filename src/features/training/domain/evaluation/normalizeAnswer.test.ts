import { describe, expect, it } from "vitest";

import { normalizeAnswer } from "./normalizeAnswer";

describe("normalizeAnswer", () => {
  it("applies Unicode NFC", () => {
    const decomposed = "아".normalize("NFD");
    expect(normalizeAnswer(decomposed)).toBe(decomposed.normalize("NFC"));
  });

  it("trims and collapses whitespace sequences", () => {
    expect(normalizeAnswer("  안녕   하세요  ")).toBe("안녕 하세요");
  });

  it("keeps letter case and punctuation", () => {
    expect(normalizeAnswer("Hello, World!")).toBe("Hello, World!");
  });
});
