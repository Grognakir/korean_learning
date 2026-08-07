import type { ComponentPropsWithRef } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./Button.module.css";

export type ButtonVariant = "ghost" | "primary" | "secondary";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
};

export function Button({ className, type = "button", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={classNames(styles.button, styles[variant], className)}
      type={type}
      {...props}
    />
  );
}
