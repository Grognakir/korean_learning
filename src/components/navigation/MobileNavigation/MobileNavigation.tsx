"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAVIGATION_ITEMS } from "@/constants";
import { classNames } from "@/lib/utilities";

import { isNavigationItemActive } from "../navigationState";
import styles from "./MobileNavigation.module.css";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Дашборд", shortLabel: "Дашборд" },
  { href: "/admin/units", label: "Юниты", shortLabel: "Юниты" },
  { href: "/admin/grammar", label: "Грамматика", shortLabel: "Грамматика" },
  { href: "/admin/dictionary", label: "Словарь", shortLabel: "Словарь" },
] as const;

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

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

  if (href === "/admin") {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <path d="M4 19.5h16" />
        <path d="M7 19.5V12" />
        <path d="M12 19.5V7" />
        <path d="M17 19.5v-5" />
      </svg>
    );
  }

  if (href === "/admin/units") {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <path d="m12 4.5 8 3.5-8 3.5-8-3.5z" />
        <path d="m4 12 8 3.5 8-3.5" />
        <path d="m4 16.5 8 3.5 8-3.5" />
      </svg>
    );
  }

  if (href === "/admin/grammar") {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <circle cx="7" cy="6.5" r="2" />
        <circle cx="17" cy="12" r="2" />
        <circle cx="7" cy="17.5" r="2" />
        <path d="M9 7.5v8.5" />
        <path d="M9 12h6" />
      </svg>
    );
  }

  if (href === "/admin/dictionary") {
    return (
      <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
        <path d="M8 4.5h9.5A1.5 1.5 0 0 1 19 6v14l-4.5-2.25L10 20V6A1.5 1.5 0 0 0 8.5 4.5" />
        <path d="M8 4.5H6.5A1.5 1.5 0 0 0 5 6v12.5" />
        <path d="M12 8.5h4M12 12h4" />
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

  if (pathname === "/admin/login") {
    return null;
  }

  if (isAdminPath(pathname)) {
    return (
      <nav
        aria-label="Разделы админки"
        className={classNames(styles.navigation, styles.adminNavigation)}
      >
        <ul className={classNames(styles.list, styles.adminList)}>
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isAdminNavItemActive(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
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

  const mobileItems = NAVIGATION_ITEMS.filter((item) => item.mobile);

  return (
    <nav aria-label="Мобильная навигация" className={styles.navigation}>
      <ul className={styles.list}>
        {mobileItems.map((item) => {
          const active = isNavigationItemActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
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
