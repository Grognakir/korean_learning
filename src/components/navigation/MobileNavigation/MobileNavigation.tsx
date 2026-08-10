"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAVIGATION_ITEMS } from "@/constants";

import { isNavigationItemActive } from "../navigationState";
import styles from "./MobileNavigation.module.css";

function MobileNavigationIcon({ href }: { href: string }) {
  if (href === "/") {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <path d="M4 10.5 12 4l8 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
        <path d="M9.5 20v-6h5v6" />
      </svg>
    );
  }

  if (href === "/topics") {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <path d="M4 5.5h5.25A2.75 2.75 0 0 1 12 8.25V20a3.5 3.5 0 0 0-3.5-3.5H4z" />
        <path d="M20 5.5h-5.25A2.75 2.75 0 0 0 12 8.25V20a3.5 3.5 0 0 1 3.5-3.5H20z" />
      </svg>
    );
  }

  if (href === "/training") {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.5" />
        <path className={styles.iconFill} d="m10.5 8.5 5 3.5-5 3.5z" />
      </svg>
    );
  }

  if (href === "/review") {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <path d="M19 7v5h-5" />
        <path d="M18.2 16.5a8 8 0 1 1 .8-8.9L14 12" />
      </svg>
    );
  }

  if (href === "/dictionary") {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 1 5 17z" />
        <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H19M9 8h6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
      <path d="M5 20V11h3v9zM10.5 20V7h3v13zM16 20V4h3v16z" />
    </svg>
  );
}

export function MobileNavigation() {
  const pathname = usePathname() ?? "/";
  const mobileItems = NAVIGATION_ITEMS.filter((item) => item.mobile);

  return (
    <nav aria-label="Мобильная навигация" className={styles.navigation}>
      <ul className={styles.list}>
        {mobileItems.map((item) => {
          const active = isNavigationItemActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={styles.link}
                href={item.href}
              >
                <MobileNavigationIcon href={item.href} />
                <span>{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
