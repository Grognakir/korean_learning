"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAVIGATION_ITEMS } from "@/constants";

import { isNavigationItemActive } from "../navigationState";
import styles from "./PrimaryNavigation.module.css";

export function PrimaryNavigation() {
  const pathname = usePathname() ?? "/";

  return (
    <nav aria-label="Основная навигация" className={styles.navigation}>
      <ul className={styles.list}>
        {NAVIGATION_ITEMS.map((item) => {
          const active = isNavigationItemActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={styles.link}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
