import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { API_BASE_URL } from "../../apiConfig";

type Drug = { id: string; name: string; genericName: string };

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
          {loading && <div style={styles.hint}>Searching…</div>}
          {!loading && drugs.length === 0 && <div style={styles.hint}>No matches</div>}
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
};
