import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MarkdownEditor } from "./MarkdownEditor";

describe("MarkdownEditor", () => {
  it("renders a live preview for the current markdown value", () => {
    render(
      <MarkdownEditor label="Описание" name="bodyMd" onChange={() => undefined} value="**жирный**" />,
    );

    expect(screen.getByText("Превью")).toBeInTheDocument();
    expect(screen.getByText("жирный").tagName).toBe("STRONG");
  });

  it("wraps the selected textarea text when bold is clicked", () => {
    const onChange = vi.fn();

    render(<MarkdownEditor label="Описание" name="bodyMd" onChange={onChange} value="привет" />);

    const textarea = screen.getByRole("textbox", { name: "Описание" }) as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(0, 6);
    fireEvent.select(textarea);

    fireEvent.click(screen.getByRole("button", { name: "Жирный" }));

    expect(onChange).toHaveBeenCalledWith("**привет**");
  });
});
