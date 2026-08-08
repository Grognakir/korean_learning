import type { Metadata } from "next";

import { GuestFeatureEmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Словарь",
  description: "Ищите изученные слова, значения и связанные примеры употребления.",
};

export default function DictionaryPage() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Ищите изученные слова, значения и связанные примеры употребления."
        eyebrow="Справочник"
        title="Словарь"
      />
      <GuestFeatureEmptyState
        description="Словарь станет доступен после накопления изученных слов. Сейчас можно тренироваться локально и открывать темы."
        title="Словарь пока недоступен"
      />
    </PageContainer>
  );
}
