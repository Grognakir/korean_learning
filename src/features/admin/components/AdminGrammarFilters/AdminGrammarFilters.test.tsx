import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminGrammarFilters } from "./AdminGrammarFilters";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("AdminGrammarFilters", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("updates status filter in the URL", async () => {
    const user = userEvent.setup();
    render(
      <AdminGrammarFilters
        q={null}
        status={null}
        unitId={null}
        unitOptions={[{ value: "u1", label: "u01 — Приветствие" }]}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Статус" }));
    await user.click(screen.getByRole("option", { name: "Черновик" }));

    expect(replace).toHaveBeenCalledWith("/admin/grammar?status=draft", { scroll: false });
  });
});
