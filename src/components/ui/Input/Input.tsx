"use client";

import { useId, type ComponentPropsWithRef } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./Input.module.css";

export type InputProps = Omit<ComponentPropsWithRef<"input">, "children"> & {
  errorMessage?: string;
  hint?: string;
  label: string;
};

export function Input({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  className,
  errorMessage,
  hint,
  id,
  label,
  ref,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [
    ariaDescribedBy,
    hint ? hintId : undefined,
    errorMessage ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {props.required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        {...props}
        aria-describedby={describedBy || undefined}
        aria-invalid={errorMessage ? true : ariaInvalid}
        className={classNames(styles.control, className)}
        id={inputId}
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
