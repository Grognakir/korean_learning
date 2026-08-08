import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UserMenu } from "./UserMenu";

vi.mock("@/features/authentication/server/signOutAction", () => ({
  signOutAction: vi.fn(),
}));

describe("UserMenu", () => {
  it("shows a login link for guests", () => {
    render(<UserMenu user={null} />);

    expect(screen.getByRole("link", { name: "Войти" })).toHaveAttribute("href", "/login");
  });

  it("shows the authenticated user label and sign-out control", async () => {
    const user = userEvent.setup();
    const { signOutAction } = await import("@/features/authentication/server/signOutAction");

    render(<UserMenu user={{ id: "user-1", email: "learner@example.com" }} />);

    expect(screen.getByText("learner")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Выйти" }));
    expect(signOutAction).toHaveBeenCalledTimes(1);
  });
});
