import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./LoginForm";

const signInWithOtp = vi.fn();

vi.mock("@/lib/supabase/browserClient", () => ({
  createBrowserSupabaseClient: vi.fn(() => ({
    auth: {
      signInWithOtp,
    },
  })),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInWithOtp.mockResolvedValue({ error: null });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByRole("textbox", { name: /Email/i }), "bad-email");
    await user.click(screen.getByRole("button", { name: "Получить ссылку для входа" }));

    expect(screen.getByText("Введите корректный email.")).toBeInTheDocument();
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it("submits a valid email and shows success state", async () => {
    const user = userEvent.setup();
    render(<LoginForm nextPath="/training" />);

    await user.type(screen.getByRole("textbox", { name: /Email/i }), "learner@example.com");
    await user.click(screen.getByRole("button", { name: "Получить ссылку для входа" }));

    await waitFor(() => {
      expect(signInWithOtp).toHaveBeenCalledWith({
        email: "learner@example.com",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback?next=%2Ftraining"),
        },
      });
    });

    expect(screen.getByText(/Проверьте почту/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Получить ссылку для входа" })).toBeDisabled();
  });

  it("blocks duplicate submit while pending", async () => {
    let resolveSubmit: (() => void) | undefined;
    signInWithOtp.mockImplementation(
      () =>
        new Promise<{ error: null }>((resolve) => {
          resolveSubmit = () => resolve({ error: null });
        }),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByRole("textbox", { name: /Email/i }), "learner@example.com");
    await user.click(screen.getByRole("button", { name: "Получить ссылку для входа" }));

    expect(screen.getByRole("button", { name: "Отправляем..." })).toBeDisabled();
    expect(signInWithOtp).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Отправляем..." }));
    expect(signInWithOtp).toHaveBeenCalledTimes(1);

    resolveSubmit?.();
    await waitFor(() => {
      expect(screen.getByText(/Проверьте почту/i)).toBeInTheDocument();
    });
  });

  it("shows a safe provider error without secrets", async () => {
    signInWithOtp.mockResolvedValue({
      error: { message: "secret-provider-token-123", name: "AuthApiError", status: 400 },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByRole("textbox", { name: /Email/i }), "learner@example.com");
    await user.click(screen.getByRole("button", { name: "Получить ссылку для входа" }));

    expect(
      await screen.findByText("Не удалось отправить ссылку для входа. Попробуйте позже."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/secret-provider-token-123/)).not.toBeInTheDocument();
  });

  it("maps callback errors to safe messages", () => {
    render(<LoginForm callbackError="auth_callback_failed" />);

    expect(screen.getByText(/Ссылка для входа недействительна/i)).toBeInTheDocument();
  });
});
