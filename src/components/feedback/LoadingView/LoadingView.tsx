import { Spinner } from "@/components/ui";
import { classNames } from "@/lib/utilities";

import styles from "./LoadingView.module.css";

export type LoadingViewProps = {
  readonly label?: string;
  readonly className?: string;
};

export function LoadingView({ className, label = "Загрузка…" }: LoadingViewProps) {
  return (
    <div aria-busy="true" className={classNames(styles.view, className)}>
      <Spinner label={label} size="large" />
      <p className={styles.label}>{label}</p>
      <div aria-hidden="true" className={styles.skeleton}>
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.barShort} />
      </div>
    </div>
  );
}
