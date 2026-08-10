import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./PageHeader.module.css";

export type PageHeaderProps = Omit<ComponentPropsWithoutRef<"header">, "title"> & {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  belowTitle?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
};

export function PageHeader({
  actions,
  backHref,
  backLabel = "Назад",
  belowTitle,
  className,
  description,
  eyebrow,
  title,
  ...props
}: PageHeaderProps) {
  const showEyebrowRow = Boolean(backHref || eyebrow);

  return (
    <header className={classNames(styles.header, className)} {...props}>
      <div className={styles.copy}>
        {showEyebrowRow ? (
          backHref ? (
            <Link
              aria-label={backLabel}
              className={classNames(styles.eyebrow, styles.back)}
              href={backHref}
              prefetch
            >
              <span aria-hidden="true" className={styles.backArrow}>
                ←
              </span>
              {eyebrow ? <span className={styles.eyebrowText}>{eyebrow}</span> : null}
            </Link>
          ) : (
            <p className={styles.eyebrow}>
              {eyebrow ? <span className={styles.eyebrowText}>{eyebrow}</span> : null}
            </p>
          )
        ) : null}
        <h1>{title}</h1>
        {belowTitle ? <div className={styles.belowTitle}>{belowTitle}</div> : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
