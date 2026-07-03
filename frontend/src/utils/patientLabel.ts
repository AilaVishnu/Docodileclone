// ─────────────────────────────────────────────────────────────────────────────
// Standard patient-label formatting for every patient search dropdown
// (header search, new-appointment name/phone search, etc.).
//
//   "T12 : Ramesh Babu (M|12)"   ← primary label (neutral900)
//   "+918885672664"              ← phone (neutral500, right-aligned)
//
// Keep all patient-search rows going through these so the format stays
// consistent across the app.
// ─────────────────────────────────────────────────────────────────────────────

type PatientLike = {
  name: string;
  gender?: string | null;
  age?: number | null;         // stored in MONTHS
  displayNo?: number | null;
};

// "male" → "M", "female" → "F", otherwise the first char upper-cased.
export function genderShort(gender?: string | null): string {
  const g = (gender || "").trim();
  if (!g) return "";
  if (g.toLowerCase().startsWith("m")) return "M";
  if (g.toLowerCase().startsWith("f")) return "F";
  return g.charAt(0).toUpperCase();
}

// Age is persisted in months; the patient meta shows whole years.
export function ageYears(age?: number | null): number | null {
  return age != null ? Math.floor(age / 12) : null;
}

// "(M|12)" / "(M)" / "" — gender initial, pipe, age in years.
export function patientMeta(p: PatientLike): string {
  const g = genderShort(p.gender);
  const y = ageYears(p.age);
  if (!g && y == null) return "";
  return y == null ? `(${g})` : `(${g}|${y})`;
}

// Capitalise the first letter of every word: "raja laxshmi" → "Raja Laxshmi".
// Existing casing is otherwise preserved.
export function titleCaseName(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Indian phone with a "+91 " prefix and bare 10 local digits:
//   "9704260320" / "+919704260320" / "91 97042 60320" → "+91 9704260320".
export function formatPhoneIndia(phone?: string | null): string {
  if (!phone) return "";
  let d = phone.replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("91")) d = d.slice(2);
  d = d.slice(-10);
  return d ? `+91 ${d}` : "";
}

// "T12" — the patient code (its own column so names align across rows).
export function patientCode(p: PatientLike): string {
  return p.displayNo != null ? `T${p.displayNo}` : "T—";
}

// "Ramesh Babu (M|12)" — title-cased name + meta, no code.
export function patientNameMeta(p: PatientLike): string {
  const meta = patientMeta(p);
  return `${titleCaseName(p.name)}${meta ? ` ${meta}` : ""}`;
}

// "T12 : Ramesh Babu (M|12)" — single-string label (name title-cased). Use the
// column helpers above when rows need to align.
export function patientPrimaryLabel(p: PatientLike): string {
  return `${patientCode(p)} : ${patientNameMeta(p)}`;
}
