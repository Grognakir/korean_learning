export type TextFieldState = {
  readonly value: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
};

export function wrapInlineMark(
  state: TextFieldState,
  marker: string,
  placeholder: string,
): TextFieldState {
  const { value, selectionStart, selectionEnd } = state;

  if (selectionStart !== selectionEnd) {
    const selected = value.slice(selectionStart, selectionEnd);
    const wrapped = `${marker}${selected}${marker}`;
    return {
      value: `${value.slice(0, selectionStart)}${wrapped}${value.slice(selectionEnd)}`,
      selectionStart,
      selectionEnd: selectionStart + wrapped.length,
    };
  }

  const inserted = `${marker}${placeholder}${marker}`;
  const placeholderStart = selectionStart + marker.length;
  return {
    value: `${value.slice(0, selectionStart)}${inserted}${value.slice(selectionEnd)}`,
    selectionStart: placeholderStart,
    selectionEnd: placeholderStart + placeholder.length,
  };
}

function lineBounds(value: string, selectionStart: number, selectionEnd: number) {
  const start = value.lastIndexOf("\n", Math.max(0, selectionStart) - 1) + 1;
  const endNewline = value.indexOf("\n", selectionEnd);
  const end = endNewline === -1 ? value.length : endNewline;
  return { start, end };
}

export function applyListPrefix(
  state: TextFieldState,
  type: "ordered" | "unordered",
): TextFieldState {
  const { value, selectionStart, selectionEnd } = state;
  const { start, end } = lineBounds(value, selectionStart, selectionEnd);
  const block = value.slice(start, end);
  const lines = block.split("\n");

  let orderedIndex = 0;
  const nextLines = lines.map((line) => {
    if (line.length === 0) {
      return line;
    }
    if (type === "unordered") {
      return `- ${line}`;
    }
    orderedIndex += 1;
    return `${orderedIndex}. ${line}`;
  });

  const nextBlock = nextLines.join("\n");
  return {
    value: `${value.slice(0, start)}${nextBlock}${value.slice(end)}`,
    selectionStart: start,
    selectionEnd: start + nextBlock.length,
  };
}

export function applyHeadingPrefix(state: TextFieldState): TextFieldState {
  const { value, selectionStart, selectionEnd } = state;
  const lineStart = value.lastIndexOf("\n", Math.max(0, selectionStart) - 1) + 1;
  const lineEndNewline = value.indexOf("\n", lineStart);
  const lineEnd = lineEndNewline === -1 ? value.length : lineEndNewline;
  const line = value.slice(lineStart, lineEnd);

  if (line.startsWith("#")) {
    return state;
  }

  const prefix = "## ";
  return {
    value: `${value.slice(0, lineStart)}${prefix}${value.slice(lineStart)}`,
    selectionStart: selectionStart + prefix.length,
    selectionEnd: selectionEnd + prefix.length,
  };
}
