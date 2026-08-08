import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "../EmptyState";

import styles from "./FeatureEmptyStates.module.css";

function ActionLink({
  href,
  children,
  variant = "primary",
}: {
  readonly href: string;
  readonly children: ReactNode;
  readonly variant?: "primary" | "secondary";
}) {
  return (
    <Link
      className={variant === "primary" ? styles.primaryAction : styles.secondaryAction}
      href={href}
    >
      {children}
    </Link>
  );
}

export function CatalogEmptyState() {
  return (
    <EmptyState
      action={<ActionLink href="/">На главную</ActionLink>}
      description="Опубликованных модулей пока нет. Загляните позже или вернитесь на главную."
      title="Каталог пуст"
    />
  );
}

export function TopicsEmptyState() {
  return (
    <EmptyState
      action={<ActionLink href="/topics">К каталогу</ActionLink>}
      description="В этом модуле ещё нет опубликованных тем. Выберите другой модуль."
      title="Темы не найдены"
    />
  );
}

export function ExercisesEmptyState() {
  return (
    <EmptyState
      action={<ActionLink href="/training">К тренировке</ActionLink>}
      description="Для этой сессии нет доступных заданий. Вернитесь к списку тренировок."
      title="Заданий нет"
    />
  );
}

export function GuestFeatureEmptyState({
  description,
  title,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <EmptyState
      action={
        <>
          <ActionLink href="/training">Начать тренировку</ActionLink>
          <ActionLink href="/topics" variant="secondary">
            Открыть темы
          </ActionLink>
        </>
      }
      description={description}
      title={title}
    />
  );
}

export function ServiceUnavailableState() {
  return (
    <EmptyState
      action={<ActionLink href="/">На главную</ActionLink>}
      description="Сервис временно недоступен. Проверьте соединение и попробуйте позже — данные аккаунта появятся здесь после подключения облака."
      title="Сервис недоступен"
    />
  );
}
