"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminLogoutButton } from "@/features/admin/components/AdminLogoutButton/AdminLogoutButton";

import styles from "./HeaderUserSlot.module.css";

export type HeaderUserSlotProps = {
  readonly children: ReactNode;
};

function isAdminDashboardPath(pathname: string): boolean {
  return pathname === "/admin" || (pathname.startsWith("/admin/") && pathname !== "/admin/login");
}

function AdminPanelShortcut() {
  return (
    <Link aria-label="Админ-панель" className={styles.adminLink} href="/admin">
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <path d="M4 4.5h7v7H4zM13 4.5h7v7h-7zM4 13.5h7v7H4zM13 13.5h7v7h-7z" />
      </svg>
    </Link>
  );
}

/** Replaces learner auth control with admin logout on admin dashboard routes. */
export function HeaderUserSlot({ children }: HeaderUserSlotProps) {
  const pathname = usePathname() ?? "/";

  if (isAdminDashboardPath(pathname)) {
    return <AdminLogoutButton />;
  }

  if (pathname === "/admin/login") {
    return null;
  }

  const showAdminShortcut = process.env.NODE_ENV === "development";

  if (!showAdminShortcut) {
    return children;
  }

  return (
    <div className={styles.slot}>
      <AdminPanelShortcut />
      {children}
    </div>
  );
}
