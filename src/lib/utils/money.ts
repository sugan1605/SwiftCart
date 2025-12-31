export function formatNOKFromCents(cents: number): string {
  if (!Number.isFinite(cents)) return "-";

  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
