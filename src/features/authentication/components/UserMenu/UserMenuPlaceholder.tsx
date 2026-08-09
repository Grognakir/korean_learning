import styles from "./UserMenu.module.css";

export function UserMenuPlaceholder() {
  return (
    <div aria-hidden="true" className={styles.menu}>
      <span className={styles.loginLink}>Войти</span>
    </div>
  );
}
