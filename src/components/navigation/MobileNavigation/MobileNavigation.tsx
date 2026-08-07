"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAVIGATION_ITEMS } from "@/constants";

import { isNavigationItemActive } from "../navigationState";
import styles from "./MobileNavigation.module.css";

export function MobileNavigation() {
  const pathname = usePathname() ?? "/";
  const mobileItems = NAVIGATION_ITEMS.filter((item) => item.mobile);

  return (
    <nav aria-label="Мобильная навигация" className={styles.navigation}>
      <ul className={styles.list}>
        {mobileItems.map((item, index) => {
          const active = isNavigationItemActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={styles.link}
                href={item.href}
              >
                <span aria-hidden="true" className={styles.marker}>
                  {index + 1}
                </span>
                <span>{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
