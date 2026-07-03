import React, { useEffect, useState, useCallback } from "react";
import { colors, fonts, radii, spacing } from "../../../styles/theme";
import { API_BASE_URL } from "../../../apiConfig";
import { Toast } from "../../../components/Toast";
import { resolveToastIcon } from "../../../components/Toast/toastIcon";
import { DataGrid, type GridColumn } from "../../../components/DataGrid/DataGrid";

// ─────────────────────────────────────────────────────────────────────────────
// Settings → Archived patients. Lists every patient in this clinic where
// archived=true and offers a one-click "Restore" that flips the flag back
// (POST /api/patients/{id}/unarchive). Patient data is preserved on archive
// so restore is non-destructive. Table = the shared DataGrid.
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

  const columns: GridColumn<ArchivedPatient>[] = [
    { key: "name", header: "Name", align: "left", render: (p) => p.name },
    { key: "phone", header: "Phone", align: "left", render: (p) => p.phone ?? "—" },
    { key: "gender", header: "Gender", align: "left", render: (p) => p.gender ?? "—" },
    {
      key: "archivedAt", header: "Archived on", align: "left",
      render: (p) => (p.archivedAt ? new Date(p.archivedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"),
    },
    {
      key: "actions", header: "Actions", align: "right", width: 130,
      render: (p) => (
        <button
          type="button"
          onClick={() => handleRestore(p)}
          disabled={restoring === p.id}
          style={{ ...S.restoreBtn, ...(restoring === p.id ? { opacity: 0.45, cursor: "not-allowed" } : null) }}
        >
          {restoring === p.id ? "Restoring…" : "Restore"}
        </button>
      ),
    },
  ];

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
      <DataGrid columns={columns} rows={rows} rowKey={(p) => p.id} />
      <Toast message={toastMsg} {...resolveToastIcon(toastMsg)} isVisible={!!toastMsg} onClose={() => setToastMsg("")} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  // Empty / loading / error states share the same cream surface as the table.
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
