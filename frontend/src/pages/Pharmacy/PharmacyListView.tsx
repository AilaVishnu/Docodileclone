import React from "react";
import { styles } from "./Pharmacy.styles";
import { Med } from "./types";
import { formatExpiry } from "./expiry";
import { DataGrid, type GridColumn } from "../../components/DataGrid/DataGrid";
import { PopoverMenu } from "../../components/PopoverMenu/PopoverMenu";

type Props = {
  items: Med[];
  onPick?: (med: Med) => void;
  onEdit?: (med: Med) => void;
  onAdjustQty?: (med: Med) => void;
  onDelete?: (med: Med) => void;
};

export function PharmacyListView({ items, onPick, onEdit, onAdjustQty, onDelete }: Props) {
  // Rows render in the incoming order; the column headers sort on click.
  if (items.length === 0) {
    return <div style={styles.emptyState}>No medicines match your filters.</div>;
  }

  // Data columns carry no fixed width: table-layout:fixed splits the row evenly
  // between them (equal + stretchable). The kebab/actions column stays narrow.
  const columns: GridColumn<Med>[] = [
    { key: "name", header: "Med Name", align: "left", render: (m) => m.name, sortAccessor: (m) => m.name },
    {
      key: "invoice", header: "Invoice No.", align: "left",
      render: (m) => (
        <a style={styles.invoiceLink} href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPick?.(m); }}>{m.invoiceNo}</a>
      ),
      sortAccessor: (m) => m.invoiceNo,
    },
    { key: "batch", header: "Batch", align: "left", render: (m) => <span style={styles.secondaryCell}>{m.batch}</span>, sortAccessor: (m) => m.batch },
    { key: "packPrice", header: "Pack Price", align: "right", render: (m) => m.packPrice.toFixed(2), sortAccessor: (m) => m.packPrice },
    { key: "mrp", header: "MRP", align: "right", render: (m) => m.packMrp.toFixed(2), sortAccessor: (m) => m.packMrp },
    { key: "perPack", header: "Per Pack", align: "right", render: (m) => m.unitsPerPack, sortAccessor: (m) => m.unitsPerPack },
    { key: "unitPrice", header: "Unit Price", align: "right", render: (m) => m.unitPrice.toFixed(2), sortAccessor: (m) => m.unitPrice },
    { key: "inStock", header: "In Stock", align: "right", render: (m) => m.unitsInStock, sortAccessor: (m) => m.unitsInStock },
    { key: "expiry", header: "Expiry", align: "right", render: (m) => formatExpiry(m.expiry), sortAccessor: (m) => m.expiry },
    { key: "discount", header: "Discount", align: "right", render: (m) => m.discountPct.toFixed(2), sortAccessor: (m) => m.discountPct },
    { key: "gst", header: "GST", align: "right", render: (m) => m.gstPct.toFixed(2), sortAccessor: (m) => m.gstPct },
    {
      key: "actions", header: "", width: 48, align: "center",
      render: (m) => (
        // Stop row-click from also opening the detail modal when using the menu.
        <span onClick={(e) => e.stopPropagation()}>
          <PopoverMenu
            ariaLabel="Row actions"
            trigger={<span style={styles.kebab}>⋮</span>}
            items={[
              { label: "Edit batch", onClick: () => onEdit?.(m) },
              { label: "Adjust quantity", onClick: () => onAdjustQty?.(m) },
              { label: "Delete batch", onClick: () => onDelete?.(m) },
            ]}
          />
        </span>
      ),
    },
  ];

  return <DataGrid columns={columns} rows={items} rowKey={(m) => m.id} minWidth={1130} cellFontSize="var(--meds-list-fs)" onRowClick={onPick ? (m) => onPick(m) : undefined} />;
}
