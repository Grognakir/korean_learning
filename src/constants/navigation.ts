export type NavigationItem = {
  href: string;
  label: string;
  mobile: boolean;
  shortLabel: string;
};

export const NAVIGATION_ITEMS = [
  { href: "/", label: "Главная", mobile: true, shortLabel: "Главная" },
  { href: "/topics", label: "Темы", mobile: true, shortLabel: "Темы" },
  { href: "/training", label: "Тренировка", mobile: true, shortLabel: "Учиться" },
  { href: "/review", label: "Повторение", mobile: false, shortLabel: "Повтор" },
  { href: "/progress", label: "Прогресс", mobile: true, shortLabel: "Прогресс" },
  { href: "/dictionary", label: "Словарь", mobile: false, shortLabel: "Словарь" },
] as const satisfies readonly NavigationItem[];
