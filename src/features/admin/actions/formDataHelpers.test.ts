import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  optionalTrimmedString,
  parseIntOrNull,
  parseMultilineList,
  zodFieldErrors,
} from "./formDataHelpers";

describe("optionalTrimmedString", () => {
  it("returns null for empty or whitespace-only values", () => {
    expect(optionalTrimmedString(null)).toBeNull();
    expect(optionalTrimmedString("")).toBeNull();
    expect(optionalTrimmedString("   ")).toBeNull();
  });

  it("returns a trimmed string for non-empty values", () => {
    expect(optionalTrimmedString("  hello  ")).toBe("hello");
  });
});

describe("parseIntOrNull", () => {
  it("returns null for empty values and non-numbers", () => {
    expect(parseIntOrNull(null)).toBeNull();
    expect(parseIntOrNull("")).toBeNull();
    expect(parseIntOrNull("   ")).toBeNull();
    expect(parseIntOrNull("not-a-number")).toBeNull();
  });

  it("parses integer strings", () => {
    expect(parseIntOrNull("16")).toBe(16);
    expect(parseIntOrNull(" 3 ")).toBe(3);
  });
});

describe("parseMultilineList", () => {
  it("returns an empty list for blank input", () => {
    expect(parseMultilineList(null)).toEqual([]);
    expect(parseMultilineList(" \n  \n")).toEqual([]);
  });

  it("splits, trims, and drops empty lines", () => {
    expect(parseMultilineList("привет\n\n  здравствуй  \n")).toEqual([
      "привет",
      "здравствуй",
    ]);
  });
});

describe("zodFieldErrors", () => {
  it("keeps only defined field error arrays", () => {
    const schema = z.object({
      slug: z.string().min(1),
      sortOrder: z.number().int(),
    });
    const result = schema.safeParse({ slug: "", sortOrder: "x" });
    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    const errors = zodFieldErrors(result.error);
    expect(errors.slug?.length).toBeGreaterThan(0);
    expect(errors.sortOrder?.length).toBeGreaterThan(0);
  });
});
