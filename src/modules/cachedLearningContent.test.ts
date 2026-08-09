import { beforeEach, describe, expect, it, vi } from "vitest";

import { LearningContentError } from "./resolveLearningContent";

type GetLocalLearningContent = typeof import("./resolveLearningContent").getLocalLearningContent;

const { getLocalLearningContentMock, original } = vi.hoisted(() => ({
  getLocalLearningContentMock: vi.fn(),
  original: {} as { current: GetLocalLearningContent },
}));

vi.mock("./resolveLearningContent", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./resolveLearningContent")>();

  original.current = actual.getLocalLearningContent;

  return { ...actual, getLocalLearningContent: getLocalLearningContentMock };
});

function breakContentStore(): void {
  getLocalLearningContentMock.mockImplementation(() => {
    throw new LearningContentError("content store is down");
  });
}

describe("cached learning content", () => {
  beforeEach(() => {
    getLocalLearningContentMock.mockImplementation(original.current);
  });

  it("reports published content as ready", async () => {
    const { getCachedPublishedModules, getCachedExerciseCountByModuleSlug } =
      await import("./cachedLearningContent");

    const modules = await getCachedPublishedModules();
    const count = await getCachedExerciseCountByModuleSlug("sample-module");

    expect(modules.status).toBe("ready");
    expect(count.status).toBe("ready");
  });

  it("reports a store failure as unavailable instead of throwing", async () => {
    const {
      getCachedPublishedModules,
      getCachedPublishedModuleBySlug,
      getCachedExerciseCountsByModuleSlug,
      getCachedExerciseCountByModuleSlug,
      getCachedExercisesByModuleSlug,
    } = await import("./cachedLearningContent");

    breakContentStore();

    await expect(getCachedPublishedModules()).resolves.toEqual({ status: "unavailable" });
    await expect(getCachedPublishedModuleBySlug("sample-module")).resolves.toEqual({
      status: "unavailable",
    });
    await expect(getCachedExerciseCountsByModuleSlug()).resolves.toEqual({
      status: "unavailable",
    });
    await expect(getCachedExerciseCountByModuleSlug("sample-module")).resolves.toEqual({
      status: "unavailable",
    });
    await expect(getCachedExercisesByModuleSlug("sample-module")).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("rethrows failures that are not content-store failures", async () => {
    const { getCachedPublishedModules } = await import("./cachedLearningContent");

    getLocalLearningContentMock.mockImplementation(() => {
      throw new TypeError("programmer error");
    });

    await expect(getCachedPublishedModules()).rejects.toThrow(TypeError);
  });
});
