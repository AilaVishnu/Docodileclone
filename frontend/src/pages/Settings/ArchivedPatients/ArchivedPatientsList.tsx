import React, { useEffect, useState, useCallback } from "react";
import { colors, fonts, radii, spacing } from "../../../styles/theme";
import { tableHeadCell, tableDivider } from "../../../styles/tableStyles";
import { API_BASE_URL } from "../../../apiConfig";
import { Toast } from "../../../components/Toast";

// ─────────────────────────────────────────────────────────────────────────────
// Settings → Archived patients. Lists every patient in this clinic where
// archived=true and offers a one-click "Restore" that flips the flag back
// (POST /api/patients/{id}/unarchive). Patient data is preserved on archive
// so restore is non-destructive.
// ─────────────────────────────────────────────────────────────────────────────

type ArchivedPatient = {
  id: string;
  name: string;
  phone: string | null;
  gender: string | null;
  archivedAt: string | null;
};

export function ArchivedPatientsList() {
  const [rows, setRows] = useState<ArchivedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("docodile_token");
      const res = await fetch(`${API_BASE_URL}/api/patients/archived`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRows(await res.json());
    } catch (e) {
      setError((e as Error).message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleRestore = async (p: ArchivedPatient) => {
    setRestoring(p.id);
    try {
      const token = localStorage.getItem("docodile_token");
      const res = await fetch(`${API_BASE_URL}/api/patients/${p.id}/unarchive`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRows((cur) => cur.filter((x) => x.id !== p.id));
      setToastMsg(`${p.name} restored`);
    } catch (e) {
      setToastMsg(`Couldn't restore: ${(e as Error).message}`);
    } finally {
      setRestoring(null);
    }
  };

  if (loading) {
    return <div style={S.state}>Loading archived patients…</div>;
  }

  if (error) {
    return <div style={S.state}>Couldn't load archived patients ({error}).</div>;
  }

  if (rows.length === 0) {
    return (
      <div style={S.state}>
        No archived patients. When you archive a patient from the Edit Patient
        Info modal, they'll appear here so you can restore them later.
      </div>
    );
  }

  return (
    <div style={S.card}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Name</th>
            <th style={S.th}>Phone</th>
            <th style={S.th}>Gender</th>
            <th style={S.th}>Archived on</th>
            <th style={{ ...S.th, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td style={S.td}>{p.name}</td>
              <td style={S.td}>{p.phone ?? "—"}</td>
              <td style={S.td}>{p.gender ?? "—"}</td>
              <td style={S.td}>{p.archivedAt ? new Date(p.archivedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
              <td style={{ ...S.td, textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => handleRestore(p)}
                  disabled={restoring === p.id}
                  style={{ ...S.restoreBtn, ...(restoring === p.id ? { opacity: 0.45, cursor: "not-allowed" } : null) }}
                >
                  {restoring === p.id ? "Restoring…" : "Restore"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Toast message={toastMsg} isVisible={!!toastMsg} onClose={() => setToastMsg("")} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  // Empty / loading / error states share the same cream surface as the
  // table card so the page rhythm doesn't change when the list is empty.
  state: {
    backgroundColor: colors.primary100,
    borderRadius: radii["2xl"],
    padding: spacing["2xl"],
    color: colors.neutral600,
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    textAlign: "center",
  },
  // Cream container — mirrors the pharmacy inventory listCard so settings
  // tables feel like the same family of surface across the app.
  card: {
    backgroundColor: colors.primary100,
    borderRadius: radii["2xl"],
    padding: spacing.xl,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral900,
  },
  th: {
    ...tableHeadCell, // shared: alphaBlack3 / 400 / primary300 divider
    padding: `${spacing.s} ${spacing.m}`,
    fontSize: fonts.control.xs,
    whiteSpace: "nowrap",
  },
  td: {
    padding: `${spacing.s} ${spacing.m}`,
    borderBottom: tableDivider,
    whiteSpace: "nowrap",
  },
  restoreBtn: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.sm,
    color: colors.neutral100,
    backgroundColor: colors.primary700,
    border: "none",
    borderRadius: radii.full,
    padding: "8px 18px",
    cursor: "pointer",
  },
};
