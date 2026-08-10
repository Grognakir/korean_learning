"use client";

import { useRef } from "react";

import { Textarea } from "@/components/ui/Textarea";
import { MarkdownToolbar } from "@/features/admin/components/MarkdownToolbar/MarkdownToolbar";
import { GrammarMarkdownBody } from "@/features/catalog/presentation/GrammarMarkdownBody";

import styles from "./MarkdownEditor.module.css";

export type MarkdownEditorProps = {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly hint?: string;
  readonly errorMessage?: string;
  readonly required?: boolean;
};

export function MarkdownEditor({
  label,
  name,
  value,
  onChange,
  hint,
  errorMessage,
  required,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div className={styles.root}>
      <MarkdownToolbar onChange={onChange} textareaRef={textareaRef} value={value} />
      <Textarea
        label={label}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        ref={textareaRef}
        rows={12}
        value={value}
        {...(hint !== undefined ? { hint } : {})}
        {...(errorMessage !== undefined ? { errorMessage } : {})}
        {...(required !== undefined ? { required } : {})}
      />
      <div className={styles.previewLabel}>Превью</div>
      <div className={styles.preview}>
        <GrammarMarkdownBody markdown={value || "_Пусто_"} />
      </div>
    </div>
  );
}
