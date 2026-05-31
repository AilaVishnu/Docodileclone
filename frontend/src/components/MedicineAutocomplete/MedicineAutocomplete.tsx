import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { API_BASE_URL } from "../../apiConfig";
import { listPharmacyStock } from "../../api/pharmacy";

type Drug = { id: string; name: string; genericName: string };

// One row in the pharmacy suggestion list. Multiple batches of the same
// medicine collapse into a single entry — the dropdown shows total units
// across batches so the doctor sees what's actually on hand, not how many
// rows the inventory table has.
type StockSuggestion = { name: string; totalUnits: number };

type MedicineAutocompleteProps = {
  value: string;
  onChange: (next: string) => void;
  onSelect?: (name: string, genericName: string) => void;
  placeholder?: string;
  inputStyle?: CSSProperties;
};

export function MedicineAutocomplete({ value, onChange, onSelect, placeholder, inputStyle }: MedicineAutocompleteProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [frequent, setFrequent] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  // Pharmacy inventory for the current clinic — fetched once on mount and
  // filtered client-side as the doctor types. Cheap because clinics carry
  // a few hundred SKUs at most.
  const [stock, setStock] = useState<StockSuggestion[]>([]);

  // Load frequently used medicines once on mount.
  useEffect(() => {
    const token = localStorage.getItem("docodile_token") ?? "";
    fetch(`${API_BASE_URL}/api/medicines/frequent?limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{ id: string; name: string; generic_name?: string; genericName?: string }>) =>
        setFrequent(data.map((d) => ({ id: d.id, name: d.name, genericName: d.genericName ?? d.generic_name ?? "" })))
      )
      .catch(() => {});
  }, []);

  // Pull this clinic's pharmacy inventory once and roll multiple batches
  // of the same medicine into a single total — surfaced ABOVE the generic
  // drug DB matches so the doctor sees what's actually on the shelf first.
  useEffect(() => {
    listPharmacyStock()
      .then((meds) => {
        const totals = new Map<string, number>();
        for (const m of meds) {
          const key = m.name.trim();
          if (!key) continue;
          totals.set(key, (totals.get(key) ?? 0) + (m.unitsInStock ?? 0));
        }
        setStock(Array.from(totals.entries()).map(([name, totalUnits]) => ({ name, totalUnits })));
      })
      .catch(() => {});
  }, []);

  // Filter inventory by the typed query. Substring match on name, case-
  // insensitive — same UX as the search-by-name behavior in the pharmacy
  // inventory page. Empty query returns nothing (frequent list handles
  // the "just-focused" state).
  const stockMatches = useMemo<StockSuggestion[]>(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return stock
      .filter((s) => s.name.toLowerCase().includes(q))
      .sort((a, b) => {
        // Exact / prefix matches first, then by units desc so well-stocked
        // items take precedence over near-empty ones with the same prefix.
        const aPref = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bPref = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        if (aPref !== bPref) return aPref - bPref;
        return b.totalUnits - a.totalUnits;
      })
      .slice(0, 8);
  }, [stock, value]);

  // Search when value changes.
  useEffect(() => {
    if (!value.trim()) { setDrugs([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      const token = localStorage.getItem("docodile_token") ?? "";
      fetch(`${API_BASE_URL}/api/medicines/search?q=${encodeURIComponent(value)}&limit=8`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : [])
        .then((data: Array<{ id: string; name: string; generic_name?: string; genericName?: string }>) => {
          setDrugs(data.map((d) => ({ id: d.id, name: d.name, genericName: d.genericName ?? d.generic_name ?? "" })));
          setLoading(false);
        })
        .catch(() => { setDrugs([]); setLoading(false); });
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (d: Drug) => {
    onChange(d.name);
    onSelect?.(d.name, d.genericName);
    setOpen(false);
  };

  const handleSelectStock = (s: StockSuggestion) => {
    onChange(s.name);
    // No generic name from inventory rows — pass empty so any cached
    // generic on the row is cleared if the doctor picked a different med.
    onSelect?.(s.name, "");
    setOpen(false);
  };

  // Stock colour reflects what's actually safe to prescribe today —
  // mirrors the pharmacy "Attention" thresholds.
  const stockColor = (units: number): string => {
    if (units <= 0) return colors.red200;
    if (units < 30) return colors.primary700;
    return colors.green200;
  };

  const showFrequent = open && !value.trim() && frequent.length > 0;
  const showSearch = open && value.trim().length > 0;

  const DrugButton = ({ d }: { d: Drug }) => (
    <button
      key={d.id || d.name}
      type="button"
      style={styles.item}
      onMouseDown={(e) => { e.preventDefault(); handleSelect(d); }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.active.shade100)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <span style={styles.drugName}>{d.name}</span>
      {d.genericName && <span style={styles.genericName}>{d.genericName}</span>}
    </button>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <input
        style={{ ...styles.input, ...inputStyle }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); onSelect?.(e.target.value, ""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {showFrequent && (
        <div style={styles.menu}>
          <p style={styles.sectionLabel}>Frequently Used</p>
          {frequent.map((d) => <DrugButton key={d.id || d.name} d={d} />)}
        </div>
      )}

      {showSearch && (
        <div style={styles.menu}>
          {stockMatches.length > 0 && (
            <>
              <p style={styles.sectionLabel}>In Stock</p>
              {stockMatches.map((s) => (
                <button
                  key={`stock-${s.name}`}
                  type="button"
                  style={styles.stockItem}
                  onMouseDown={(e) => { e.preventDefault(); handleSelectStock(s); }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.active.shade100)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span style={styles.drugName}>{s.name}</span>
                  <span style={{ ...styles.stockCount, color: stockColor(s.totalUnits) }}>{s.totalUnits}</span>
                </button>
              ))}
            </>
          )}
          {drugs.length > 0 && stockMatches.length > 0 && <p style={styles.sectionLabel}>Other matches</p>}
          {loading && <div style={styles.hint}>Searching…</div>}
          {!loading && drugs.length === 0 && stockMatches.length === 0 && <div style={styles.hint}>No matches</div>}
          {drugs.map((d) => <DrugButton key={d.id} d={d} />)}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: { position: "relative", width: "100%" },
  input: { width: "100%", boxSizing: "border-box" },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 260,
    backgroundColor: colors.neutral100,
    border: `${strokes.xs} solid ${colors.primary300}`,
    borderRadius: radii.m,
    padding: spacing["2xs"],
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    zIndex: 1200,
    maxHeight: "min(40vh, 320px)",
    overflowY: "auto",
  },
  sectionLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    margin: `${spacing["2xs"]} ${spacing.s} ${spacing["3xs"]}`,
  },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    textAlign: "left",
    padding: `${spacing.xs} ${spacing.s}`,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: radii.xs,
    transition: "background-color 0.1s ease",
    gap: 2,
  },
  drugName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    lineHeight: fonts.lineHeight.s,
  },
  genericName: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    lineHeight: fonts.lineHeight.xs,
  },
  hint: {
    padding: `${spacing.xs} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    fontStyle: "italic",
  },
  // Inventory row — drug name on the left, units count badge on the right.
  // Colour of the count reflects stock health (red/orange/green).
  stockItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    textAlign: "left",
    padding: `${spacing.xs} ${spacing.s}`,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: radii.xs,
    transition: "background-color 0.1s ease",
    gap: spacing.s,
  },
  stockCount: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: fonts.weight.semibold,
    fontVariantNumeric: "tabular-nums",
  },
};
