import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Темы",
};

export default function TopicsPage() {
  return (
    <RoutePlaceholder
      actions={[{ href: "/topics/sample-module", label: "Открыть пример модуля" }]}
      description="Здесь появятся учебные модули, сгруппированные по уровню и навыку."
      eyebrow="Учебный каталог"
      title="Темы"
    />
  );
}
