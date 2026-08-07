import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthBoundary } from "./AuthBoundary";

describe("AuthBoundary", () => {
  it("renders public content for a guest", () => {
    render(<AuthBoundary>Гостевой режим</AuthBoundary>);

    expect(screen.getByText("Гостевой режим")).toBeInTheDocument();
  });
});
