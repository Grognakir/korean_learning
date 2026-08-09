import { describe, expect, it } from "vitest";

import {
  isKnownContentRoute,
  matchContentRoute,
  PLACEHOLDER_MODULE_SLUG,
} from "./resolveRouteExistence";

const PUBLISHED = new Set(["sample-module"]);

describe("matchContentRoute", () => {
  it("matches single-segment module and session routes", () => {
    expect(matchContentRoute("/topics/sample-module")).toEqual({
      kind: "module",
      slug: "sample-module",
    });
    expect(matchContentRoute("/training/demo-session")).toEqual({
      kind: "session",
      sessionId: "demo-session",
    });
  });

  it("ignores list routes and deeper paths", () => {
    expect(matchContentRoute("/topics")).toBeNull();
    expect(matchContentRoute("/training")).toBeNull();
    expect(matchContentRoute("/topics/sample-module/extra")).toBeNull();
    expect(matchContentRoute("/progress")).toBeNull();
  });

  it("decodes escaped segments and rejects malformed ones", () => {
    expect(matchContentRoute("/topics/%D1%82%D0%B5%D0%BC%D0%B0")).toEqual({
      kind: "module",
      slug: "тема",
    });
    expect(matchContentRoute("/topics/%E0%A4%A")).toBeNull();
  });
});

describe("isKnownContentRoute", () => {
  it("accepts published modules and rejects unknown slugs", () => {
    expect(isKnownContentRoute({ kind: "module", slug: "sample-module" }, PUBLISHED)).toBe(true);
    expect(isKnownContentRoute({ kind: "module", slug: "missing-module" }, PUBLISHED)).toBe(false);
  });

  it("always accepts the demo session", () => {
    expect(isKnownContentRoute({ kind: "session", sessionId: "demo-session" }, PUBLISHED)).toBe(
      true,
    );
  });

  it("never treats the prerender placeholder slug as a published module", () => {
    expect(isKnownContentRoute({ kind: "module", slug: PLACEHOLDER_MODULE_SLUG }, PUBLISHED)).toBe(
      false,
    );
  });

  it("rejects unknown session ids including the removed honorifics preview", () => {
    expect(isKnownContentRoute({ kind: "session", sessionId: "missing-session" }, PUBLISHED)).toBe(
      false,
    );
    expect(
      isKnownContentRoute({ kind: "session", sessionId: "honorifics-preview" }, PUBLISHED),
    ).toBe(false);
  });
});
