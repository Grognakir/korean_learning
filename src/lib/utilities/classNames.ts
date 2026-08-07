type ClassName = string | false | null | undefined;

export function classNames(...values: ClassName[]): string {
  return values.filter((value): value is string => Boolean(value)).join(" ");
}
