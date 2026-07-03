import React from "react";
import { colors, fonts } from "../../styles/theme";
import { patientCode, patientNameMeta, formatPhoneIndia } from "../../utils/patientLabel";

// One row in any patient-search dropdown — the app-wide standard.
// Three aligned columns so rows line up regardless of T-id / name length:
//
//   [ T1286 ] [ : Vinay (M|28) ............ ] [ +91 7801055010 ]
//    fixed       flexible (ellipsis)            right, tabular
//
// The fixed first column is what makes the names line up across rows even
// though "T1286" and "T785" are different widths.
type PatientLike = {
  id: string;
  name: string;
  phone?: string | null;
  gender?: string | null;
  age?: number | null;
  displayNo?: number | null;
};

export function PatientSearchRow<T extends PatientLike>({
  patient,
  onSelect,
}: {
  patient: T;
  onSelect: (p: T) => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={() => onSelect(patient)}
      style={styles.row}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.primary100)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <span style={styles.code}>{patientCode(patient)}</span>
      <span style={styles.name}>: {patientNameMeta(patient)}</span>
      <span style={styles.phone}>{formatPhoneIndia(patient.phone)}</span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "grid",
    // Fixed T-id column → names align across rows. Flexible name. Auto phone.
    gridTemplateColumns: "56px 1fr auto",
    alignItems: "center",
    columnGap: 8,
    width: "100%",
    padding: "10px 14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: 10,
    fontFamily: fonts.family.primary,
  },
  code: {
    color: colors.neutral900,
    fontSize: fonts.size.s,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  name: {
    color: colors.neutral900,
    fontSize: fonts.size.s,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
  },
  phone: {
    color: colors.neutral500,
    fontSize: fonts.size.s,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    textAlign: "right",
  },
};
