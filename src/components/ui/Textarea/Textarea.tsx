"use client";

import { useId, type ComponentPropsWithRef } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./Textarea.module.css";

export type TextareaProps = ComponentPropsWithRef<"textarea"> & {
  errorMessage?: string;
  hint?: string;
  label: string;
};

export function Textarea({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  className,
  errorMessage,
  hint,
  id,
  label,
  ref,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;
  const describedBy = [
    ariaDescribedBy,
    hint ? hintId : undefined,
    errorMessage ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={textareaId}>
        {label}
        {props.required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <textarea
        {...props}
        aria-describedby={describedBy || undefined}
        aria-invalid={errorMessage ? true : ariaInvalid}
        className={classNames(styles.control, className)}
        id={textareaId}
        ref={ref}
      />
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {errorMessage ? (
        <p className={styles.error} id={errorId}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
