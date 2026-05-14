import React from "react";
import { styles } from "./Pharmacy.styles";
import { Med } from "./types";
import { formatExpiry } from "./expiry";

type Props = {
  items: Med[];
  onPick?: (med: Med) => void;
};

export function PharmacyListView({ items, onPick }: Props) {
  if (items.length === 0) {
    return <div style={styles.emptyState}>No medicines match your filters.</div>;
  }

  return (
    <div style={styles.tableScroll}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th style={styles.th}>Med Name</th>
            <th style={styles.th}>Invoice No.</th>
            <th style={styles.th}>Batch</th>
            <th style={{ ...styles.th, ...styles.thNumeric }}>Pack Price</th>
            <th style={{ ...styles.th, ...styles.thNumeric }}>MRP</th>
            <th style={{ ...styles.th, ...styles.thNumeric }}>Per Pack</th>
            <th style={{ ...styles.th, ...styles.thNumeric }}>Unit Price</th>
            <th style={{ ...styles.th, ...styles.thNumeric }}>In Stock</th>
            <th style={styles.th}>Expiry</th>
            <th style={{ ...styles.th, ...styles.thNumeric }}>Discount</th>
            <th style={{ ...styles.th, ...styles.thNumeric }}>GST</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m, i) => (
            <tr key={m.id} style={{ ...styles.tr, ...(i % 2 === 1 ? styles.trAlt : null) }}>
              <td style={styles.td}>{m.name}</td>
              <td style={styles.td}>
                <a
                  style={styles.invoiceLink}
                  onClick={(e) => {
                    e.preventDefault();
                    onPick?.(m);
                  }}
                  href="#"
                >
                  {m.invoiceNo}
                </a>
              </td>
              <td style={styles.td}>{m.batch}</td>
              <td style={{ ...styles.td, ...styles.tdNumeric }}>{m.packPrice.toFixed(2)}</td>
              <td style={{ ...styles.td, ...styles.tdNumeric }}>{m.packMrp.toFixed(2)}</td>
              <td style={{ ...styles.td, ...styles.tdNumeric }}>{m.unitsPerPack}</td>
              <td style={{ ...styles.td, ...styles.tdNumeric }}>{m.unitPrice.toFixed(2)}</td>
              <td style={{ ...styles.td, ...styles.tdNumeric }}>{m.unitsInStock}</td>
              <td style={styles.td}>{formatExpiry(m.expiry)}</td>
              <td style={{ ...styles.td, ...styles.tdNumeric }}>{m.discountPct.toFixed(2)}</td>
              <td style={{ ...styles.td, ...styles.tdNumeric }}>{m.gstPct.toFixed(2)}</td>
              <td style={styles.td}>
                <button type="button" style={styles.actionBtn} title="Return">↺</button>
                <button type="button" style={styles.actionBtn} title="Edit">✎</button>
                <button type="button" style={styles.actionBtn} title="Edit qty">#</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
