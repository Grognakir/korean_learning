import Link from "next/link";

import ui from "@/features/admin/components/adminUi.module.css";

export type AdminListPagerProps = {
  readonly ariaLabel: string;
  readonly page: number;
  readonly totalPages: number;
  readonly prevHref: string | null;
  readonly nextHref: string | null;
};

export function AdminListPager({
  ariaLabel,
  page,
  totalPages,
  prevHref,
  nextHref,
}: AdminListPagerProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label={ariaLabel} className={ui.pager}>
      {prevHref ? (
        <Link className={ui.pageLink} href={prevHref} prefetch>
          Назад
        </Link>
      ) : (
        <span className={ui.pageDisabled}>Назад</span>
      )}
      <span className={ui.pageStatus}>
        {page} / {totalPages}
      </span>
      {nextHref ? (
        <Link className={ui.pageLink} href={nextHref} prefetch>
          Дальше
        </Link>
      ) : (
        <span className={ui.pageDisabled}>Дальше</span>
      )}
    </nav>
  );
}
