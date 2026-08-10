import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserMenu } from "@/features/authentication/components/UserMenu";

import { Header } from "./Header";

describe("Header", () => {
  it("contains a branded home link", () => {
    render(<Header userMenu={<UserMenu user={null} />} />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Korean Learning — на главную/ })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Войти" })).toHaveAttribute("href", "/login");
  });

  it("keeps the user menu in a trailing header slot", () => {
    const { container } = render(<Header userMenu={<UserMenu user={null} />} />);
    const slot = container.querySelector("[class*='userMenu']");
    expect(slot).toContainElement(screen.getByRole("link", { name: "Войти" }));
  });
});
