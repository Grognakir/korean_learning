import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NAVIGATION_ITEMS } from "@/constants";

import { MobileNavigation } from "./MobileNavigation";

const usePathname = vi.fn(() => "/training/demo-session");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("MobileNavigation", () => {
  it("uses the shared mobile targets and active state", () => {
    usePathname.mockReturnValue("/training/demo-session");
    const { container } = render(<MobileNavigation />);

    const mobileItems = NAVIGATION_ITEMS.filter((item) => item.mobile);

    expect(screen.getAllByRole("link")).toHaveLength(mobileItems.length);
    expect(container.querySelectorAll("nav svg")).toHaveLength(mobileItems.length);
    expect(screen.getByRole("link", { name: "Тренировка" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Повторение" })).toHaveAttribute("href", "/review");
    expect(screen.getByRole("link", { name: "Словарь" })).toHaveAttribute("href", "/dictionary");
  });

  it("shows admin sections instead of learner tabs on admin routes", () => {
    usePathname.mockReturnValue("/admin/grammar");
    render(<MobileNavigation />);

    expect(screen.getByRole("navigation", { name: "Разделы админки" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Грамматика" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Дашборд" })).toHaveAttribute("href", "/admin");
    expect(screen.queryByRole("link", { name: "Тренировка" })).not.toBeInTheDocument();
  });
});
