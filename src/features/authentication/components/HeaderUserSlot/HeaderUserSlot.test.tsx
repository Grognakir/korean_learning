import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HeaderUserSlot } from "./HeaderUserSlot";

const usePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

vi.mock("@/features/admin/components/AdminLogoutButton/AdminLogoutButton", () => ({
  AdminLogoutButton: () => <button type="submit">Выйти</button>,
}));

describe("HeaderUserSlot", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows learner controls outside admin", () => {
    usePathname.mockReturnValue("/topics");
    render(
      <HeaderUserSlot>
        <a href="/login">Войти</a>
      </HeaderUserSlot>,
    );
    expect(screen.getByRole("link", { name: "Войти" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Админ-панель" })).not.toBeInTheDocument();
  });

  it("shows a development-only admin shortcut left of learner controls", () => {
    vi.stubEnv("NODE_ENV", "development");
    usePathname.mockReturnValue("/");
    render(
      <HeaderUserSlot>
        <a href="/login">Войти</a>
      </HeaderUserSlot>,
    );

    const adminLink = screen.getByRole("link", { name: "Админ-панель" });
    const loginLink = screen.getByRole("link", { name: "Войти" });
    expect(adminLink).toHaveAttribute("href", "/admin");
    expect(adminLink.compareDocumentPosition(loginLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows admin logout on dashboard routes", () => {
    usePathname.mockReturnValue("/admin/units");
    render(
      <HeaderUserSlot>
        <a href="/login">Войти</a>
      </HeaderUserSlot>,
    );
    expect(screen.getByRole("button", { name: "Выйти" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Войти" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Админ-панель" })).not.toBeInTheDocument();
  });
});
