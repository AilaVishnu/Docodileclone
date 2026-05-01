import React from "react";

// We need the SVG *URL* (not the React component) so we can use it as a
// `background-image`. This avoids all the flex-sizing quirks the inline-SVG
// approach had (figure getting clipped / sunk depending on sibling height).
import pharmacyMaleUrl    from "../../assets/staff/pharmacy_male.svg";
import pharmacyFemaleUrl  from "../../assets/staff/pharmacy_female.svg";
import doctorMaleUrl      from "../../assets/staff/doctor_male.svg";
import doctorFemaleUrl    from "../../assets/staff/doctor_female.svg";
import nurseMaleUrl       from "../../assets/staff/nurse_male.svg";
import nurseFemaleUrl     from "../../assets/staff/nurse_female.svg";
import frontdeskMaleUrl   from "../../assets/staff/frontdesk_male.svg";
import frontdeskFemaleUrl from "../../assets/staff/frontdesk_female.svg";
import labMaleUrl         from "../../assets/staff/lab_male.svg";
import labFemaleUrl       from "../../assets/staff/lab_female.svg";

type Role = "Doctor" | "Nurse" | "Pharmacy" | "Front Desk" | "Lab" | string;
type Gender = "male" | "female" | "other" | "";
type Crop = "full" | "bust" | "face";

type IllustrationProps = {
  role: Role;
  gender: Gender;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  // "full" – shows the whole figure anchored to bottom (modal, full cards)
  // "bust" – shows head + shoulders, zoomed in (house tile)
  // "face" – shows just the face, circular avatars in top nav / status cards
  crop?: Crop;
};

const AVATARS: Record<string, { male: string; female: string }> = {
  "Doctor":     { male: doctorMaleUrl,     female: doctorFemaleUrl     },
  "Nurse":      { male: nurseMaleUrl,      female: nurseFemaleUrl      },
  "Pharmacy":   { male: pharmacyMaleUrl,   female: pharmacyFemaleUrl   },
  "Front Desk": { male: frontdeskMaleUrl,  female: frontdeskFemaleUrl  },
  "Lab":        { male: labMaleUrl,        female: labFemaleUrl        },
};

// Container background = the same color baked into the SVG's rect fill, so
// the SVG can sit anywhere inside and the color reads as continuous.
const ROLE_BG: Record<string, string> = {
  "Doctor":     "#AE561A",
  "Pharmacy":   "#556536",
  "Nurse":      "#D00416",
  "Front Desk": "#196A7F",
  "Lab":        "#5A4D84",
};

// Tuned for the 217×217 SVG viewBox (figure body y≈38..217, x≈50..185).
const CROP_SETTINGS: Record<Crop, { size: string; position: string }> = {
  full: { size: "contain",   position: "50% 100%" },  // full figure, bottom, letterboxed sides
  // `cover` fills the container (no side letterboxing), crops at most ~15
  // SVG units from the top. Since the figure's hair sits at y=38, the hair
  // stays visible with a small band of background above it. Previous 140%
  // was cropping the top of the head.
  bust: { size: "cover",     position: "50% 100%" },
  face: { size: "120% auto", position: "50% 22%"  },  // head/face, centered
};

function pickUrl(role: Role, gender: Gender): string {
  const g = gender === "male" ? "male" : "female";
  return (AVATARS[role]?.[g]) ?? AVATARS["Front Desk"][g];
}

function pickBg(role: Role): string {
  return ROLE_BG[role] ?? ROLE_BG["Front Desk"];
}

export function StaffIllustration({
  role,
  gender,
  width = 180,
  height,
  borderRadius = 8,
  crop = "full",
}: IllustrationProps) {
  const url = pickUrl(role, gender);
  const bg = pickBg(role);
  const settings = CROP_SETTINGS[crop];

  return (
    <div
      style={{
        width,
        height,
        // Stretch to match the tallest sibling in flex parents; harmless
        // when an explicit height is supplied.
        alignSelf: "stretch",
        borderRadius,
        backgroundColor: bg,
        backgroundImage: `url(${url})`,
        backgroundSize: settings.size,
        backgroundPosition: settings.position,
        backgroundRepeat: "no-repeat",
        flexShrink: 0,
        overflow: "hidden",
      }}
    />
  );
}
