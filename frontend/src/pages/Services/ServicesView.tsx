import React, { useEffect, useMemo, useState } from "react";
import { styles } from "./ServicesView.styles";
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

  const handleDelete = async (s: Service) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
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
        <table style={styles.table}>
          <colgroup>
            <col style={{ width: "120px" }} />
            <col style={{ width: "auto" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "96px" }} />
          </colgroup>
          <thead>
            <tr>
              <th style={styles.th}>Short Form</th>
              <th style={styles.th}>Name</th>
              <th style={{ ...styles.th, ...styles.thRight }}>Price</th>
              <th style={{ ...styles.th, ...styles.thRight }}>Duration</th>
              <th style={{ ...styles.th, ...styles.thRight }}>Discount</th>
              <th style={{ ...styles.th, ...styles.thRight }}>GST</th>
              <th style={{ ...styles.th, ...styles.thRight }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.empty}>
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
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td style={styles.td}><span style={styles.codeBadge}>{s.code}</span></td>
                  <td style={{ ...styles.td, ...styles.tdName }}>{s.name}</td>
                  <td style={{ ...styles.td, ...styles.tdRight }}>{formatPrice(s.price)}</td>
                  <td style={{ ...styles.td, ...styles.tdRight, ...styles.tdMuted }}>{formatDuration(s.duration)}</td>
                  <td style={{ ...styles.td, ...styles.tdRight, ...styles.tdMuted }}>{formatDiscount(s)}</td>
                  <td style={{ ...styles.td, ...styles.tdRight, ...styles.tdMuted }}>{formatGst(s.gst)}</td>
                  <td style={{ ...styles.td, ...styles.tdRight }}>
                    <div style={styles.actions}>
                      <button style={styles.iconBtn} onClick={() => openEdit(s)} aria-label="Edit">
                        <EditPencilIcon width={16} height={16} />
                      </button>
                      <button style={{ ...styles.iconBtn, ...styles.iconBtnDanger }} onClick={() => handleDelete(s)} aria-label="Delete">
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      <AddServiceModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
