import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("connects its title, description, and action", () => {
    render(
      <EmptyState
        action={<Button>Выбрать тему</Button>}
        description="Сначала добавьте материал для повторения."
        title="Здесь пока пусто"
      />,
    );

    const region = screen.getByRole("region", { name: "Здесь пока пусто" });

    expect(region).toHaveAccessibleDescription("Сначала добавьте материал для повторения.");
    expect(screen.getByRole("button", { name: "Выбрать тему" })).toBeEnabled();
  });
});
