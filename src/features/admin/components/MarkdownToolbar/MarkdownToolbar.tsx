"use client";

import type { RefObject } from "react";

import { Button } from "@/components/ui/Button";

import {
  applyHeadingPrefix,
  applyListPrefix,
  wrapInlineMark,
  type TextFieldState,
} from "@/features/admin/domain/markdownEditing";

import styles from "./MarkdownToolbar.module.css";

export type MarkdownToolbarProps = {
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  readonly value: string;
  readonly onChange: (next: string) => void;
};

function restoreSelection(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  selectionStart: number,
  selectionEnd: number,
) {
  requestAnimationFrame(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    el.focus();
    el.setSelectionRange(selectionStart, selectionEnd);
  });
}

function applyTransform(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: (next: string) => void,
  transform: (state: TextFieldState) => TextFieldState,
) {
  const el = textareaRef.current;
  if (!el) {
    return;
  }

  const result = transform({
    value,
    selectionStart: el.selectionStart,
    selectionEnd: el.selectionEnd,
  });

  onChange(result.value);
  restoreSelection(textareaRef, result.selectionStart, result.selectionEnd);
}

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  return (
    <div aria-label="Форматирование текста" className={styles.toolbar} role="toolbar">
      <Button
        aria-label="Жирный"
        className={styles.button}
        onClick={() =>
          applyTransform(textareaRef, value, onChange, (state) =>
            wrapInlineMark(state, "**", "жирный текст"),
          )
        }
        type="button"
        variant="ghost"
      >
        Ж
      </Button>
      <Button
        aria-label="Курсив"
        className={styles.button}
        onClick={() =>
          applyTransform(textareaRef, value, onChange, (state) =>
            wrapInlineMark(state, "_", "курсив"),
          )
        }
        type="button"
        variant="ghost"
      >
        К
      </Button>
      <Button
        aria-label="Список"
        className={styles.button}
        onClick={() =>
          applyTransform(textareaRef, value, onChange, (state) =>
            applyListPrefix(state, "unordered"),
          )
        }
        type="button"
        variant="ghost"
      >
        •
      </Button>
      <Button
        aria-label="Нумерованный список"
        className={styles.button}
        onClick={() =>
          applyTransform(textareaRef, value, onChange, (state) =>
            applyListPrefix(state, "ordered"),
          )
        }
        type="button"
        variant="ghost"
      >
        1.
      </Button>
      <Button
        aria-label="Заголовок"
        className={styles.button}
        onClick={() => applyTransform(textareaRef, value, onChange, applyHeadingPrefix)}
        type="button"
        variant="ghost"
      >
        #
      </Button>
    </div>
  );
}
