import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GrammarMarkdownBody } from "./GrammarMarkdownBody";

describe("GrammarMarkdownBody", () => {
  it("renders source-synced meaning, rules, and examples from Markdown", () => {
    render(
      <GrammarMarkdownBody
        markdown={[
          '## V-아/어/여야 되다/하다 — "должен, нужно"',
          "",
          "#### **Значение грамматики**",
          "",
          "Используется для выражения **необходимости**",
          "",
          "#### **Правила грамматики**",
          "",
          "- **하다 → 해야 되다 / 하다**",
          "",
          "#### **Примеры**",
          "",
          "- **약을 먹어야 돼요.** - Нужно принять лекарство.",
        ].join("\n")}
      />,
    );

    expect(screen.getByRole("heading", { name: /V-아\/어\/여야 되다\/하다/ })).toBeInTheDocument();
    expect(screen.getByText(/необходимости/)).toBeInTheDocument();
    expect(screen.getByText(/약을 먹어야 돼요/)).toBeInTheDocument();
  });

  it("renders numbered markdown lists as an ordered list", () => {
    render(
      <GrammarMarkdownBody
        markdown={["1. Первый", "2. Второй", "3. Третий"].join("\n")}
      />,
    );

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Первый");
    expect(items[1]).toHaveTextContent("Второй");
    expect(items[2]).toHaveTextContent("Третий");
  });

  it("keeps mixed unordered and ordered lists as separate blocks", () => {
    const { container } = render(
      <GrammarMarkdownBody markdown={["- пункт", "1. пункт"].join("\n")} />,
    );

    const lists = container.querySelectorAll("ul, ol");
    expect(lists).toHaveLength(2);
    expect(lists[0]?.tagName).toBe("UL");
    expect(lists[1]?.tagName).toBe("OL");
    expect(lists[0]?.querySelectorAll("li")).toHaveLength(1);
    expect(lists[1]?.querySelectorAll("li")).toHaveLength(1);
  });
});
