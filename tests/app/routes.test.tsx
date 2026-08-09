import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DictionaryPage from "@/app/dictionary/page";
import LoginPage from "@/app/login/page";
import { ProgressDataPanel } from "@/app/progress/ProgressDataPanel";
import ProgressPage from "@/app/progress/page";
import { ReviewDataPanel } from "@/app/review/ReviewDataPanel";
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/training",
}));

const STATIC_SHELL_ROUTES = [
  ["Темы", TopicsPage],
  ["Тренировка", TrainingPage],
] as const;

const SYNC_STATIC_ROUTES = [["Словарь", DictionaryPage]] as const;

describe("application routes", () => {
  it.each(STATIC_SHELL_ROUTES)("renders the %s route with one page heading", (title, Page) => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
  });

  it("renders dual catalog controls on the topics route", async () => {
    const { TopicsCatalog } = await import("@/app/topics/TopicsCatalog");
    render(await TopicsCatalog({ searchParams: Promise.resolve({ view: "grammar" }) }));

    expect(screen.getByRole("tab", { name: "По грамматике" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("describes the training route without the removed development preview", () => {
    render(<TrainingPage />);

    expect(screen.getByText(/Выберите навык, тему и фильтры/)).toBeInTheDocument();
    expect(screen.queryByText(/Draft preview|development/i)).not.toBeInTheDocument();
  });

  it("renders the progress route for guests", async () => {
    render(<ProgressPage />);
    render(await ProgressDataPanel());

    expect(screen.getByRole("heading", { level: 1, name: "Прогресс" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Войдите, чтобы видеть прогресс" }),
    ).toBeInTheDocument();
  });

  it("renders the review route for guests", async () => {
    render(<ReviewPage />);
    render(await ReviewDataPanel());

    expect(screen.getByRole("heading", { level: 1, name: "Повторение" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Войдите, чтобы видеть повторение" }),
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

  it("loads skill based training setup on the training route", async () => {
    render(
      await TrainingModulesPanel({
        searchParams: Promise.resolve({ skill: "grammar", unit: "u01" }),
      }),
    );

    expect(screen.getByRole("button", { name: "Грамматика" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("training-setup-request")).toHaveTextContent('"unitSlug": "u01"');
    expect(screen.queryByRole("link", { name: /Демо sample-module/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Начать тренировку" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/training\/filt__grammar__/),
    );
  });

  it("renders a curriculum unit detail route", async () => {
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
  });

  it("does not expose the archived sample demo from training setup", async () => {
    render(await TrainingModulesPanel({ searchParams: Promise.resolve({}) }));

    expect(screen.queryByRole("link", { name: /Демо sample-module/ })).not.toBeInTheDocument();
  });

  it("renders a filtered curriculum training session route", async () => {
    const resolution = await resolveSession("filt__grammar__u01__grammar.u01.n01__none__2__17");
    expect(resolution.status).toBe("ready");
    render(
      await SessionExercisePanel({
        session: (resolution as Extract<typeof resolution, { status: "ready" }>).session,
      }),
    );

    expect(screen.getByRole("heading", { level: 1, name: "Учебная сессия" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
