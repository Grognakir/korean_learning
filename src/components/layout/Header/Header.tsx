import Link from "next/link";
import type { ReactNode } from "react";

import { PrimaryNavigation } from "@/components/navigation";
import { APP_NAME } from "@/constants";

import styles from "./Header.module.css";

export type HeaderProps = {
  userMenu: ReactNode;
};

export function Header({ userMenu }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link aria-label={`${APP_NAME} — на главную`} className={styles.brand} href="/">
          <span aria-hidden="true" className={styles.mark} lang="ko">
            <span>한</span>
          </span>
          <span className={styles.brandCopy}>
            <strong>{APP_NAME}</strong>
            <span>Персональная практика</span>
          </span>
        </Link>
        <PrimaryNavigation />
        <div className={styles.userMenu}>{userMenu}</div>
      </div>
    </header>
  );
}
