import { describe, expect, it } from "vitest";

import {
  isKnownContentRoute,
  matchContentRoute,
  PLACEHOLDER_MODULE_SLUG,
} from "./resolveRouteExistence";

const PUBLISHED = new Set(["u01"]);

describe("matchContentRoute", () => {
  it("matches single-segment module and session routes", () => {
    expect(matchContentRoute("/topics/u01")).toEqual({
      kind: "module",
      slug: "u01",
    });
    expect(matchContentRoute("/training/filt__grammar__u01__none__none__2__1")).toEqual({
      kind: "session",
      sessionId: "filt__grammar__u01__none__none__2__1",
    });
  });

  it("ignores list routes and deeper paths", () => {
    expect(matchContentRoute("/topics")).toBeNull();
    expect(matchContentRoute("/training")).toBeNull();
    expect(matchContentRoute("/topics/u01/extra")).toBeNull();
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
    expect(isKnownContentRoute({ kind: "module", slug: "u01" }, PUBLISHED)).toBe(true);
    expect(isKnownContentRoute({ kind: "module", slug: "missing-module" }, PUBLISHED)).toBe(false);
  });

  it("rejects legacy demo session ids", () => {
    expect(isKnownContentRoute({ kind: "session", sessionId: "demo-session" }, PUBLISHED)).toBe(
      false,
    );
  });

  it("never treats the prerender placeholder slug as a published module", () => {
    expect(isKnownContentRoute({ kind: "module", slug: PLACEHOLDER_MODULE_SLUG }, PUBLISHED)).toBe(
      false,
    );
  });

  it("accepts parseable filtered guest session ids", () => {
    expect(
      isKnownContentRoute(
        {
          kind: "session",
          sessionId: "filt__grammar__u01__none__none__2__1",
        },
        PUBLISHED,
      ),
    ).toBe(true);
  });

  it("rejects unknown session ids including the removed honorifics preview", () => {
    expect(isKnownContentRoute({ kind: "session", sessionId: "missing-session" }, PUBLISHED)).toBe(
      false,
    );
    expect(
      isKnownContentRoute({ kind: "session", sessionId: "honorifics-preview" }, PUBLISHED),
    ).toBe(false);
    expect(isKnownContentRoute({ kind: "session", sessionId: "filt__broken" }, PUBLISHED)).toBe(
      false,
    );
  });
});
