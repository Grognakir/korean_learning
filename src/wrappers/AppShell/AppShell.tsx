import type { ReactNode } from "react";

import { Header } from "@/components/layout";
import { MobileNavigation } from "@/components/navigation";

import styles from "./AppShell.module.css";

export type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main} id="main-content" tabIndex={-1}>
        {children}
      </main>
      <MobileNavigation />
      <footer className={styles.footer}>
        <span lang="ko">천천히, 꾸준히</span>
        <span>Небольшие шаги каждый день.</span>
      </footer>
    </div>
  );
}
