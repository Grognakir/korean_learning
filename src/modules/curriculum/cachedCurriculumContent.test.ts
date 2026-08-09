import { cacheLife } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CurriculumContentError } from "./CurriculumContentError";

const { listUnitsMock } = vi.hoisted(() => ({
  listUnitsMock: vi.fn(),
}));

vi.mock("./resolveCurriculumContent", () => ({
  getCurriculumRepositories: vi.fn(async () => ({
    catalogRepository: { listUnits: listUnitsMock },
    dictionaryRepository: {},
    readingRepository: {},
  })),
}));

describe("cached curriculum content", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the normal profile for ready content", async () => {
    const { getCachedPublicUnits } = await import("./cachedCurriculumContent");
    listUnitsMock.mockResolvedValue({ status: "empty", items: [] });

    await expect(getCachedPublicUnits()).resolves.toEqual({ status: "ready", data: [] });
    expect(vi.mocked(cacheLife)).toHaveBeenCalledWith("learningContent");
  });

  it("logs store failures and caches the unavailable state briefly", async () => {
    const { getCachedPublicUnits } = await import("./cachedCurriculumContent");
    listUnitsMock.mockRejectedValue(
      new CurriculumContentError("Catalog query failed", { message: "database is down" }),
    );

    await expect(getCachedPublicUnits()).resolves.toEqual({ status: "unavailable" });
    expect(vi.mocked(cacheLife)).toHaveBeenCalledWith("learningContentUnavailable");
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      "Curriculum content unavailable: CurriculumContentError: Catalog query failed: database is down",
    );
  });

  it("does not hide programmer errors as a store outage", async () => {
    const { getCachedPublicUnits } = await import("./cachedCurriculumContent");
    listUnitsMock.mockRejectedValue(new TypeError("broken mapper"));

    await expect(getCachedPublicUnits()).rejects.toThrow(TypeError);
    expect(vi.mocked(cacheLife)).not.toHaveBeenCalled();
  });
});
