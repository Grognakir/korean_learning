import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PLACEHOLDER_MODULE_SLUG } from "@/modules/resolveRouteExistence";

const UNAVAILABLE = { status: "unavailable" } as const;

const mocks = vi.hoisted(() => ({
  getCachedPublishedModules: vi.fn(),
  getCachedPublishedModuleBySlug: vi.fn(),
  getCachedExerciseCountsByModuleSlug: vi.fn(),
  getCachedExerciseCountByModuleSlug: vi.fn(),
  getCachedExercisesByModuleSlug: vi.fn(),
}));

const curriculumMocks = vi.hoisted(() => ({
  getCachedPublicUnits: vi.fn(),
  getCachedPublicUnitBySlug: vi.fn(),
  getCachedPublicGrammarTopics: vi.fn(),
  getCachedPublicGrammarTopic: vi.fn(),
  getCachedPublicDictionary: vi.fn(),
  getCachedPublicDictionaryPage: vi.fn(),
  getCachedPublicPassages: vi.fn(),
  getCachedApprovedCurriculumExercises: vi.fn(),
}));

vi.mock("@/modules/cachedLearningContent", () => mocks);
vi.mock("@/modules/curriculum/cachedCurriculumContent", () => curriculumMocks);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/training",
}));

beforeEach(() => {
  for (const loader of Object.values(mocks)) {
    loader.mockResolvedValue(UNAVAILABLE);
  }
  for (const loader of Object.values(curriculumMocks)) {
    loader.mockResolvedValue(UNAVAILABLE);
  }
});

describe("content store outage", () => {
  it("shows the service unavailable state on the topics catalog", async () => {
    const { TopicsCatalog } = await import("@/app/topics/TopicsCatalog");

    render(await TopicsCatalog({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Сервис недоступен" })).toBeInTheDocument();
  });

  it("shows the service unavailable state on a module page instead of a 404", async () => {
    const { ModuleDetailPanel } = await import("@/app/topics/[moduleSlug]/ModuleDetailPanel");

    render(
      await ModuleDetailPanel({
        moduleSlug: "sample-module",
        searchParams: Promise.resolve({}),
      }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Модуль недоступен" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Сервис недоступен" })).toBeInTheDocument();
  });

  it("shows the service unavailable state on the training modules panel", async () => {
    const { TrainingModulesPanel } = await import("@/app/training/TrainingModulesPanel");

    render(await TrainingModulesPanel({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Сервис недоступен" })).toBeInTheDocument();
  });

  it("shows the service unavailable state when session exercises cannot load", async () => {
    const { SessionExercisePanel } =
      await import("@/app/training/[sessionId]/SessionExercisePanel");

    render(
      await SessionExercisePanel({
        session: {
          kind: "filtered",
          sessionId: "filt__grammar__u01__grammar.u01.n01__none__2__17",
          moduleSlug: "u01",
          seed: 17,
          description: "Тестовая сессия",
        },
      }),
    );

    expect(screen.getByRole("heading", { name: "Сервис недоступен" })).toBeInTheDocument();
  });

  it("still prerenders one module param so the deployment can build", async () => {
    const { generateStaticParams } = await import("@/app/topics/[moduleSlug]/page");

    await expect(generateStaticParams()).resolves.toEqual([
      { moduleSlug: PLACEHOLDER_MODULE_SLUG },
    ]);
  });

  it("falls back to the placeholder param when the catalog is empty", async () => {
    mocks.getCachedPublishedModules.mockResolvedValue({ status: "ready", data: [] });

    const { generateStaticParams } = await import("@/app/topics/[moduleSlug]/page");

    await expect(generateStaticParams()).resolves.toEqual([
      { moduleSlug: PLACEHOLDER_MODULE_SLUG },
    ]);
  });
});
