import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Словарь",
  description: "Ищите изученные слова, значения и связанные примеры употребления.",
};

export default function DictionaryPage() {
  return (
    <RoutePlaceholder
      actions={[{ href: "/topics", label: "Вернуться к темам" }]}
      description="Ищите изученные слова, значения и связанные примеры употребления."
      eyebrow="Справочник"
      title="Словарь"
    />
  );
}
