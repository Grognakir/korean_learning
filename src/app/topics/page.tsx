import type { Metadata } from "next";

import { PageHeader } from "@/components/layout";
import { ModuleCard } from "@/features/training";
import { learningModuleRegistry } from "@/modules";
import { PageContainer } from "@/wrappers";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Темы",
};

export default function TopicsPage() {
  const modules = learningModuleRegistry.getPublished();

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Выберите модуль и двигайтесь по коротким темам в своём темпе."
        eyebrow="Учебный каталог"
        title="Темы"
      />
      <section aria-label="Доступные учебные модули" className={styles.grid}>
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </section>
    </PageContainer>
  );
}
