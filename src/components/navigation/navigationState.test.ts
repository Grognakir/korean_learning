import { describe, expect, it } from "vitest";

import { isNavigationItemActive } from "./navigationState";

describe("isNavigationItemActive", () => {
  it("matches nested routes without activating similarly prefixed routes", () => {
    expect(isNavigationItemActive("/topics/sample-module", "/topics")).toBe(true);
    expect(isNavigationItemActive("/topic-summary", "/topics")).toBe(false);
  });

  it("matches the home route exactly", () => {
    expect(isNavigationItemActive("/", "/")).toBe(true);
    expect(isNavigationItemActive("/topics", "/")).toBe(false);
  });
});
