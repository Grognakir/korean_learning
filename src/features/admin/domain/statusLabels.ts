export const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  reviewed: "Проверено",
  published: "Опубликовано",
  archived: "Архив",
};

export const STATUS_OPTIONS = [
  { value: "draft", label: "Черновик" },
  { value: "reviewed", label: "Проверено" },
  { value: "published", label: "Опубликовано" },
  { value: "archived", label: "Архив" },
] as const;
