import React from "react";
import { styles } from "./Pharmacy.styles";
import { Med, GroupBy } from "./types";
import { formatExpiry } from "./expiry";
import { groupItems } from "./grouping";
import { DataGrid, type GridColumn } from "../../components/DataGrid/DataGrid";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";
import { fonts } from "../../styles/theme";

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

  // Data columns carry no fixed width: table-layout:fixed splits the row evenly
  // between them (equal + stretchable). The kebab/actions column stays narrow.
  const columns: GridColumn<Med>[] = [
    { key: "name", header: "Med Name", align: "left", render: (m) => m.name },
    {
      key: "invoice", header: "Invoice No.", align: "left",
      render: (m) => (
        <a style={styles.invoiceLink} href="#" onClick={(e) => { e.preventDefault(); onPick?.(m); }}>{m.invoiceNo}</a>
      ),
    },
    { key: "batch", header: "Batch", align: "left", render: (m) => <span style={styles.secondaryCell}>{m.batch}</span> },
    { key: "packPrice", header: "Pack Price", align: "right", render: (m) => m.packPrice.toFixed(2) },
    { key: "mrp", header: "MRP", align: "right", render: (m) => m.packMrp.toFixed(2) },
    { key: "perPack", header: "Per Pack", align: "right", render: (m) => m.unitsPerPack },
    { key: "unitPrice", header: "Unit Price", align: "right", render: (m) => m.unitPrice.toFixed(2) },
    { key: "inStock", header: "In Stock", align: "right", render: (m) => m.unitsInStock },
    { key: "expiry", header: "Expiry", align: "right", render: (m) => formatExpiry(m.expiry) },
    { key: "discount", header: "Discount", align: "right", render: (m) => m.discountPct.toFixed(2) },
    { key: "gst", header: "GST", align: "right", render: (m) => m.gstPct.toFixed(2) },
    {
      key: "actions", header: "", width: 48, align: "center",
      render: (m) => (
        <PopoverMenu
          ariaLabel="Row actions"
          trigger={<span style={styles.kebab}>⋮</span>}
          items={[
            { label: "Edit batch", onClick: () => onEdit?.(m) },
            { label: "Adjust quantity", onClick: () => onAdjustQty?.(m) },
            { label: "Delete batch", onClick: () => onDelete?.(m) },
          ]}
        />
      ),
    },
  ];

  return <DataGrid columns={columns} rows={ordered} rowKey={(m) => m.id} minWidth={1130} cellFontSize={fonts.control.md} />;
}
