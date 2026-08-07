import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./PageHeader.module.css";

export type PageHeaderProps = Omit<ComponentPropsWithoutRef<"header">, "title"> & {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
};

export function PageHeader({
  actions,
  className,
  description,
  eyebrow,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header className={classNames(styles.header, className)} {...props}>
      <div className={styles.copy}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
