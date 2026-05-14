import React, { useMemo, useState } from "react";
import { styles } from "./Pharmacy.styles";
import { MOCK_INVENTORY } from "./mockInventory";
import { PharmacyListView } from "./PharmacyListView";
import { PharmacyShelfView } from "./PharmacyShelfView";
import { Med } from "./types";
import { formatExpiry, expiryStatus } from "./expiry";
import { MedIllustration } from "./MedIllustration";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../iconsUtil";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { ReactComponent as ListSortIcon } from "../../assets/icons/list-sort.svg";
import { ReactComponent as WidgetIcon } from "../../assets/icons/widget.svg";

type ViewMode = "list" | "shelf";

export function PharmacyView() {
  const [view, setView] = useState<ViewMode>("shelf");
  const [query, setQuery] = useState("");
  const [showZero, setShowZero] = useState(true);
  const [selected, setSelected] = useState<Med | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_INVENTORY.filter((m) => {
      if (!showZero && m.unitsInStock === 0) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.batch.toLowerCase().includes(q) ||
        m.invoiceNo.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });
  }, [query, showZero]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Pharmacy Stocks</h1>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <div style={styles.searchWrap}>
            <SearchIcon style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search medicine, batch, invoice…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <label style={styles.filterChip}>
            <input
              type="checkbox"
              checked={!showZero}
              onChange={(e) => setShowZero(!e.target.checked)}
            />
            Hide 0 stock
          </label>
        </div>

        <div style={styles.toolbarRight}>
          <div style={styles.viewToggle} aria-label="View mode">
            <button
              type="button"
              style={{ ...styles.viewBtn, ...(view === "list" ? styles.viewBtnActive : null) }}
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
            >
              <ListSortIcon width={20} height={20} />
            </button>
            <button
              type="button"
              style={{ ...styles.viewBtn, ...(view === "shelf" ? styles.viewBtnActive : null) }}
              onClick={() => setView("shelf")}
              aria-label="Shelf view"
              aria-pressed={view === "shelf"}
            >
              <WidgetIcon width={20} height={20} />
            </button>
          </div>
          <Button
            variant="dark"
            size="md"
            iconLeft={<PlusIcon style={{ width: 16, height: 16 }} />}
          >
            Add Stock
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <div style={styles.listCard}>
          <PharmacyListView items={items} onPick={setSelected} />
        </div>
      ) : (
        <PharmacyShelfView items={items} onPick={setSelected} />
      )}

      <Modal isOpen={selected !== null} onClose={() => setSelected(null)}>
        {selected && <DetailBody med={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </div>
  );
}

function DetailBody({ med, onClose }: { med: Med; onClose: () => void }) {
  const status = expiryStatus(med.expiry);
  const expiryStyle =
    status === "good" ? styles.expiryGood :
    status === "warn" ? styles.expiryWarn :
    styles.expiryBad;

  return (
    <div style={styles.detailModal}>
      <div style={styles.detailHeader}>
        <div>
          <h2 style={styles.detailName}>{med.name}</h2>
          <div style={styles.detailCategory}>{med.category}</div>
        </div>
        <button type="button" style={styles.detailClose} onClick={onClose} aria-label="Close">×</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <MedIllustration med={med} width={96} height={120} />
      </div>

      <div style={styles.detailGrid}>
        <DetailField label="Invoice no." value={med.invoiceNo} />
        <DetailField label="Batch" value={med.batch} />
        <DetailField label="Pack price" value={`₹${med.packPrice.toFixed(2)}`} />
        <DetailField label="MRP" value={`₹${med.packMrp.toFixed(2)}`} />
        <DetailField label="Units per pack" value={String(med.unitsPerPack)} />
        <DetailField label="Unit price" value={`₹${med.unitPrice.toFixed(2)}`} />
        <DetailField label="In stock" value={String(med.unitsInStock)} />
        <DetailField
          label="Expiry"
          value={
            <span style={{ ...styles.expiryChip, ...expiryStyle }}>{formatExpiry(med.expiry)}</span>
          }
        />
        <DetailField label="Discount" value={`${med.discountPct.toFixed(2)}%`} />
        <DetailField label="GST" value={`${med.gstPct.toFixed(2)}%`} />
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={styles.detailLabel}>{label}</div>
      <div style={styles.detailValue}>{value}</div>
    </div>
  );
}
