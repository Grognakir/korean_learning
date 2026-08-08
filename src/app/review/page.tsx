import type { Metadata } from "next";

import { GuestFeatureEmptyState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Повторение",
  description: "Очередь повторения ошибок появится после облачной синхронизации.",
};

export default function ReviewPage() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Очередь повторения ошибок появится после облачной синхронизации."
        eyebrow="Закрепление"
        title="Повторение"
      />
      <GuestFeatureEmptyState
        description="Сейчас можно тренироваться локально. Персональная очередь повторения станет доступна после подключения аккаунта."
        title="Повторение пока недоступно"
      />
    </PageContainer>
  );
}
