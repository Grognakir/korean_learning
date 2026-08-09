import styles from "./UserMenu.module.css";

export function UserMenuPlaceholder() {
  return (
    <span aria-hidden="true" className={styles.loginLink}>
      Войти
    </span>
  );
}
