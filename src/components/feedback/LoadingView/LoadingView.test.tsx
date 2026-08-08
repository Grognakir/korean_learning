import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingView } from "./LoadingView";

describe("LoadingView", () => {
  it("exposes a polite status with the provided label", () => {
    render(<LoadingView label="Загружаем модуль" />);

    expect(screen.getByRole("status", { name: "Загружаем модуль" })).toBeInTheDocument();
    expect(screen.getByText("Загружаем модуль")).toBeInTheDocument();
  });
});
