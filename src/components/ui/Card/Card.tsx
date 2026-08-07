import type { ComponentPropsWithRef } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./Card.module.css";

export type CardProps = ComponentPropsWithRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return <div className={classNames(styles.card, className)} {...props} />;
}
