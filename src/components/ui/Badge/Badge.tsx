import type { ComponentPropsWithRef } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./Badge.module.css";

export type BadgeTone = "accent" | "danger" | "neutral" | "success" | "warning";

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return <span className={classNames(styles.badge, styles[tone], className)} {...props} />;
}
