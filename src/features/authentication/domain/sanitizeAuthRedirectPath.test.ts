import { describe, expect, it } from "vitest";

import { sanitizeAuthRedirectPath } from "./sanitizeAuthRedirectPath";

describe("sanitizeAuthRedirectPath", () => {
  it("returns fallback for empty values", () => {
    expect(sanitizeAuthRedirectPath(undefined)).toBe("/");
    expect(sanitizeAuthRedirectPath(null, "/training")).toBe("/training");
  });

  it("allows internal allowlisted paths", () => {
    expect(sanitizeAuthRedirectPath("/training")).toBe("/training");
    expect(sanitizeAuthRedirectPath("/topics/sample-module")).toBe("/topics/sample-module");
  });

  it("rejects external and protocol-relative targets", () => {
    expect(sanitizeAuthRedirectPath("https://evil.example")).toBe("/");
    expect(sanitizeAuthRedirectPath("//evil.example/path")).toBe("/");
  });

  it("rejects encoded bypass attempts", () => {
    expect(sanitizeAuthRedirectPath("%2F%2Fevil.example")).toBe("/");
    expect(sanitizeAuthRedirectPath("%2f%2fevil.example")).toBe("/");
  });

  it("rejects paths outside the allowlist", () => {
    expect(sanitizeAuthRedirectPath("/admin")).toBe("/");
    expect(sanitizeAuthRedirectPath("/login?next=/training")).toBe("/");
  });
});
