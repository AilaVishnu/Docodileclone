import { Med, MedForm, GroupBy } from "./types";
import { expiryStatus } from "./expiry";

export type Group = { key: string; label: string; items: Med[] };

const FORM_LABEL: Record<MedForm, string> = {
  tablet: "Tablets",
  syrup: "Syrups",
  cream: "Creams & lotions",
  ointment: "Ointments & gels",
  spray: "Sprays",
  soap: "Soaps & cleansers",
  serum: "Serums",
  drops: "Drops",
};

const FORM_ORDER: MedForm[] = [
  "tablet", "ointment", "cream", "soap", "spray", "serum", "syrup", "drops",
];

// Shared grouping engine — same buckets feed both shelf and list views.
export function groupItems(items: Med[], by: GroupBy): Group[] {
  if (by === "alpha") {
    return groupAlpha(items);
  }
  if (by === "form") {
    return groupForm(items);
  }
  return groupAttention(items);
}

function groupAlpha(items: Med[]): Group[] {
  const map = new Map<string, Med[]>();
  for (const m of items) {
    const letter = (m.name[0] ?? "#").toUpperCase();
    const k = /[A-Z]/.test(letter) ? letter : "#";
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(m);
  }
  const keys = Array.from(map.keys()).sort();
  return keys.map((k) => ({
    key: k,
    label: k,
    items: map.get(k)!.sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

function groupForm(items: Med[]): Group[] {
  const map = new Map<MedForm, Med[]>();
  for (const m of items) {
    if (!map.has(m.form)) map.set(m.form, []);
    map.get(m.form)!.push(m);
  }
  return FORM_ORDER
    .filter((f) => map.has(f))
    .map((f) => ({
      key: f,
      label: FORM_LABEL[f],
      items: map.get(f)!.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

// Attention view — three urgency buckets, items appear in the most
// urgent one they qualify for. Healthy stock is excluded.
function groupAttention(items: Med[]): Group[] {
  const out: Med[] = [];
  const expiring: Med[] = [];
  const low: Med[] = [];

  for (const m of items) {
    if (m.unitsInStock === 0) {
      out.push(m);
    } else if (expiryStatus(m.expiry) === "bad") {
      expiring.push(m);
    } else if (m.unitsInStock < 5) {
      low.push(m);
    }
  }

  const groups: Group[] = [];
  if (out.length) groups.push({ key: "out", label: "Out of stock", items: out });
  if (expiring.length) groups.push({ key: "exp", label: "Expiring soon", items: expiring });
  if (low.length) groups.push({ key: "low", label: "Low stock", items: low });
  return groups;
}
