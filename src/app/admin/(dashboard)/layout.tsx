import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { hasAdminSession } from "@/features/admin/server/requireAdminSession";
import { PageContainer } from "@/wrappers/PageContainer";

import styles from "./layout.module.css";

/** Cookie-gated admin area is allowed to block; not part of the public instant shell. */
export const instant = false;

type AdminDashboardLayoutProps = {
  readonly children: ReactNode;
};

async function AdminDashboardShell({ children }: AdminDashboardLayoutProps) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <PageContainer className={styles.content}>
      {children}
    </PageContainer>
  );
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return (
    <Suspense fallback={<p className={styles.loading}>Загрузка админки…</p>}>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </Suspense>
  );
}
