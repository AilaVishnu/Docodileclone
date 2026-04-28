import React from "react";
import { styles } from "./PatientPicker.styles";
import { Patient, usePatients } from "../../hooks/usePatients";

// ─────────────────────────────────────────────────────────────────────────────
// Internal landing view of the Prescription page. Shows a search bar plus
// a "Recent patients" card listing the clinic's patients sorted by their
// most recent visit. Click a row to open that patient's prescription form.
// ─────────────────────────────────────────────────────────────────────────────

type PatientPickerProps = {
  onSelect: (patientId: string) => void;
};

export function PatientPicker({ onSelect }: PatientPickerProps) {
  const { data: patients, loading, error } = usePatients();
  const [query, setQuery] = React.useState<string>("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, query]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2 style={styles.title}>Prescriptions</h2>
        <p style={styles.subtitle}>
          {loading
            ? "Loading patients…"
            : `${patients.length} ${patients.length === 1 ? "patient" : "patients"} in this clinic`}
        </p>
      </header>

      <div style={styles.searchWrap}>
        <input
          style={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patients…"
          aria-label="Search patients"
        />
      </div>

      <section style={styles.recentCard}>
        <h3 style={styles.recentTitle}>Recent patients</h3>
        {error && (
          <div style={styles.emptyState}>Failed to load patients ({error})</div>
        )}
        {!error && !loading && filtered.length === 0 && (
          <div style={styles.emptyState}>
            {query
              ? "No patients match your search."
              : "No patients yet — use Book Appointment to add one."}
          </div>
        )}
        <div style={styles.rowList}>
          {filtered.map((p) => (
            <PatientRow key={p.id} patient={p} onSelect={onSelect} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PatientRow({ patient, onSelect }: { patient: Patient; onSelect: (id: string) => void }) {
  return (
    <button type="button" style={styles.row} onClick={() => onSelect(patient.id)}>
      <span style={styles.rowName}>{patient.name}</span>
      <span style={styles.rowMeta}>
        {patient.lastVisitDate ? `last visit ${formatDate(patient.lastVisitDate)}` : "no visits yet"}
      </span>
    </button>
  );
}

// e.g. "22 May 26"
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}
