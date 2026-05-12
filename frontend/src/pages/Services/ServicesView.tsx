import React, { useMemo, useState } from "react";
import { styles } from "./ServicesView.styles";
import { Service } from "./types";
import { AddServiceModal } from "./AddServiceModal";
import { Button } from "../../components/Button";
import { PlusIcon } from "../../iconsUtil";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";
import { ReactComponent as EditPencilIcon } from "../../assets/icons/edit-pencil.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash.svg";

const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const formatDuration = (m: number) => (m > 0 ? `${m} min` : "—");
const formatDiscount = (s: Service) => {
  if (!s.discount) return "—";
  return s.discountMode === "%" ? `${s.discount}%` : `₹${s.discount.toLocaleString("en-IN")}`;
};
const formatGst = (n: number) => (n > 0 ? `${n}%` : "—");

const SEED: Service[] = [
  { id: "s1", name: "General Consultation", code: "GC", price: 500, duration: 15, discount: 0, discountMode: "%", gst: 0 },
  { id: "s2", name: "Follow-up Visit", code: "FV", price: 300, duration: 10, discount: 10, discountMode: "%", gst: 0 },
  { id: "s3", name: "Dental Cleaning", code: "DC", price: 1500, duration: 45, discount: 0, discountMode: "%", gst: 18 },
];

const newId = () => `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

export function ServicesView() {
  const [services, setServices] = useState<Service[]>(SEED);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

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

  const handleSave = (data: Omit<Service, "id">) => {
    if (editing) {
      setServices((prev) => prev.map((s) => (s.id === editing.id ? { ...data, id: editing.id } : s)));
    } else {
      setServices((prev) => [...prev, { ...data, id: newId() }]);
    }
    closeModal();
  };

  const handleDelete = (s: Service) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    setServices((prev) => prev.filter((x) => x.id !== s.id));
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Services</h1>
      </header>

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
                    {services.length === 0 ? "No services yet" : "No matches"}
                  </div>
                  <div>
                    {services.length === 0
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

      <AddServiceModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
