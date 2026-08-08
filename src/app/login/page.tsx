import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout";
import { LoginForm } from "@/features/authentication/components/LoginForm";
import { PageContainer } from "@/wrappers/PageContainer";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Вход",
  description: "Вход по одноразовой ссылке на email.",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        description="Войдите по email, чтобы сохранять прогресс в облаке. Локальная тренировка остаётся доступной и без входа."
        title="Вход"
      />
      <section aria-label="Форма входа" className={styles.panel}>
        <LoginForm callbackError={params.error ?? null} nextPath={params.next ?? null} />
        <div className={styles.guestAction}>
          <Link href="/">Продолжить как гость</Link>
        </div>
      </section>
    </PageContainer>
  );
}
