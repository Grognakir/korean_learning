import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useId } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./EmptyState.module.css";

export type EmptyStateProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  action?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
};

export function EmptyState({ action, className, description, title, ...props }: EmptyStateProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={classNames(styles.emptyState, className)}
      {...props}
    >
      <div aria-hidden="true" className={styles.icon}>
        가
      </div>
      <div className={styles.copy}>
        <h3 className={styles.title} id={titleId}>
          {title}
        </h3>
        {description ? (
          <p className={styles.description} id={descriptionId}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}
