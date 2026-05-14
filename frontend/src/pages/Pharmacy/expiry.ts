// Shared expiry helpers used by both list and shelf views.

export type ExpiryStatus = "good" | "warn" | "bad";

export function monthsUntilExpiry(yyyyMm: string, ref: Date = new Date()): number {
  const [y, m] = yyyyMm.split("-").map((s) => parseInt(s, 10));
  if (!y || !m) return Infinity;
  return (y - ref.getFullYear()) * 12 + (m - 1 - ref.getMonth());
}

export function expiryStatus(yyyyMm: string, ref?: Date): ExpiryStatus {
  const months = monthsUntilExpiry(yyyyMm, ref);
  if (months < 3) return "bad";
  if (months < 6) return "warn";
  return "good";
}

export function formatExpiry(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map((s) => parseInt(s, 10));
  if (!y || !m) return yyyyMm;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]}-${y}`;
}
