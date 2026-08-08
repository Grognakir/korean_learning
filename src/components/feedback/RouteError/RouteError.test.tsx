import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RouteError } from "./RouteError";

describe("RouteError", () => {
  it("shows a safe message and calls retry once", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <RouteError
        description="Не удалось показать эту страницу."
        onRetry={onRetry}
        title="Что-то пошло не так"
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Что-то пошло не так" })).toBeInTheDocument();
    expect(screen.queryByText(/stack|SQL|SUPABASE|uuid/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "На главную" })).toHaveAttribute("href", "/");

    await user.click(screen.getByRole("button", { name: "Попробовать снова" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
