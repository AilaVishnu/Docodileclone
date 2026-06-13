import React from "react";
import { colors, fonts } from "../../styles/theme";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { usePatients, type Patient } from "../../hooks/usePatients";
import { PatientSearchRow } from "../PatientSearchRow/PatientSearchRow";
import { setPendingSessionNav } from "./SessionTrayButton";
import type { NavTab } from "../SideNav";

// Left-rail action index for the patient chart's Info tab (mirrors
// PrescriptionPage's INFO_ACTION). Header results open the chart there.
const INFO_ACTION = 4;

// Header search bar: type a name / T-number / phone and pick a patient.
// Results render in the standard format "T12 : Ramesh Babu (M|12)  +phone".
// Patients-only for now, structured so other result types can be added later.
export function HeaderPatientSearch({ onNavigate }: { onNavigate?: (tab: NavTab) => void }) {
  const { data: patients } = usePatients();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const digits = q.replace(/\D/g, "");
    return patients
      .filter((p) => {
        const name = p.name.toLowerCase();
        const tid = p.displayNo != null ? `t${p.displayNo}` : "";
        const phone = (p.phone ?? "").replace(/\D/g, "");
        return (
          name.includes(q) ||
          tid.includes(q) ||
          (digits.length >= 3 && phone.includes(digits))
        );
      })
      .slice(0, 8);
  }, [query, patients]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const handleSelect = (p: Patient) => {
    // Reuse the prescription-page nav channel; open the chart on the Info tab.
    setPendingSessionNav({ patient: p, appointmentId: null, initialAction: INFO_ACTION });
    setQuery("");
    setOpen(false);
    onNavigate?.("Prescription");
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <div style={styles.bar}>
        <SearchIcon style={{ width: "var(--search-icon)", height: "var(--search-icon)", color: colors.neutral400, flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search for anything..."
          className="topnav-search-input"
          style={styles.input}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <style>{`.topnav-search-input::placeholder { color: ${colors.neutral400}; opacity: 1; }`}</style>
      </div>

      {open && query.trim().length > 0 && (
        <div style={styles.dropdown}>
          {results.length === 0 ? (
            <div style={styles.empty}>No patients found</div>
          ) : (
            results.map((p) => (
              <PatientSearchRow key={p.id} patient={p} onSelect={handleSelect} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: colors.active.shade100,
    borderRadius: "55px",
    padding: "0 16px",
    width: "var(--topnav-search-w)",
    height: "var(--search-h)",
    boxSizing: "border-box",
    gap: "12px",
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    fontFamily: fonts.family.primary,
    fontSize: "var(--search-fs)",
    color: colors.neutral900,
    padding: 0,
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    backgroundColor: colors.neutral100,
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    border: `1px solid ${colors.neutral200}`,
    zIndex: 3200,
    padding: 6,
    maxHeight: 360,
    overflowY: "auto",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    width: "100%",
    padding: "10px 14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: 10,
  },
  primary: {
    color: colors.neutral900,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  phone: {
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    whiteSpace: "nowrap",
    flexShrink: 0,
    // Fixed-width digits so every phone right-aligns into a clean column.
    fontVariantNumeric: "tabular-nums",
  },
  empty: {
    padding: "12px 14px",
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
  },
};
