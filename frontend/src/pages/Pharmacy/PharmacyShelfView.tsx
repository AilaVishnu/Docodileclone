import React from "react";
import { styles } from "./Pharmacy.styles";
import { Med, MedCategory } from "./types";
import { MedIllustration } from "./MedIllustration";
import { expiryStatus, ExpiryStatus, formatExpiry } from "./expiry";

type Props = {
  items: Med[];
  onPick?: (med: Med) => void;
};

const CATEGORY_ORDER: MedCategory[] = [
  "Acne & skin",
  "Cleansers & soaps",
  "Topicals",
  "Serums & boosters",
  "Tablets",
];

export function PharmacyShelfView({ items, onPick }: Props) {
  if (items.length === 0) {
    return <div style={styles.emptyState}>No medicines match your filters.</div>;
  }

  const grouped = new Map<MedCategory, Med[]>();
  for (const m of items) {
    const list = grouped.get(m.category) ?? [];
    list.push(m);
    grouped.set(m.category, list);
  }

  return (
    <div style={styles.shelfContainer}>
      {CATEGORY_ORDER.filter((c) => grouped.has(c)).map((cat) => {
        const meds = grouped.get(cat)!;
        return (
          <div key={cat} style={styles.shelf}>
            <div style={styles.shelfHeader}>
              <h3 style={styles.shelfTitle}>{cat}</h3>
              <span style={styles.shelfCount}>{meds.length} item{meds.length === 1 ? "" : "s"}</span>
            </div>
            <div style={styles.shelfPlank}>
              <div style={styles.shelfRow}>
                {meds.map((m) => (
                  <Tile key={m.id} med={m} onClick={() => onPick?.(m)} />
                ))}
              </div>
              <div style={styles.shelfBase} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Tile({ med, onClick }: { med: Med; onClick: () => void }) {
  const status = expiryStatus(med.expiry);
  const out = med.unitsInStock === 0;

  return (
    <button type="button" style={styles.tile} onClick={onClick} title={`${med.name} — ${med.unitsInStock} in stock`}>
      <div style={styles.tileIllustration}>
        <MedIllustration med={med} />
      </div>
      <div style={styles.tileName}>{med.name}</div>
      <div style={styles.tileMeta}>
        <span style={out ? styles.tileStockOut : undefined}>
          {out ? "Out" : `${med.unitsInStock}`}
        </span>
        <ExpiryChip status={status} label={formatExpiry(med.expiry)} />
      </div>
    </button>
  );
}

function ExpiryChip({ status, label }: { status: ExpiryStatus; label: string }) {
  const variant =
    status === "good" ? styles.expiryGood :
    status === "warn" ? styles.expiryWarn :
    styles.expiryBad;
  return <span style={{ ...styles.expiryChip, ...variant }}>{label}</span>;
}
