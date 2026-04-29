import male02 from "../assets/avatars/male-0-2.svg";
import female02 from "../assets/avatars/female-0-2.svg";
import others02 from "../assets/avatars/others-0-2.svg";
import male212 from "../assets/avatars/male-2-12.svg";
import female212 from "../assets/avatars/female-2-12.svg";
import others212 from "../assets/avatars/others-2-12.svg";
import male1225 from "../assets/avatars/male-12-25.svg";
import female1225 from "../assets/avatars/female-12-25.svg";
import others1225 from "../assets/avatars/others-12-25.svg";
import male2560 from "../assets/avatars/male-25-60.svg";
import female2560 from "../assets/avatars/female-25-60.svg";
import others2560 from "../assets/avatars/others-25-60.svg";
import male60 from "../assets/avatars/male-60.svg";
import female60 from "../assets/avatars/female-60.svg";
import others60 from "../assets/avatars/others-60.svg";

// ─────────────────────────────────────────────────────────────────────────────
// Patient avatar picker — Figma 2350:52. Five age bands × three genders, with
// the 0-2 baby illustration shared across all genders. Ages are bucketed
// into bands; missing gender falls back to "others", missing age falls back
// to the "25-60" adult band.
// ─────────────────────────────────────────────────────────────────────────────

export type AvatarGender = "male" | "female" | "others";
export type AgeBand = "0-2" | "2-12" | "12-25" | "25-60" | "60";

const MAP: Record<AvatarGender, Record<AgeBand, string>> = {
  male:   { "0-2": male02,   "2-12": male212,   "12-25": male1225,   "25-60": male2560,   "60": male60 },
  female: { "0-2": female02, "2-12": female212, "12-25": female1225, "25-60": female2560, "60": female60 },
  others: { "0-2": others02, "2-12": others212, "12-25": others1225, "25-60": others2560, "60": others60 },
};

export function ageBand(years: number | null | undefined): AgeBand {
  if (years == null || Number.isNaN(years)) return "25-60";
  if (years < 2) return "0-2";
  if (years < 12) return "2-12";
  if (years < 25) return "12-25";
  if (years < 60) return "25-60";
  return "60";
}

export function normalizeGender(g: string | null | undefined): AvatarGender {
  const s = (g || "").trim().toLowerCase();
  if (s === "male" || s === "m") return "male";
  if (s === "female" || s === "f") return "female";
  return "others";
}

export function pickAvatar(opts: {
  gender?: string | null;
  ageYears?: number | null;
}): string {
  return MAP[normalizeGender(opts.gender)][ageBand(opts.ageYears)];
}
