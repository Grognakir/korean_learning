import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useId } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./ContentSection.module.css";

export type ContentSectionProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
};

export function ContentSection({
  children,
  className,
  description,
  eyebrow,
  title,
  ...props
}: ContentSectionProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={classNames(styles.section, className)} {...props}>
      <header className={styles.header}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h2 id={titleId}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </header>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
