import Link from "next/link";

import ui from "@/features/admin/components/adminUi.module.css";

export type AdminBackLinkProps = {
  readonly href: string;
  readonly label?: string;
};

export function AdminBackLink({ href, label = "К списку" }: AdminBackLinkProps) {
  return (
    <Link aria-label={label} className={ui.backLink} href={href}>
      <svg aria-hidden="true" className={ui.backLinkIcon} viewBox="0 0 24 24">
        <path d="M15 6 9 12l6 6" />
      </svg>
    </Link>
  );
}
