import Link from "next/link";

import { UserMenu } from "@/features/authentication/components/UserMenu";
import type { AuthUser } from "@/features/authentication/domain/types";
import { PrimaryNavigation } from "@/components/navigation";
import { APP_NAME } from "@/constants";

import styles from "./Header.module.css";

export type HeaderProps = {
  user?: AuthUser | null;
};

export function Header({ user = null }: HeaderProps) {
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
        <UserMenu user={user} />
      </div>
    </header>
  );
}
