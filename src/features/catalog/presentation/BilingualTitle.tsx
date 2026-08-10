import type { ElementType, ReactNode } from "react";

import { capitalizeRu } from "./formatBilingualLabel";

type BilingualTitleProps = {
  readonly ko: string;
  readonly ru: string;
  readonly as?: ElementType;
  readonly className?: string | undefined;
  readonly id?: string | undefined;
};

export function BilingualTitle({
  ko,
  ru,
  as: Tag = "span",
  className,
  id,
}: BilingualTitleProps): ReactNode {
  const korean = ko.trim();
  const russian = capitalizeRu(ru.trim());

  if (!korean && !russian) {
    return null;
  }

  if (!korean) {
    return (
      <Tag className={className} id={id}>
        {russian}
      </Tag>
    );
  }

  if (!russian) {
    return (
      <Tag className={className} id={id}>
        <span lang="ko">{korean}</span>
      </Tag>
    );
  }

  return (
    <Tag className={className} id={id}>
      <span lang="ko">{korean}</span> (<span>{russian}</span>)
    </Tag>
  );
}
