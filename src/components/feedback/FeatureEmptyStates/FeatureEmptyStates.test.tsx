import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CatalogEmptyState,
  ExercisesEmptyState,
  GuestFeatureEmptyState,
  ServiceUnavailableState,
  TopicsEmptyState,
} from "./FeatureEmptyStates";

describe("FeatureEmptyStates", () => {
  it("renders catalog empty actions", () => {
    render(<CatalogEmptyState />);
    expect(screen.getByRole("heading", { name: "Каталог пуст" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "На главную" })).toHaveAttribute("href", "/");
  });

  it("renders topics and exercises empty actions", () => {
    const { rerender } = render(<TopicsEmptyState />);
    expect(screen.getByRole("link", { name: "К каталогу" })).toHaveAttribute("href", "/topics");

    rerender(<ExercisesEmptyState />);
    expect(screen.getByRole("link", { name: "К тренировке" })).toHaveAttribute("href", "/training");
  });

  it("renders guest feature and service unavailable states without technical details", () => {
    const { rerender } = render(
      <GuestFeatureEmptyState
        description="Облачный прогресс появится после подключения аккаунта."
        title="Прогресс пока локальный"
      />,
    );

    expect(screen.getByRole("link", { name: "Начать тренировку" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Открыть темы" })).toBeInTheDocument();
    expect(screen.queryByText(/stack|SQL|env|uuid/i)).not.toBeInTheDocument();

    rerender(<ServiceUnavailableState />);
    expect(screen.getByRole("heading", { name: "Сервис недоступен" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Повторить" })).toBeInTheDocument();
    expect(screen.queryByText(/аккаунт|облак|stack|SQL|env|uuid/i)).not.toBeInTheDocument();
  });
});
