import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthBoundary } from "./AuthBoundary";

describe("AuthBoundary", () => {
  it("renders public content for a guest", () => {
    render(<AuthBoundary user={null}>Гостевой режим</AuthBoundary>);

    expect(screen.getByText("Гостевой режим")).toBeInTheDocument();
  });

  it("wraps authenticated children with auth context", () => {
    render(
      <AuthBoundary user={{ id: "user-1", email: "learner@example.com" }}>
        Авторизованный режим
      </AuthBoundary>,
    );

    expect(screen.getByText("Авторизованный режим")).toBeInTheDocument();
  });
});
