import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Header } from "./Header";

describe("Header", () => {
  it("contains a branded home link", () => {
    render(<Header user={null} />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Korean Learning — на главную/ })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Войти" })).toHaveAttribute("href", "/login");
  });

  it("shows authenticated account controls", () => {
    render(<Header user={{ id: "user-1", email: "learner@example.com" }} />);

    expect(screen.getByText("learner")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Выйти" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Войти" })).not.toBeInTheDocument();
  });
});
