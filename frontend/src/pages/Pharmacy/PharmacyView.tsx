import React, { useEffect, useMemo, useState } from "react";
import { styles } from "./Pharmacy.styles";
import { PharmacyListView } from "./PharmacyListView";
import { PharmacyShelfView } from "./PharmacyShelfView";
import { Med, GroupBy } from "./types";
import { formatExpiry, expiryStatus } from "./expiry";
import { MedIllustration } from "./MedIllustration";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../iconsUtil";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { ReactComponent as ListSortIcon } from "../../assets/icons/list-sort.svg";
import { ReactComponent as WidgetIcon } from "../../assets/icons/widget.svg";
import { listPharmacyStock, bulkCreatePharmacyStock, parseInventoryCsv } from "../../api/pharmacy";
import { Toast } from "../../components/Toast";

type ViewMode = "list" | "shelf";

export function PharmacyView() {
  const [view, setView] = useState<ViewMode>("shelf");
  const [groupBy, setGroupBy] = useState<GroupBy>("alpha");
  const [query, setQuery] = useState("");
  const [showZero, setShowZero] = useState(true);
  const [selected, setSelected] = useState<Med | null>(null);
  // Live inventory pulled from /api/tenant/pharmacy-stock. Empty until the
  // first fetch settles.
  const [inventory, setInventory] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const refresh = () => {
    setLoading(true);
    listPharmacyStock()
      .then(setInventory)
      .catch((e) => setToastMsg(`Couldn't load inventory: ${(e as Error).message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventory.filter((m) => {
      if (!showZero && m.unitsInStock === 0) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.batch.toLowerCase().includes(q) ||
        m.invoiceNo.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });
  }, [inventory, query, showZero]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerSpacer} />
        <h1 style={styles.title}>Pharmacy Stocks</h1>
        <div style={{ ...styles.headerActions, display: "flex", gap: 8 }}>
          <Button
            variant="light"
            size="md"
            onClick={() => setImportOpen(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="dark"
            size="md"
            iconLeft={<PlusIcon style={{ width: 16, height: 16 }} />}
          >
            Add Stock
          </Button>
        </div>
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
          <button
            type="button"
            style={{ ...styles.togglePill, ...(!showZero ? styles.togglePillActive : null) }}
            onClick={() => setShowZero((v) => !v)}
            aria-pressed={!showZero}
          >
            In stock only
          </button>
        </div>

        <div style={styles.toolbarRight}>
          <div style={styles.sortGroup} role="radiogroup" aria-label="Sort by">
            {[
              { value: "alpha" as const, label: "A–Z" },
              { value: "form" as const, label: "Form" },
              { value: "attention" as const, label: "Attention" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={groupBy === opt.value}
                style={{ ...styles.sortChip, ...(groupBy === opt.value ? styles.sortChipActive : null) }}
                onClick={() => setGroupBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
        </div>
      </div>

      {view === "list" ? (
        <div style={styles.listCard}>
          <PharmacyListView items={items} groupBy={groupBy} onPick={setSelected} />
        </div>
      ) : (
        <PharmacyShelfView items={items} groupBy={groupBy} onPick={setSelected} />
      )}

      <Modal isOpen={selected !== null} onClose={() => setSelected(null)}>
        {selected && <DetailBody med={selected} onClose={() => setSelected(null)} />}
      </Modal>

      <Modal isOpen={importOpen} onClose={() => setImportOpen(false)}>
        <ImportInventoryBody
          onClose={() => setImportOpen(false)}
          onImported={(msg) => {
            setImportOpen(false);
            setToastMsg(msg);
            refresh();
          }}
        />
      </Modal>

      <Toast message={toastMsg} isVisible={!!toastMsg} onClose={() => setToastMsg("")} />
      {loading && inventory.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: "#666" }}>Loading inventory…</div>
      )}
    </div>
  );
}

function ImportInventoryBody({ onClose, onImported }: {
  onClose: () => void;
  onImported: (message: string) => void;
}) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const preview = useMemo(() => parseInventoryCsv(text), [text]);

  const readFile = (file: File) => {
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      setError("Please pick a .csv file.");
      return;
    }
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => setError("Couldn't read the file.");
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (preview.rows.length === 0) {
      setError("No valid rows parsed.");
      return;
    }
    setImporting(true);
    setError(null);
    try {
      const result = await bulkCreatePharmacyStock(preview.rows);
      const parts: string[] = [];
      if (result.updated > 0) parts.push(`Updated ${result.updated}`);
      if (result.created > 0) parts.push(`added ${result.created}`);
      if (result.skipped > 0) parts.push(`skipped ${result.skipped}`);
      onImported(parts.length > 0 ? parts.join(" · ") : "Nothing to import");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ width: "min(640px, 92vw)", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Import inventory (CSV)</h2>
      <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
        Upload the supplier's <code style={{ fontSize: 12 }}>current_inventory_*.csv</code> file.
        Existing batches refresh in place (matched on name + batch + invoice), new batches are added.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFile(f);
          // Allow re-picking the same filename later.
          e.target.value = "";
        }}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) readFile(f);
        }}
        style={{
          border: `2px dashed ${dragOver ? "#2c6e49" : "#bbb"}`,
          borderRadius: 8,
          padding: 24,
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "#f1f8f3" : "#fafafa",
          fontSize: 13,
          color: "#555",
        }}
      >
        {fileName ? (
          <>
            <div style={{ fontWeight: 600, color: "#222" }}>{fileName}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {preview.rows.length} of {preview.rawLines} rows ready to import. Click to pick a different file.
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 600, color: "#222" }}>Click to choose a CSV file</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>…or drag & drop it here.</div>
          </>
        )}
      </div>

      {error && <span style={{ fontSize: 12, color: "#b54040" }}>{error}</span>}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Button variant="light" size="sm" onClick={onClose} disabled={importing}>Cancel</Button>
        <Button variant="dark" size="sm" onClick={handleImport} disabled={importing || preview.rows.length === 0}>
          {importing ? "Importing…" : preview.rows.length > 0 ? `Import ${preview.rows.length}` : "Import"}
        </Button>
      </div>
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
