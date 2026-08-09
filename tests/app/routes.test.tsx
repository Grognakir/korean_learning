import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DictionaryPage from "@/app/dictionary/page";
import LoginPage from "@/app/login/page";
import ProgressPage from "@/app/progress/page";
import ReviewPage from "@/app/review/page";
import ModulePage from "@/app/topics/[moduleSlug]/page";
import TopicsPage from "@/app/topics/page";
import SessionPage from "@/app/training/[sessionId]/page";
import TrainingPage from "@/app/training/page";

vi.mock("@/features/authentication/server/getServerAuthUser", () => ({
  getServerAuthUser: vi.fn(async () => null),
}));

const ASYNC_STATIC_ROUTES = [
  ["Темы", TopicsPage],
  ["Тренировка", TrainingPage],
] as const;

const SYNC_STATIC_ROUTES = [
  ["Повторение", ReviewPage],
  ["Словарь", DictionaryPage],
] as const;

describe("application routes", () => {
  it.each(ASYNC_STATIC_ROUTES)(
    "renders the %s route with one page heading",
    async (title, Page) => {
      render(await Page());

      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    },
  );

  it("renders the progress route for guests", async () => {
    render(await ProgressPage());

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
    render(await TrainingPage());

    expect(screen.getByText(/доступно 14 заданий/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Начать тренировку" })).toHaveAttribute(
      "href",
      "/training/demo-session",
    );
  });

  it("renders a module detail route", async () => {
    render(await ModulePage({ params: Promise.resolve({ moduleSlug: "sample-module" }) }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Первые шаги в корейском" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Основы хангыля" })).toBeInTheDocument();
    expect(screen.getByText("1급")).toHaveAttribute("lang", "ko");
  });

  it("marks the training module level badge with lang=ko", async () => {
    render(await TrainingPage());

    expect(screen.getByText("1급")).toHaveAttribute("lang", "ko");
  });

  it("renders the demo training session route", async () => {
    render(await SessionPage({ params: Promise.resolve({ sessionId: "demo-session" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "Учебная сессия" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
