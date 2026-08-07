import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./Alert.module.css";

export type AlertTone = "danger" | "info" | "success" | "warning";

export type AlertProps = Omit<ComponentPropsWithoutRef<"div">, "title"> & {
  title?: ReactNode;
  tone?: AlertTone;
};

export function Alert({ children, className, title, tone = "info", ...props }: AlertProps) {
  const isUrgent = tone === "danger";

  return (
    <div
      aria-live={isUrgent ? "assertive" : "polite"}
      className={classNames(styles.alert, styles[tone], className)}
      role={isUrgent ? "alert" : "status"}
      {...props}
    >
      {title ? <strong className={styles.title}>{title}</strong> : null}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
