import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import NotFoundPage from "@/app/not-found";
import AppError from "@/app/error";
import { ModuleDetailPanel } from "@/app/topics/[moduleSlug]/ModuleDetailPanel";
import { SessionPageContent } from "@/app/training/[sessionId]/SessionExercisePanel";

describe("application state routes", () => {
  it("renders not-found actions to home and catalog", () => {
    render(<NotFoundPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Страница не найдена" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "На главную" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "К каталогу" })).toHaveAttribute("href", "/topics");
  });

  it("renders route error without technical details and retries once", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    const retry = vi.fn();
    const error = Object.assign(new Error("secret stack TRACE supabase_service_role"), {
      digest: "abc123",
    });

    render(<AppError error={error} retry={retry} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(/secret stack|supabase_service_role|TRACE/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Попробовать снова" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("calls notFound for unknown module and session ids", async () => {
    await expect(
      ModuleDetailPanel({ moduleSlug: "missing-module", searchParams: Promise.resolve({}) }),
    ).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });

    await expect(SessionPageContent({ sessionId: "missing-session" })).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });
  });
});
