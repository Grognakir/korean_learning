import { describe, expect, it } from "vitest";

import { HONORIFICS_MODULE_SLUG, HONORIFICS_PREVIEW_SESSION_ID } from "./honorifics/previewConstants";
import { isKnownContentRoute, matchContentRoute } from "./resolveRouteExistence";

const PUBLISHED = new Set(["sample-module"]);
const PUBLISHED_WITH_HONORIFICS = new Set(["sample-module", HONORIFICS_MODULE_SLUG]);

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

  it("gates the honorifics preview session on the module being published", () => {
    const route = { kind: "session", sessionId: HONORIFICS_PREVIEW_SESSION_ID } as const;

    expect(isKnownContentRoute(route, PUBLISHED)).toBe(false);
    expect(isKnownContentRoute(route, PUBLISHED_WITH_HONORIFICS)).toBe(true);
  });

  it("rejects unknown session ids", () => {
    expect(
      isKnownContentRoute({ kind: "session", sessionId: "missing-session" }, PUBLISHED_WITH_HONORIFICS),
    ).toBe(false);
  });
});
