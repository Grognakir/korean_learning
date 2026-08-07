import type { ComponentPropsWithoutRef, CSSProperties } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./ProgressBar.module.css";

export type ProgressBarProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  label: string;
  max?: number;
  showValue?: boolean;
  value: number;
};

export function ProgressBar({
  className,
  label,
  max = 100,
  showValue = false,
  value,
  ...props
}: ProgressBarProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), safeMax);
  const percentage = (safeValue / safeMax) * 100;
  const progressStyle = { "--progress-value": `${percentage}%` } as CSSProperties;

  return (
    <div
      aria-label={label}
      aria-valuemax={safeMax}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={classNames(styles.progress, className)}
      role="progressbar"
      {...props}
    >
      <span aria-hidden="true" className={styles.track}>
        <span className={styles.value} style={progressStyle} />
      </span>
      {showValue ? (
        <span aria-hidden="true" className={styles.percentage}>
          {Math.round(percentage)}%
        </span>
      ) : null}
    </div>
  );
}
