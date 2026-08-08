import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/layout";
import { exerciseRepository } from "@/modules";

export const metadata: Metadata = {
  title: "Тренировка",
};

export default function TrainingPage() {
  const exerciseCount = exerciseRepository.list({ moduleSlug: "sample-module" }).length;

  return (
    <RoutePlaceholder
      actions={[{ href: "/training/demo-session", label: "Открыть пример сессии" }]}
      description="Настройте режим, объём и сложность перед началом учебной сессии."
      eyebrow="Активная практика"
      title="Тренировка"
    >
      <p>
        В модуле «Первые шаги в корейском» доступно {exerciseCount} заданий для короткой тренировки.
      </p>
    </RoutePlaceholder>
  );
}
