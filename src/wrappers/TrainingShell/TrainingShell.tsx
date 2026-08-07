import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./TrainingShell.module.css";

export type TrainingShellProps = ComponentPropsWithoutRef<"div"> & {
  actions?: ReactNode;
  aside?: ReactNode;
};

export function TrainingShell({
  actions,
  aside,
  children,
  className,
  ...props
}: TrainingShellProps) {
  return (
    <div className={classNames(styles.shell, className)} {...props}>
      <div className={styles.content}>{children}</div>
      {aside ? <aside className={styles.aside}>{aside}</aside> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
