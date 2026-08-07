import Link from "next/link";
import type { ReactNode } from "react";

import { Alert } from "@/components/feedback";
import { Badge, Card } from "@/components/ui";
import { PageContainer } from "@/wrappers/PageContainer";

import { PageHeader } from "../PageHeader";
import styles from "./RoutePlaceholder.module.css";

export type RoutePlaceholderAction = {
  href: string;
  label: string;
};

export type RoutePlaceholderProps = {
  actions?: readonly RoutePlaceholderAction[];
  children?: ReactNode;
  description: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
};

export function RoutePlaceholder({
  actions = [],
  children,
  description,
  eyebrow,
  title,
}: RoutePlaceholderProps) {
  return (
    <PageContainer className={styles.page}>
      <PageHeader description={description} eyebrow={eyebrow} title={title} />
      <Card className={styles.card}>
        <Badge tone="accent">Каркас маршрута готов</Badge>
        <div className={styles.content}>
          {children ?? (
            <Alert title="Следующий шаг">
              Содержимое появится в профильной итерации после готовности общей модели обучения.
            </Alert>
          )}
        </div>
        {actions.length > 0 ? (
          <div className={styles.actions}>
            {actions.map((action, index) => (
              <Link
                className={index === 0 ? styles.primaryAction : styles.secondaryAction}
                href={action.href}
                key={action.href}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </Card>
    </PageContainer>
  );
}
