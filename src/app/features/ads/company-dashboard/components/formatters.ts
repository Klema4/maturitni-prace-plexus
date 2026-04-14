export function formatNumber(value: number) {
  return new Intl.NumberFormat("cs-CZ").format(value);
}

export function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
