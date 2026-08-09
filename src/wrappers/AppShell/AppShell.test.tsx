import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("creates the shared page landmarks", () => {
    render(
      <AppShell userMenu={<span>Войти</span>}>Учебное содержимое</AppShell>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("main")).toHaveTextContent("Учебное содержимое");
    expect(screen.queryByText("Небольшие шаги каждый день.")).not.toBeInTheDocument();
  });
});
