import type { ComponentPropsWithoutRef } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./Spinner.module.css";

export type SpinnerSize = "small" | "medium" | "large";

export type SpinnerProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  label: string;
  size?: SpinnerSize;
};

export function Spinner({ className, label, size = "medium", ...props }: SpinnerProps) {
  return (
    <span
      aria-label={label}
      aria-live="polite"
      className={classNames(styles.spinner, styles[size], className)}
      role="status"
      {...props}
    />
  );
}
