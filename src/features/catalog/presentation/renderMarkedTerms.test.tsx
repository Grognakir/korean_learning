import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderMarkedTerms } from "./renderMarkedTerms";

describe("renderMarkedTerms", () => {
  it("keeps plain text unchanged", () => {
    expect(renderMarkedTerms("без выделений")).toBe("без выделений");
  });

  it("renders backtick terms as bold Korean marks without the ticks", () => {
    render(<p>{renderMarkedTerms("`이` после 받침, `가` после гласной.")}</p>);

    expect(screen.queryByText(/`/)).not.toBeInTheDocument();
    expect(screen.getByText("이")).toHaveAttribute("lang", "ko");
    expect(screen.getByText("가")).toHaveAttribute("lang", "ko");
    expect(screen.getByText("이").tagName).toBe("STRONG");
  });

  it("renders markdown bold markers without the asterisks", () => {
    render(<p>{renderMarkedTerms("до **заменяет** 이/가")}</p>);

    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
    expect(screen.getByText("заменяет").tagName).toBe("STRONG");
  });

  it("renders underscore italic as em without the markers", () => {
    render(<p>{renderMarkedTerms("это _курсив_ здесь")}</p>);

    expect(screen.queryByText(/_/)).not.toBeInTheDocument();
    expect(screen.getByText("курсив").tagName).toBe("EM");
  });

  it("keeps bold and italic text fragments without broken markup", () => {
    render(<p>{renderMarkedTerms("**жирный _и курсив_ текст**")}</p>);

    expect(screen.getByText(/жирный/)).toBeInTheDocument();
    expect(screen.getByText(/курсив/)).toBeInTheDocument();
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
  });

  it("does not treat an unpaired underscore as italic", () => {
    render(<p>{renderMarkedTerms("text_noclose")}</p>);

    expect(screen.getByText("text_noclose")).toBeInTheDocument();
    expect(document.querySelector("em")).toBeNull();
  });
});
