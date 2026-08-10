import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminLoginForm } from "./AdminLoginForm";

vi.mock("@/features/admin/actions/adminLoginAction", () => ({
  adminLoginAction: vi.fn(),
}));

describe("AdminLoginForm", () => {
  it("prefills credentials when defaults are provided", () => {
    render(<AdminLoginForm defaultPassword="dev-pass" defaultUsername="dev-user" />);

    expect(screen.getByLabelText(/Логин/)).toHaveValue("dev-user");
    expect(screen.getByLabelText(/Пароль/)).toHaveValue("dev-pass");
  });

  it("leaves fields empty without defaults", () => {
    render(<AdminLoginForm />);

    expect(screen.getByLabelText(/Логин/)).toHaveValue("");
    expect(screen.getByLabelText(/Пароль/)).toHaveValue("");
  });
});
