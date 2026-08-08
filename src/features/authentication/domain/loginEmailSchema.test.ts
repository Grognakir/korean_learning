import { describe, expect, it } from "vitest";

import { loginEmailSchema } from "./loginEmailSchema";

describe("loginEmailSchema", () => {
  it("accepts a valid email", () => {
    expect(loginEmailSchema.parse(" learner@example.com ")).toBe("learner@example.com");
  });

  it("rejects an invalid email", () => {
    const result = loginEmailSchema.safeParse("not-an-email");
    expect(result.success).toBe(false);
  });

  it("rejects an empty value", () => {
    const result = loginEmailSchema.safeParse("   ");
    expect(result.success).toBe(false);
  });
});
