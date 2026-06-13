import React from "react";
import { styles } from "./Pharmacy.styles";
import { Med, GroupBy } from "./types";
import { formatExpiry } from "./expiry";
import { groupItems } from "./grouping";
import { DataGrid, type GridColumn } from "../../components/DataGrid/DataGrid";

type Props = {
  items: Med[];
  groupBy: GroupBy;
  onPick?: (med: Med) => void;
  onEdit?: (med: Med) => void;
  onAdjustQty?: (med: Med) => void;
  onDelete?: (med: Med) => void;
};

export function PharmacyListView({ items, groupBy, onPick, onEdit, onAdjustQty, onDelete }: Props) {
  // groupItems orders the rows by the active grouping (no visible group headers).
  const ordered = groupItems(items, groupBy).flatMap((g) => g.items);

  if (ordered.length === 0) {
    return (
      <div style={styles.emptyState}>
        {groupBy === "attention"
          ? "All clear — no stock needs attention."
          : "No medicines match your filters."}
      </div>
    );
  }

  const columns: GridColumn<Med>[] = [
    { key: "name", header: "Med Name", width: 150, align: "left", render: (m) => m.name },
    {
      key: "invoice", header: "Invoice No.", width: 110, align: "left",
      render: (m) => (
        <a style={styles.invoiceLink} href="#" onClick={(e) => { e.preventDefault(); onPick?.(m); }}>{m.invoiceNo}</a>
      ),
    },
    { key: "batch", header: "Batch", width: 90, align: "left", render: (m) => <span style={styles.secondaryCell}>{m.batch}</span> },
    { key: "packPrice", header: "Pack Price", width: 90, align: "right", render: (m) => m.packPrice.toFixed(2) },
    { key: "mrp", header: "MRP", width: 80, align: "right", render: (m) => m.packMrp.toFixed(2) },
    { key: "perPack", header: "Per Pack", width: 80, align: "right", render: (m) => m.unitsPerPack },
    { key: "unitPrice", header: "Unit Price", width: 90, align: "right", render: (m) => m.unitPrice.toFixed(2) },
    { key: "inStock", header: "In Stock", width: 80, align: "right", render: (m) => m.unitsInStock },
    { key: "expiry", header: "Expiry", width: 96, align: "left", render: (m) => formatExpiry(m.expiry) },
    { key: "discount", header: "Discount", width: 90, align: "right", render: (m) => m.discountPct.toFixed(2) },
    { key: "gst", header: "GST", width: 72, align: "right", render: (m) => m.gstPct.toFixed(2) },
    {
      key: "actions", header: "Actions", width: 110, align: "left",
      render: (m) => (
        <>
          <button type="button" style={styles.actionBtn} title="Delete batch" onClick={() => onDelete?.(m)}>↺</button>
          <button type="button" style={styles.actionBtn} title="Edit batch" onClick={() => onEdit?.(m)}>✎</button>
          <button type="button" style={styles.actionBtn} title="Adjust quantity" onClick={() => onAdjustQty?.(m)}>#</button>
        </>
      ),
    },
  ];

  return <DataGrid columns={columns} rows={ordered} rowKey={(m) => m.id} minWidth={1130} />;
}
