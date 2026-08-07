import type { ComponentPropsWithRef } from "react";

import { classNames } from "@/lib/utilities";

import styles from "./PageContainer.module.css";

export type PageContainerWidth = "default" | "narrow" | "wide";

export type PageContainerProps = ComponentPropsWithRef<"div"> & {
  width?: PageContainerWidth;
};

export function PageContainer({ className, width = "default", ...props }: PageContainerProps) {
  return <div className={classNames(styles.container, styles[width], className)} {...props} />;
}
