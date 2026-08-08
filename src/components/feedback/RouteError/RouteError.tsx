"use client";

import Link from "next/link";

import { Button } from "@/components/ui";
import { classNames } from "@/lib/utilities";

import styles from "./RouteError.module.css";

export type RouteErrorProps = {
  readonly title?: string;
  readonly description?: string;
  readonly onRetry: () => void;
  readonly homeHref?: string;
  readonly className?: string;
};

export function RouteError({
  className,
  description = "Не удалось показать эту страницу. Можно попробовать ещё раз или вернуться на главную.",
  homeHref = "/",
  onRetry,
  title = "Что-то пошло не так",
}: RouteErrorProps) {
  return (
    <section
      aria-labelledby="route-error-title"
      className={classNames(styles.error, className)}
      role="alert"
    >
      <div className={styles.copy}>
        <h2 className={styles.title} id="route-error-title">
          {title}
        </h2>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.actions}>
        <Button onClick={onRetry} type="button">
          Попробовать снова
        </Button>
        <Link className={styles.secondaryAction} href={homeHref}>
          На главную
        </Link>
      </div>
    </section>
  );
}
