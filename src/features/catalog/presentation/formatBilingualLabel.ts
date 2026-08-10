export function capitalizeRu(text: string): string {
  if (!text) {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Display form: `한국어 (Русский перевод)`. */
export function formatBilingualLabel(ko: string, ru: string): string {
  const korean = ko.trim();
  const russian = capitalizeRu(ru.trim());

  if (!korean) {
    return russian;
  }

  if (!russian) {
    return korean;
  }

  return `${korean} (${russian})`;
}
