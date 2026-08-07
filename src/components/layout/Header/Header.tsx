import Link from "next/link";

import { APP_NAME } from "@/constants";

import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link aria-label={`${APP_NAME} — на главную`} className={styles.brand} href="/">
          <span aria-hidden="true" className={styles.mark} lang="ko">
            한
          </span>
          <span className={styles.brandCopy}>
            <strong>{APP_NAME}</strong>
            <span>Персональная практика</span>
          </span>
        </Link>
        <div
          aria-label="Основная навигация появится на следующем этапе"
          className={styles.placeholder}
        >
          Учебный режим
        </div>
      </div>
    </header>
  );
}
