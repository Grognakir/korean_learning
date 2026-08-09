import { afterEach, describe, expect, it } from "vitest";

import { getPublishedModuleSlugs, resetPublishedModuleSlugsCache } from "./publishedModuleSlugs";

afterEach(() => {
  resetPublishedModuleSlugsCache();
});

describe("getPublishedModuleSlugs", () => {
  it("returns published slugs from the local content source", async () => {
    const slugs = await getPublishedModuleSlugs();

    expect(slugs.has("sample-module")).toBe(true);
    expect(slugs.has("missing-module")).toBe(false);
  });

  it("reuses the memoized set within the cache window", async () => {
    const first = await getPublishedModuleSlugs();
    const second = await getPublishedModuleSlugs();

    expect(second).toBe(first);
  });
});
