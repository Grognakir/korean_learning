import type { Metadata } from "next";

import { PageHeader } from "@/components/layout";
import { AdminLoginForm } from "@/features/admin/components/AdminLoginForm";
import { parseAdminEnv } from "@/features/admin/server/adminEnv";
import { PageContainer } from "@/wrappers/PageContainer";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Вход в админ-панель",
  description: "Отдельный вход для панели управления контентом.",
};

function getDevLoginDefaults():
  | { defaultUsername: string; defaultPassword: string }
  | undefined {
  if (process.env.NODE_ENV !== "development") {
    return undefined;
  }

  try {
    const env = parseAdminEnv();
    return {
      defaultUsername: env.username,
      defaultPassword: env.password,
    };
  } catch {
    return undefined;
  }
}

export default function AdminLoginPage() {
  const defaults = getDevLoginDefaults();

  return (
    <PageContainer className={styles.page} width="narrow">
      <PageHeader
        description="Вход только для администратора контента. Не связан с обычным аккаунтом ученика."
        title="Вход в админ-панель"
      />
      <section aria-label="Форма входа в админ-панель" className={styles.panel}>
        {defaults ? (
          <AdminLoginForm
            defaultPassword={defaults.defaultPassword}
            defaultUsername={defaults.defaultUsername}
          />
        ) : (
          <AdminLoginForm />
        )}
      </section>
    </PageContainer>
  );
}
