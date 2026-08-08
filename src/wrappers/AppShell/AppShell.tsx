import type { ReactNode } from "react";

import { Header } from "@/components/layout";
import { MobileNavigation } from "@/components/navigation";
import type { AuthUser } from "@/features/authentication/domain/types";

import styles from "./AppShell.module.css";

export type AppShellProps = {
  children: ReactNode;
  user?: AuthUser | null;
};

export function AppShell({ children, user = null }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Header user={user} />
      <main className={styles.main} id="main-content" tabIndex={-1}>
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}
