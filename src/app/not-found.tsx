import Link from "next/link";

import { PageHeader } from "@/components/layout";
import { PageContainer } from "@/wrappers";

import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Такой страницы нет или материал ещё не опубликован."
        title="Страница не найдена"
      />
      <section aria-label="Что можно сделать дальше" className={styles.panel}>
        <p className={styles.copy}>
          Проверьте адрес или перейдите к доступным разделам приложения.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/">
            На главную
          </Link>
          <Link className={styles.secondaryAction} href="/topics">
            К каталогу
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
