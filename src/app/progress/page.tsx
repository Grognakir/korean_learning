import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Прогресс",
};

export default function ProgressPage() {
  return (
    <RoutePlaceholder
      actions={[{ href: "/topics", label: "Выбрать следующую тему" }]}
      description="Статистика покажет регулярность, освоенные темы и точки для повторения."
      eyebrow="Результаты"
      title="Прогресс"
    />
  );
}
