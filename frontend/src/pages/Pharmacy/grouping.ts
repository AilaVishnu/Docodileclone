import { Med, MedForm, MedCategory, GroupBy } from "./types";
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

const CATEGORY_ORDER: MedCategory[] = [
  "Tablets", "Topicals", "Acne & skin", "Cleansers & soaps", "Serums & boosters",
];

// Shared grouping engine — feeds the shelf view's aisle sections. The list view
// no longer groups (its rows order by the clickable column headers).
export function groupItems(items: Med[], by: GroupBy): Group[] {
  if (by === "category") return groupCategory(items);
  if (by === "none") return groupNone(items);
  return groupForm(items);
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

function groupCategory(items: Med[]): Group[] {
  const map = new Map<MedCategory, Med[]>();
  for (const m of items) {
    if (!map.has(m.category)) map.set(m.category, []);
    map.get(m.category)!.push(m);
  }
  // Known categories first (in CATEGORY_ORDER), then any stragglers alphabetically.
  const known = CATEGORY_ORDER.filter((c) => map.has(c));
  const extra = Array.from(map.keys()).filter((c) => !CATEGORY_ORDER.includes(c)).sort();
  return [...known, ...extra].map((c) => ({
    key: c,
    label: c,
    items: map.get(c)!.sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

// Ungrouped — one section with no header (the shelf hides the header when the
// label is empty), names sorted A→Z.
function groupNone(items: Med[]): Group[] {
  if (items.length === 0) return [];
  return [{ key: "all", label: "", items: [...items].sort((a, b) => a.name.localeCompare(b.name)) }];
}

// A medicine "needs attention" if it's out of stock, expiring within 3 months,
// or running low (<5 units). Drives the shared "Needs attention" filter.
export function needsAttention(m: Med): boolean {
  return m.unitsInStock === 0 || expiryStatus(m.expiry) === "bad" || m.unitsInStock < 5;
}
