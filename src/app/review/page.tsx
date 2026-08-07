import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Повторение",
};

export default function ReviewPage() {
  return (
    <RoutePlaceholder
      actions={[{ href: "/training", label: "Начать новую тренировку" }]}
      description="Очередь повторения соберёт ошибки и слова, которые пора закрепить."
      eyebrow="Закрепление"
      title="Повторение"
    />
  );
}
