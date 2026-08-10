import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NAVIGATION_ITEMS } from "@/constants";

import { MobileNavigation } from "./MobileNavigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/training/demo-session",
}));

describe("MobileNavigation", () => {
  it("uses the shared mobile targets and active state", () => {
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
});
