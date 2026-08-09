import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { sampleModule } from "@/modules/sample";
import type { LearningModuleDefinition } from "@/types";

import { ModuleCard } from "./ModuleCard";

const publishedSample = {
  ...sampleModule,
  status: "published",
  topics: sampleModule.topics.map((topic) => ({ ...topic, status: "published" as const })),
} as const satisfies LearningModuleDefinition;

describe("ModuleCard", () => {
  it("renders module metadata and a valid detail link", () => {
    render(<ModuleCard module={publishedSample} />);

    expect(screen.getByRole("heading", { name: "Первые шаги в корейском" })).toBeInTheDocument();
    expect(screen.getByText("한국어 첫걸음")).toHaveAttribute("lang", "ko");
    expect(screen.getByText("1급")).toHaveAttribute("lang", "ko");
    expect(screen.getByText("2 темы")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Открыть модуль/ })).toHaveAttribute(
      "href",
      "/topics/sample-module",
    );
  });
});
