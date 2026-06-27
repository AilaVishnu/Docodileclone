import React from "react";
import { styles } from "./Pharmacy.styles";
import { Med, GroupBy } from "./types";
import { MedIllustration } from "./MedIllustration";
import { expiryStatus, ExpiryStatus, formatExpiry } from "./expiry";
import { groupItems } from "./grouping";

type Props = {
  items: Med[];
  groupBy: GroupBy;
  onPick?: (med: Med) => void;
};

export function PharmacyShelfView({ items, groupBy, onPick }: Props) {
  const groups = groupItems(items, groupBy);

  if (groups.length === 0) {
    return <div style={styles.emptyState}>No medicines match your filters.</div>;
  }

  return (
    <div style={styles.shelfContainer}>
      {groups.map((g) => (
        <div key={g.key} style={styles.shelf}>
          {g.label && (
            <div style={styles.shelfHeader}>
              <h3 style={styles.shelfTitle}>{g.label}</h3>
              <span style={styles.shelfCount}>{g.items.length} item{g.items.length === 1 ? "" : "s"}</span>
            </div>
          )}
          <div style={styles.shelfPlank}>
            <div style={styles.shelfRow} className="no-scrollbar">
              {g.items.map((m) => (
                <Tile key={m.id} med={m} onClick={() => onPick?.(m)} />
              ))}
            </div>
            <div style={styles.shelfBase} />
          </div>
        </div>
      ))}
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
