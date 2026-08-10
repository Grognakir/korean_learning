"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Header } from "@/components/layout";
import { MobileNavigation } from "@/components/navigation";
import { classNames } from "@/lib/utilities";

import styles from "./AppShell.module.css";

export type AppShellProps = {
  children: ReactNode;
  userMenu: ReactNode;
};

function isAdminDashboardPath(pathname: string): boolean {
  return pathname === "/admin" || (pathname.startsWith("/admin/") && pathname !== "/admin/login");
}

export function AppShell({ children, userMenu }: AppShellProps) {
  const pathname = usePathname() ?? "/";
  const isAdminDashboard = isAdminDashboardPath(pathname);

  return (
    <div className={classNames(styles.shell, isAdminDashboard ? styles.adminShell : undefined)}>
      <Header userMenu={userMenu} />
      <main className={styles.main} id="main-content" tabIndex={-1}>
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}
