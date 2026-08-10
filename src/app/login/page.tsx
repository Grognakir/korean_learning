import type { Metadata } from "next";
import { Suspense } from "react";

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

async function LoginFormPanel({
  searchParams,
}: {
  readonly searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <section aria-label="Форма входа" className={styles.panel}>
      <LoginForm callbackError={params.error ?? null} nextPath={params.next ?? null} />
    </section>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <PageContainer className={styles.page} width="narrow">
      <PageHeader
        description="Войдите по email, чтобы сохранять прогресс в аккаунте. Тренироваться можно и без входа."
        title="Вход"
      />
      <Suspense
        fallback={
          <section aria-busy="true" aria-label="Форма входа" className={styles.panel}>
            <LoginForm callbackError={null} nextPath={null} />
          </section>
        }
      >
        <LoginFormPanel searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
