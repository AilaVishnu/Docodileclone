import React, { useEffect, useMemo, useState } from "react";
import { styles } from "./Pharmacy.styles";
import { PharmacyListView } from "./PharmacyListView";
import { PharmacyShelfView } from "./PharmacyShelfView";
import { Med, GroupBy, MedCategory, MedForm } from "./types";
import { formatExpiry, expiryStatus } from "./expiry";
import { MedIllustration } from "./MedIllustration";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { colors, fonts, spacing, radii } from "../../styles/theme";
import { PlusIcon } from "../../iconsUtil";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { ReactComponent as ListSortIcon } from "../../assets/icons/list-sort.svg";
import { ReactComponent as WidgetIcon } from "../../assets/icons/widget.svg";
import { listPharmacyStock, bulkCreatePharmacyStock, parseInventoryCsv, createPharmacyStock, updatePharmacyStock, deletePharmacyStock, medToRequest } from "../../api/pharmacy";
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
  // editing === null + addOpen === true → Add Stock mode
  // editing === <med>                    → Edit Batch mode
  const [editing, setEditing] = useState<Med | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  // Quantity-adjust + delete confirmation. Native window.prompt/.confirm
  // look out of place against the rest of the UI, so each one opens a
  // styled modal instead.
  const [adjustingQty, setAdjustingQty] = useState<Med | null>(null);
  const [deleting, setDeleting] = useState<Med | null>(null);

  const refresh = () => {
    setLoading(true);
    listPharmacyStock()
      .then(setInventory)
      .catch((e) => setToastMsg(`Couldn't load inventory: ${(e as Error).message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  // ── Action handlers ─────────────────────────────────────────────────────
  const handleConfirmDelete = async (m: Med) => {
    try {
      await deletePharmacyStock(m.id);
      setInventory((cur) => cur.filter((x) => x.id !== m.id));
      setToastMsg(`Removed ${m.name}`);
      setDeleting(null);
    } catch (e) {
      setToastMsg(`Couldn't delete: ${(e as Error).message}`);
    }
  };

  const handleSaveQty = async (m: Med, next: number) => {
    try {
      const updated = await updatePharmacyStock(m.id, { ...medToRequest(m), unitsInStock: next });
      setInventory((cur) => cur.map((x) => (x.id === m.id ? updated : x)));
      setToastMsg(`${m.name}: stock set to ${next}`);
      setAdjustingQty(null);
    } catch (e) {
      setToastMsg(`Couldn't update: ${(e as Error).message}`);
    }
  };

  const handleSaveStockForm = async (data: Omit<Med, "id">, isEdit: boolean) => {
    try {
      if (isEdit && editing) {
        const updated = await updatePharmacyStock(editing.id, medToRequest(data));
        setInventory((cur) => cur.map((x) => (x.id === editing.id ? updated : x)));
        setToastMsg(`Saved ${updated.name}`);
        setEditing(null);
      } else {
        const created = await createPharmacyStock(medToRequest(data));
        setInventory((cur) => [...cur, created]);
        setToastMsg(`Added ${created.name}`);
        setAddOpen(false);
      }
    } catch (e) {
      setToastMsg(`Couldn't save: ${(e as Error).message}`);
    }
  };

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
            onClick={() => { setEditing(null); setAddOpen(true); }}
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
          <PharmacyListView
            items={items}
            groupBy={groupBy}
            onPick={setSelected}
            onEdit={(m) => { setEditing(m); setAddOpen(false); }}
            onAdjustQty={(m) => setAdjustingQty(m)}
            onDelete={(m) => setDeleting(m)}
          />
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

      <Modal
        isOpen={addOpen || editing !== null}
        onClose={() => { setAddOpen(false); setEditing(null); }}
      >
        <StockFormBody
          initial={editing}
          onClose={() => { setAddOpen(false); setEditing(null); }}
          onSave={(data) => handleSaveStockForm(data, editing !== null)}
        />
      </Modal>

      <Modal isOpen={adjustingQty !== null} onClose={() => setAdjustingQty(null)}>
        {adjustingQty && (
          <AdjustQtyBody
            med={adjustingQty}
            onClose={() => setAdjustingQty(null)}
            onSave={(qty) => handleSaveQty(adjustingQty, qty)}
          />
        )}
      </Modal>

      <Modal isOpen={deleting !== null} onClose={() => setDeleting(null)}>
        {deleting && (
          <DeleteConfirmBody
            med={deleting}
            onCancel={() => setDeleting(null)}
            onConfirm={() => handleConfirmDelete(deleting)}
          />
        )}
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
    <div style={ms.container}>
      <ModalHeader
        title={med.name}
        subtitle={`${med.category} · ${med.form}${med.batch ? ` · Batch ${med.batch}` : ""}`}
        onClose={onClose}
      />

      <div style={ms.illustrationWrap}>
        <MedIllustration med={med} width={96} height={120} />
      </div>

      <div style={ms.formCard}>
        <div style={ms.twoCol}>
          <DetailField label="Invoice no." value={med.invoiceNo || "—"} />
          <DetailField label="Batch" value={med.batch || "—"} />
          <DetailField label="Pack price" value={`₹${med.packPrice.toFixed(2)}`} />
          <DetailField label="MRP" value={`₹${med.packMrp.toFixed(2)}`} />
          <DetailField label="Units per pack" value={String(med.unitsPerPack)} />
          <DetailField label="Unit price" value={`₹${med.unitPrice.toFixed(2)}`} />
          <DetailField label="In stock" value={String(med.unitsInStock)} />
          <DetailField
            label="Expiry"
            value={<span style={{ ...styles.expiryChip, ...expiryStyle }}>{formatExpiry(med.expiry)}</span>}
          />
          <DetailField label="Discount" value={`${med.discountPct.toFixed(2)}%`} />
          <DetailField label="GST" value={`${med.gstPct.toFixed(2)}%`} />
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={ms.fieldWrap}>
      <span style={ms.fieldLabel}>{label}</span>
      <span style={ms.detailValue}>{value}</span>
    </div>
  );
}

// Shared modal chrome — mirrors EditPatientModal so all popups across the
// app share the same look (serif title + subtitle + × close, optional cream
// identity strip, white form card with neutral150 inputs, ghost cancel +
// orange primary save).
const ms: Record<string, React.CSSProperties> = {
  container: {
    display: "flex", flexDirection: "column", gap: spacing.s,
    width: 480, maxWidth: "100%",
  },
  containerNarrow: {
    display: "flex", flexDirection: "column", gap: spacing.s,
    width: 380, maxWidth: "100%",
  },
  header: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    gap: spacing.m,
  },
  title: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6, lineHeight: fonts.lineHeight.h6,
    fontWeight: fonts.weight.regular, color: colors.neutral900,
  },
  subtitle: {
    margin: 0, marginTop: 4,
    fontFamily: fonts.family.primary, fontSize: fonts.control.sm,
    color: colors.neutral600,
  },
  identityStrip: {
    display: "flex", alignItems: "center", gap: spacing.m,
    backgroundColor: colors.primary100, borderRadius: radii.xl,
    padding: `${spacing.s} ${spacing.m}`,
  },
  identityText: {
    display: "flex", flexDirection: "column", gap: 6, minWidth: 0,
  },
  identityName: {
    margin: 0,
    fontFamily: fonts.family.secondary,
    fontSize: fonts.size.h6, lineHeight: fonts.lineHeight.h6,
    fontWeight: fonts.weight.regular, color: colors.neutral900,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  identityMeta: {
    display: "flex", alignItems: "center", gap: spacing.xs, flexWrap: "wrap",
  },
  metaChip: {
    fontFamily: fonts.family.primary, fontSize: fonts.control.xs,
    color: colors.neutral700, backgroundColor: colors.primary200,
    borderRadius: radii.full, padding: "2px 10px",
  },
  formCard: {
    display: "flex", flexDirection: "column", gap: spacing.s,
    backgroundColor: colors.neutral100, borderRadius: radii.xl,
    border: `1px solid ${colors.neutral200}`, padding: spacing.m,
  },
  twoCol: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m,
  },
  fieldWrap: {
    display: "flex", flexDirection: "column", gap: 4,
  },
  fieldLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs, lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500, fontWeight: fonts.weight.regular,
  },
  fieldError: {
    fontFamily: fonts.family.primary, fontSize: fonts.control.xs,
    color: colors.red100, marginTop: 2,
  },
  detailValue: {
    fontFamily: fonts.family.primary, fontSize: fonts.control.md,
    fontWeight: fonts.weight.semibold, color: colors.neutral900,
  },
  illustrationWrap: {
    display: "flex", justifyContent: "center",
    padding: `${spacing.s} 0`,
  },
  textInput: {
    width: "100%", height: 35, boxSizing: "border-box",
    padding: `0 ${spacing.s}`,
    border: `1px solid ${colors.neutral300}`, borderRadius: radii.m,
    backgroundColor: colors.neutral150,
    fontFamily: fonts.family.primary, fontSize: fonts.control.sm,
    color: colors.neutral900, outline: "none",
  },
  selectInput: {
    width: "100%", height: 35, boxSizing: "border-box",
    padding: `0 ${spacing.s}`,
    border: `1px solid ${colors.neutral300}`, borderRadius: radii.m,
    backgroundColor: colors.neutral150,
    fontFamily: fonts.family.primary, fontSize: fonts.control.sm,
    color: colors.neutral900, outline: "none", appearance: "auto",
  },
  footer: {
    display: "flex", justifyContent: "flex-end", gap: spacing.s,
    paddingTop: spacing.s, borderTop: `1px solid ${colors.neutral200}`,
  },
  btnDanger: {
    fontFamily: fonts.family.primary, fontSize: fonts.control.md,
    color: colors.neutral100, backgroundColor: colors.red200,
    border: "none", borderRadius: radii.full,
    padding: "10px 20px", cursor: "pointer",
  },
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={ms.fieldWrap}>
      <label style={ms.fieldLabel}>{label}</label>
      {children}
      {error && <span style={ms.fieldError}>{error}</span>}
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <header style={ms.header}>
      <div>
        <h2 style={ms.title}>{title}</h2>
        {subtitle && <p style={ms.subtitle}>{subtitle}</p>}
      </div>
      <IconButton ariaLabel="Close" onClick={onClose} />
    </header>
  );
}

function MedIdentityStrip({ med }: { med: Med }) {
  return (
    <div style={ms.identityStrip}>
      <div style={ms.identityText}>
        <p style={ms.identityName}>{med.name}</p>
        <div style={ms.identityMeta}>
          <span style={ms.metaChip}>{med.category}</span>
          <span style={ms.metaChip}>{med.form}</span>
          {med.batch && <span style={ms.metaChip}>Batch {med.batch}</span>}
        </div>
      </div>
    </div>
  );
}

// Stock form — used by both Add Stock and Edit batch. Mirrors the
// EditPatientModal layout: serif header + cream identity strip (edit only)
// + white form card + ghost/orange footer.
function StockFormBody({
  initial,
  onClose,
  onSave,
}: {
  initial: Med | null;
  onClose: () => void;
  onSave: (data: Omit<Med, "id">) => Promise<void> | void;
}) {
  const CATEGORY_OPTIONS: MedCategory[] = ["Acne & skin", "Cleansers & soaps", "Topicals", "Tablets", "Serums & boosters"];
  const FORM_OPTIONS: MedForm[] = ["tablet", "syrup", "cream", "spray", "soap", "serum", "drops", "ointment"];

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<MedCategory>(initial?.category ?? "Tablets");
  const [form, setForm] = useState<MedForm>(initial?.form ?? "tablet");
  const [invoiceNo, setInvoiceNo] = useState(initial?.invoiceNo ?? "");
  const [batch, setBatch] = useState(initial?.batch ?? "");
  const [packPrice, setPackPrice] = useState(String(initial?.packPrice ?? ""));
  const [packMrp, setPackMrp] = useState(String(initial?.packMrp ?? ""));
  const [unitsPerPack, setUnitsPerPack] = useState(String(initial?.unitsPerPack ?? 1));
  const [unitPrice, setUnitPrice] = useState(String(initial?.unitPrice ?? ""));
  const [unitsInStock, setUnitsInStock] = useState(String(initial?.unitsInStock ?? 0));
  const [expiry, setExpiry] = useState(initial?.expiry ?? "");
  const [discountPct, setDiscountPct] = useState(String(initial?.discountPct ?? 0));
  const [gstPct, setGstPct] = useState(String(initial?.gstPct ?? 0));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const nameError = !name.trim();

  const handleSubmit = async () => {
    setTouched(true);
    if (nameError) { setErr("Name is required"); return; }
    setErr(null);
    setSaving(true);
    try {
      await onSave({
        name: name.trim(), category, form,
        invoiceNo: invoiceNo.trim(), batch: batch.trim(),
        packPrice: Number(packPrice) || 0,
        packMrp: Number(packMrp) || 0,
        unitsPerPack: parseInt(unitsPerPack, 10) || 1,
        unitPrice: Number(unitPrice) || 0,
        unitsInStock: parseInt(unitsInStock, 10) || 0,
        expiry: expiry.trim(),
        discountPct: Number(discountPct) || 0,
        gstPct: Number(gstPct) || 0,
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = initial !== null;

  return (
    <div style={ms.container}>
      <ModalHeader
        title={isEdit ? "Edit batch" : "Add stock"}
        subtitle={isEdit ? "Update inventory details for this batch" : "Add a new medicine batch to this clinic's inventory"}
        onClose={onClose}
      />

      {isEdit && initial && <MedIdentityStrip med={initial} />}

      <div style={ms.formCard}>
        <Field label="Medicine name *" error={touched && nameError ? "Name is required" : undefined}>
          <input
            type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paracetamol 500mg"
            style={ms.textInput}
          />
        </Field>

        <div style={ms.twoCol}>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MedCategory)}
              style={ms.selectInput}
            >
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Form">
            <select
              value={form}
              onChange={(e) => setForm(e.target.value as MedForm)}
              style={ms.selectInput}
            >
              {FORM_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
        </div>

        <div style={ms.twoCol}>
          <Field label="Invoice no.">
            <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="e.g. A00709" style={ms.textInput} />
          </Field>
          <Field label="Batch">
            <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. 204" style={ms.textInput} />
          </Field>
        </div>

        <div style={ms.twoCol}>
          <Field label="Pack price ₹">
            <input type="text" value={packPrice} onChange={(e) => setPackPrice(e.target.value)} placeholder="0.00" style={ms.textInput} />
          </Field>
          <Field label="Pack MRP ₹">
            <input type="text" value={packMrp} onChange={(e) => setPackMrp(e.target.value)} placeholder="0.00" style={ms.textInput} />
          </Field>
        </div>

        <div style={ms.twoCol}>
          <Field label="Units per pack">
            <input type="text" value={unitsPerPack} onChange={(e) => setUnitsPerPack(e.target.value)} placeholder="1" style={ms.textInput} />
          </Field>
          <Field label="Unit price ₹">
            <input type="text" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0.00" style={ms.textInput} />
          </Field>
        </div>

        <div style={ms.twoCol}>
          <Field label="Units in stock">
            <input type="text" value={unitsInStock} onChange={(e) => setUnitsInStock(e.target.value)} placeholder="0" style={ms.textInput} />
          </Field>
          <Field label="Expiry (YYYY-MM)">
            <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="2027-03" style={ms.textInput} />
          </Field>
        </div>

        <div style={ms.twoCol}>
          <Field label="Discount %">
            <input type="text" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} placeholder="0" style={ms.textInput} />
          </Field>
          <Field label="GST %">
            <input type="text" value={gstPct} onChange={(e) => setGstPct(e.target.value)} placeholder="0" style={ms.textInput} />
          </Field>
        </div>

        {err && !nameError && <span style={ms.fieldError}>{err}</span>}
      </div>

      <footer style={ms.footer}>
        <Button variant="light" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add stock"}
        </Button>
      </footer>
    </div>
  );
}

// Adjust units-in-stock — single field, but same modal chrome (header,
// identity strip, white card, ghost/primary footer) as Edit batch.
function AdjustQtyBody({
  med,
  onClose,
  onSave,
}: {
  med: Med;
  onClose: () => void;
  onSave: (qty: number) => Promise<void> | void;
}) {
  const [value, setValue] = useState(String(med.unitsInStock));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    const next = parseInt(value.trim(), 10);
    if (!Number.isFinite(next) || next < 0) {
      setErr("Enter a non-negative whole number.");
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      await onSave(next);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={ms.containerNarrow}>
      <ModalHeader
        title="Adjust stock"
        subtitle={`Currently ${med.unitsInStock} units in stock`}
        onClose={onClose}
      />

      <MedIdentityStrip med={med} />

      <div style={ms.formCard}>
        <Field label="New units in stock" error={err ?? undefined}>
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            autoFocus
            style={ms.textInput}
          />
        </Field>
      </div>

      <footer style={ms.footer}>
        <Button variant="light" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={submit} disabled={saving}>
          {saving ? "Saving…" : "Update"}
        </Button>
      </footer>
    </div>
  );
}

// Delete confirmation — styled replacement for window.confirm. Same modal
// chrome as the other two; primary button is red since it's destructive.
function DeleteConfirmBody({
  med,
  onCancel,
  onConfirm,
}: {
  med: Med;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  };
  return (
    <div style={ms.containerNarrow}>
      <ModalHeader
        title="Remove from inventory?"
        subtitle="This batch will be deleted from this clinic. This can't be undone."
        onClose={onCancel}
      />

      <MedIdentityStrip med={med} />

      <footer style={ms.footer}>
        <Button variant="light" size="sm" onClick={onCancel} disabled={busy}>Cancel</Button>
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          style={{ ...ms.btnDanger, ...(busy ? { opacity: 0.45, cursor: "not-allowed" } : null) }}
        >
          {busy ? "Removing…" : "Remove"}
        </button>
      </footer>
    </div>
  );
}
