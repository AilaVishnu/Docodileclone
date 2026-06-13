import React, { useEffect, useMemo, useState } from "react";
import { styles } from "./ServicesView.styles";
import { DataGrid } from "../../components/DataGrid/DataGrid";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Service } from "./types";
import { AddServiceModal } from "./AddServiceModal";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { PlusIcon } from "../../iconsUtil";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { ReactComponent as EditPencilIcon } from "../../assets/icons/edit-pencil.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash.svg";
import {
  listServices,
  createService,
  updateService,
  deleteService,
  ServiceDTO,
} from "../../api/services";

const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const formatDuration = (m: number) => (m > 0 ? `${m} min` : "—");
const formatDiscount = (s: Service) => {
  if (!s.discount) return "—";
  return s.discountMode === "%" ? `${s.discount}%` : `₹${s.discount.toLocaleString("en-IN")}`;
};
const formatGst = (n: number) => (n > 0 ? `${n}%` : "—");

// Backend stores duration as `durationMin`; the UI Service shape uses
// `duration`. Map both ways here so the rest of the view (and the modal)
// can keep using the friendlier name.
const fromDto = (d: ServiceDTO): Service => ({
  id: d.id,
  name: d.name,
  code: d.code,
  price: Number(d.price),
  duration: d.durationMin,
  discount: Number(d.discount),
  discountMode: d.discountMode,
  gst: Number(d.gst),
});

const toRequest = (s: Omit<Service, "id">) => ({
  name: s.name,
  code: s.code,
  price: s.price,
  durationMin: s.duration,
  discount: s.discount,
  discountMode: s.discountMode,
  gst: s.gst,
});

export function ServicesView() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listServices();
        if (!cancelled) setServices(data.map(fromDto));
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [services, search]);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (s: Service) => { setEditing(s); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data: Omit<Service, "id">) => {
    // Let errors propagate so the modal can show them inline. The modal also
    // tracks its own saving state, so we don't close on failure.
    if (editing) {
      const updated = await updateService(editing.id, toRequest(data));
      setServices((prev) => prev.map((s) => (s.id === editing.id ? fromDto(updated) : s)));
    } else {
      const created = await createService(toRequest(data));
      setServices((prev) => [...prev, fromDto(created)]);
    }
    closeModal();
  };

  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);
  const handleDelete = (s: Service) => setPendingDelete(s);
  const confirmDelete = async () => {
    const s = pendingDelete;
    setPendingDelete(null);
    if (!s) return;
    try {
      await deleteService(s.id);
      setServices((prev) => prev.filter((x) => x.id !== s.id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div style={styles.page}>
      <PageHeader title="Catalog" />

      <div style={styles.content}>
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <SearchIcon style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Search by name or short form"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" style={styles.clearBtn} onClick={() => setSearch("")} aria-label="Clear search">×</button>
          )}
        </div>
        <Button variant="dark" size="md" iconLeft={<PlusIcon style={{ width: 16, height: 16 }} />} onClick={openAdd}>
          Add Service
        </Button>
      </div>

      <div style={styles.tableContainer}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyTitle}>
              {loading ? "Loading…" : error ? "Couldn't load services" : services.length === 0 ? "No services yet" : "No matches"}
            </div>
            <div>
              {loading
                ? "Fetching your clinic's services."
                : error
                ? error
                : services.length === 0
                ? "Add the services your clinic offers — consultation, procedures, packages."
                : `Nothing matches "${search}". Try a different term.`}
            </div>
          </div>
        ) : (
          <DataGrid
            rows={filtered}
            rowKey={(s) => s.id}
            columns={[
              { key: "code", header: "Short Form", width: 120, align: "center", render: (s) => <span style={styles.codeBadge}>{s.code}</span> },
              { key: "name", header: "Name", align: "left", render: (s) => s.name },
              { key: "price", header: "Price", align: "center", render: (s) => formatPrice(s.price) },
              { key: "duration", header: "Duration", align: "center", render: (s) => formatDuration(s.duration) },
              { key: "discount", header: "Discount", align: "center", render: (s) => formatDiscount(s) },
              { key: "gst", header: "GST", align: "center", render: (s) => formatGst(s.gst) },
              {
                key: "actions", header: "", width: 96, align: "center",
                render: (s) => (
                  <div style={styles.actions}>
                    <button style={styles.iconBtn} onClick={() => openEdit(s)} aria-label="Edit">
                      <EditPencilIcon width={24} height={24} />
                    </button>
                    <button style={styles.iconBtn} onClick={() => handleDelete(s)} aria-label="Delete">
                      <TrashIcon width={24} height={24} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
      </div>

      <AddServiceModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initial={editing}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Are you sure?"
        message={pendingDelete ? `"${pendingDelete.name}" will be removed from your services catalog.` : undefined}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
