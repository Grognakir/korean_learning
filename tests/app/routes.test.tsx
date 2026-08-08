import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DictionaryPage from "@/app/dictionary/page";
import LoginPage from "@/app/login/page";
import ProgressPage from "@/app/progress/page";
import ReviewPage from "@/app/review/page";
import ModulePage from "@/app/topics/[moduleSlug]/page";
import TopicsPage from "@/app/topics/page";
import SessionPage from "@/app/training/[sessionId]/page";
import TrainingPage from "@/app/training/page";

const STATIC_ROUTES = [
  ["Темы", TopicsPage],
  ["Тренировка", TrainingPage],
  ["Повторение", ReviewPage],
  ["Прогресс", ProgressPage],
  ["Словарь", DictionaryPage],
  ["Вход", LoginPage],
] as const;

describe("application routes", () => {
  it.each(STATIC_ROUTES)("renders the %s route with one page heading", (title, Page) => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
  });

  it("loads the validated local exercise set on the training route", () => {
    render(<TrainingPage />);

    expect(screen.getByText(/доступно 14 заданий/)).toBeInTheDocument();
  });

  it("renders a module detail route", async () => {
    render(await ModulePage({ params: Promise.resolve({ moduleSlug: "sample-module" }) }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Первые шаги в корейском" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Основы хангыля" })).toBeInTheDocument();
  });

  it("renders a training session route", async () => {
    render(await SessionPage({ params: Promise.resolve({ sessionId: "demo-session" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "Учебная сессия" })).toBeInTheDocument();
    expect(screen.getByText("demo-session")).toBeInTheDocument();
  });
});
