import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { generateStaticParams as generateModuleParams } from "@/app/topics/[moduleSlug]/page";
import { ModuleDetailPanel } from "@/app/topics/[moduleSlug]/ModuleDetailPanel";
import TopicsPage from "@/app/topics/page";
import { TopicsCatalog } from "@/app/topics/TopicsCatalog";
import { SessionPageContent } from "@/app/training/[sessionId]/SessionExercisePanel";
import { ExercisesEmptyState } from "@/components/feedback";
import {
  ExerciseRepositoryError,
  LocalExerciseRepository,
  ModuleRegistry,
  TrainingSessionError,
  createTrainingSession,
} from "@/features/training";
import { learningModuleRegistry } from "@/modules";

import { createChoiceExercise } from "../factories/exerciseFactory";
import { createTestModule } from "../factories/moduleFactory";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/topics",
}));

describe("module routing integration", () => {
  it("generates module routes from sample and curriculum catalogs", async () => {
    const params = await generateModuleParams();
    const published = (await learningModuleRegistry.getPublished()).map((entry) => entry.slug);
    const slugs = params.map((entry) => entry.moduleSlug);

    expect(slugs).toEqual(expect.arrayContaining([...published, "u01", "u02"]));
    expect(params.some((entry) => entry.moduleSlug === "sample-module")).toBe(true);
    expect(params.some((entry) => entry.moduleSlug === "u16-draft-only")).toBe(false);
  });

  it("renders catalog and module pages from the live registry", async () => {
    render(<TopicsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Темы" })).toBeInTheDocument();

    render(await TopicsCatalog({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("tab", { name: "По темам" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "인사와 소개" })).toBeInTheDocument();

    render(
      await ModuleDetailPanel({
        moduleSlug: "sample-module",
        searchParams: Promise.resolve({}),
      }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "Первые шаги в корейском" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Основы хангыля" })).toBeInTheDocument();

    render(
      await ModuleDetailPanel({
        moduleSlug: "u01",
        searchParams: Promise.resolve({}),
      }),
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "приветствие и представление" }),
    ).toBeInTheDocument();
    expect(screen.getByText("N입니다/입니까?")).toBeInTheDocument();

    render(
      await ModuleDetailPanel({
        moduleSlug: "u01",
        searchParams: Promise.resolve({ grammar: "grammar.u01.n01" }),
      }),
    );
    expect(screen.getByRole("heading", { name: "N입니다/입니까?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Тренировать конструкцию" })).toHaveAttribute(
      "href",
      "/training?skill=grammar&unit=u01&grammar=grammar.u01.n01",
    );
  });

  it("calls notFound for unknown module and session ids", async () => {
    await expect(
      ModuleDetailPanel({ moduleSlug: "missing-module", searchParams: Promise.resolve({}) }),
    ).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });

    await expect(SessionPageContent({ sessionId: "missing-session" })).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });
  });

  it("rejects unknown module refs before exercises reach the UI", () => {
    const registry = new ModuleRegistry([createTestModule()]);
    const orphan = createChoiceExercise({
      id: "33333333-3333-4333-8333-333333333301",
      logicalId: "orphan-choice",
      moduleSlug: "missing-module",
    });

    expect(() => new LocalExerciseRepository([orphan], registry)).toThrow(ExerciseRepositoryError);
    expect(() => new LocalExerciseRepository([orphan], registry)).toThrow(/unknown-module/);
  });

  it("rejects empty exercise queues before a session can start", () => {
    expect(() =>
      createTrainingSession({
        sessionId: "empty",
        moduleSlug: "integration-module",
        mode: "practice",
        seed: 1,
        exerciseIds: [],
        startedAt: "2026-08-08T10:00:00.000Z",
        contentSnapshot: { contentVersion: "1.0.0", exerciseIds: [] },
      }),
    ).toThrow(TrainingSessionError);
  });

  it("shows ExercisesEmptyState when a session has no tasks", () => {
    render(<ExercisesEmptyState />);

    expect(screen.getByRole("heading", { name: "Заданий нет" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "К тренировке" })).toHaveAttribute("href", "/training");
  });

  it("lists zero exercises for an unmatched filter without throwing", async () => {
    const learningModule = createTestModule();
    const registry = new ModuleRegistry([learningModule]);
    const exercise = createChoiceExercise({
      id: "33333333-3333-4333-8333-333333333302",
      logicalId: "listed-choice",
      moduleSlug: learningModule.slug,
      topicIds: [learningModule.topics[0]!.id],
    });
    const repository = new LocalExerciseRepository([exercise], registry);

    expect(await repository.list({ moduleSlug: "no-such-module" })).toEqual([]);
    expect(await repository.list({ moduleSlug: learningModule.slug })).toHaveLength(1);
  });
});
