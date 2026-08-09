import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModulePage, {
  generateStaticParams as generateModuleParams,
} from "@/app/topics/[moduleSlug]/page";
import TopicsPage from "@/app/topics/page";
import SessionPage from "@/app/training/[sessionId]/page";
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

describe("module routing integration", () => {
  it("generates module routes from the published registry", async () => {
    const params = await generateModuleParams();
    const published = (await learningModuleRegistry.getPublished()).map((entry) => entry.slug);

    expect(params.map((entry) => entry.moduleSlug).sort()).toEqual([...published].sort());
    expect(params.some((entry) => entry.moduleSlug === "sample-module")).toBe(true);
  });

  it("renders catalog and module pages from the live registry", async () => {
    render(await TopicsPage());
    expect(screen.getByRole("heading", { level: 1, name: "Темы" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Первые шаги в корейском" })).toBeInTheDocument();

    render(await ModulePage({ params: Promise.resolve({ moduleSlug: "sample-module" }) }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Первые шаги в корейском" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Основы хангыля" })).toBeInTheDocument();
  });

  it("calls notFound for unknown module and session ids", async () => {
    await expect(
      ModulePage({ params: Promise.resolve({ moduleSlug: "missing-module" }) }),
    ).rejects.toMatchObject({ digest: expect.stringContaining("404") });

    await expect(
      SessionPage({ params: Promise.resolve({ sessionId: "missing-session" }) }),
    ).rejects.toMatchObject({ digest: expect.stringContaining("404") });
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
