import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogViewSwitch } from "./CatalogViewSwitch";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/topics",
}));

describe("CatalogViewSwitch", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("exposes resilient links and switches views with keyboard", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CatalogViewSwitch value="themes" />);

    expect(screen.getByRole("tab", { name: "По темам" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "По грамматике" })).toHaveAttribute(
      "href",
      "/topics?view=grammar",
    );

    rerender(<CatalogViewSwitch value="grammar" />);
    const grammarTab = screen.getByRole("tab", { name: "По грамматике" });
    grammarTab.focus();
    await user.keyboard("{ArrowLeft}");
    expect(replace).toHaveBeenCalledWith("/topics", { scroll: false });
  });
});
