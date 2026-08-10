import { describe, expect, it } from "vitest";

import {
  applyHeadingPrefix,
  applyListPrefix,
  wrapInlineMark,
  type TextFieldState,
} from "./markdownEditing";

function state(value: string, selectionStart: number, selectionEnd = selectionStart): TextFieldState {
  return { value, selectionStart, selectionEnd };
}

describe("wrapInlineMark", () => {
  it("wraps the current selection with markers and selects the wrapped fragment", () => {
    expect(wrapInlineMark(state("привет мир", 0, 6), "**", "жирный текст")).toEqual({
      value: "**привет** мир",
      selectionStart: 0,
      selectionEnd: 10,
    });
  });

  it("inserts a placeholder when there is no selection", () => {
    expect(wrapInlineMark(state("ab", 1), "_", "курсив")).toEqual({
      value: "a_курсив_b",
      selectionStart: 2,
      selectionEnd: 8,
    });
  });

  it("wraps a multiline selection", () => {
    expect(wrapInlineMark(state("one\ntwo", 0, 7), "**", "жирный текст")).toEqual({
      value: "**one\ntwo**",
      selectionStart: 0,
      selectionEnd: 11,
    });
  });
});

describe("applyListPrefix", () => {
  it("prefixes the selected lines as an unordered list", () => {
    expect(applyListPrefix(state("alpha\nbeta", 0, 11), "unordered")).toEqual({
      value: "- alpha\n- beta",
      selectionStart: 0,
      selectionEnd: 14,
    });
  });

  it("prefixes only the cursor line when there is no selection", () => {
    expect(applyListPrefix(state("alpha\nbeta", 8), "unordered")).toEqual({
      value: "alpha\n- beta",
      selectionStart: 6,
      selectionEnd: 12,
    });
  });

  it("numbers three selected lines as an ordered list", () => {
    expect(applyListPrefix(state("первый\nвторой\nтретий", 0, 20), "ordered")).toEqual({
      value: "1. первый\n2. второй\n3. третий",
      selectionStart: 0,
      selectionEnd: 29,
    });
  });
});

describe("applyHeadingPrefix", () => {
  it("adds a heading prefix to the selected line", () => {
    expect(applyHeadingPrefix(state("заголовок\nтекст", 0, 9))).toEqual({
      value: "## заголовок\nтекст",
      selectionStart: 3,
      selectionEnd: 12,
    });
  });

  it("adds a heading prefix at the cursor line when there is no selection", () => {
    expect(applyHeadingPrefix(state("первая\nвторая", 9))).toEqual({
      value: "первая\n## вторая",
      selectionStart: 12,
      selectionEnd: 12,
    });
  });

  it("does not duplicate an existing heading marker", () => {
    const current = state("## уже заголовок", 4);
    expect(applyHeadingPrefix(current)).toEqual(current);
  });
});
