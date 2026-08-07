import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Тренировка",
};

export default function TrainingPage() {
  return (
    <RoutePlaceholder
      actions={[{ href: "/training/demo-session", label: "Открыть пример сессии" }]}
      description="Настройте режим, объём и сложность перед началом учебной сессии."
      eyebrow="Активная практика"
      title="Тренировка"
    />
  );
}
