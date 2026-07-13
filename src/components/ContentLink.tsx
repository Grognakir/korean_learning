import Link from "next/link";
import type { ComponentProps } from "react";

type AppLinkProps = ComponentProps<typeof Link>;

/** List pages have many heavy routes — skip prefetch to keep navigation snappy. */
export function ContentLink({ prefetch = false, ...props }: AppLinkProps) {
  return <Link prefetch={prefetch} {...props} />;
}
