import { adminLogoutAction } from "@/features/admin/actions/adminLogoutAction";

import styles from "./AdminLogoutButton.module.css";

export function AdminLogoutButton() {
  return (
    <form action={adminLogoutAction} className={styles.form}>
      <button className={styles.button} type="submit">
        Выйти
      </button>
    </form>
  );
}
