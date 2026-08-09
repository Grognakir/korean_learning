import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DictionaryPage from "@/app/dictionary/page";
import LoginPage from "@/app/login/page";
import { ProgressDataPanel } from "@/app/progress/ProgressDataPanel";
import ProgressPage from "@/app/progress/page";
import ReviewPage from "@/app/review/page";
import { ModuleDetailPanel } from "@/app/topics/[moduleSlug]/ModuleDetailPanel";
import TopicsPage from "@/app/topics/page";
import {
  SessionExercisePanel,
  resolveSession,
} from "@/app/training/[sessionId]/SessionExercisePanel";
import { TrainingModulesPanel } from "@/app/training/TrainingModulesPanel";
import TrainingPage from "@/app/training/page";

vi.mock("@/features/authentication/server/getServerAuthUser", () => ({
  getServerAuthUser: vi.fn(async () => null),
}));

const STATIC_SHELL_ROUTES = [
  ["Темы", TopicsPage],
  ["Тренировка", TrainingPage],
] as const;

const SYNC_STATIC_ROUTES = [
  ["Повторение", ReviewPage],
  ["Словарь", DictionaryPage],
] as const;

describe("application routes", () => {
  it.each(STATIC_SHELL_ROUTES)("renders the %s route with one page heading", (title, Page) => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
  });

  it("renders the progress route for guests", async () => {
    render(<ProgressPage />);
    render(await ProgressDataPanel());

    expect(screen.getByRole("heading", { level: 1, name: "Прогресс" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Войдите, чтобы видеть прогресс" }),
    ).toBeInTheDocument();
  });

  it.each(SYNC_STATIC_ROUTES)("renders the %s route with one page heading", (title, Page) => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
  });

  it("renders the login route with one page heading", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { level: 1, name: "Вход" })).toBeInTheDocument();
  });

  it("loads the validated local exercise set on the training route", async () => {
    render(await TrainingModulesPanel());

    expect(screen.getByText(/доступно 14 заданий/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Начать тренировку" })).toHaveAttribute(
      "href",
      "/training/demo-session",
    );
  });

  it("renders a module detail route", async () => {
    render(await ModuleDetailPanel({ moduleSlug: "sample-module" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Первые шаги в корейском" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Основы хангыля" })).toBeInTheDocument();
    expect(screen.getByText("1급")).toHaveAttribute("lang", "ko");
  });

  it("marks the training module level badge with lang=ko", async () => {
    render(await TrainingModulesPanel());

    expect(screen.getByText("1급")).toHaveAttribute("lang", "ko");
  });

  it("renders the demo training session route", async () => {
    const session = await resolveSession("demo-session");
    expect(session).not.toBeNull();
    render(await SessionExercisePanel({ session: session! }));

    expect(screen.getByRole("heading", { level: 1, name: "Учебная сессия" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
