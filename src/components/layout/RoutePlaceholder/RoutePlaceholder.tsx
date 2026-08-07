import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui";
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
      <section aria-label="Содержимое раздела" className={styles.panel}>
        <div aria-hidden="true" className={styles.wordCard}>
          <span lang="ko">준비</span>
          <strong>junbi</strong>
          <p>подготовка</p>
        </div>

        <div className={styles.panelContent}>
          <Badge tone="accent">Следующий шаг</Badge>
          <div className={styles.content}>
            {children ?? (
              <p>Содержимое этого раздела появится здесь. Пока можно перейти к следующему шагу.</p>
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
        </div>
      </section>
    </PageContainer>
  );
}
