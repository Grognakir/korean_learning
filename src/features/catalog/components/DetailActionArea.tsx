import Link from "next/link";

import styles from "./DetailActionArea.module.css";

export type DetailAction = {
  readonly href: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly disabledReason?: string;
};

export function createDetailAction(input: {
  readonly href: string;
  readonly label: string;
  readonly available: boolean;
  readonly unavailableReason: string;
}): DetailAction {
  if (input.available) {
    return { href: input.href, label: input.label };
  }
  return {
    href: input.href,
    label: input.label,
    disabled: true,
    disabledReason: input.unavailableReason,
  };
}

type DetailActionAreaProps = {
  readonly actions: readonly DetailAction[];
};

export function DetailActionArea({ actions }: DetailActionAreaProps) {
  return (
    <div className={styles.area}>
      {actions.map((action) => (
        <div key={action.label} className={styles.slot}>
          {action.disabled ? (
            <>
              <span aria-disabled="true" className={styles.disabledAction}>
                {action.label}
              </span>
              {action.disabledReason ? (
                <p className={styles.reason}>{action.disabledReason}</p>
              ) : null}
            </>
          ) : (
            <Link className={styles.action} href={action.href} prefetch>
              {action.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
