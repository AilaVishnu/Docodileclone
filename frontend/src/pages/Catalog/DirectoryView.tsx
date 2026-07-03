import React, { useState, CSSProperties } from "react";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
import { Modal } from "../../components/Modal";
import { ModalHeader } from "../../components/ModalHeader";
import { ContactCard } from "../../components/Catalog/ContactCard";
import { colors, fonts, spacing, radii } from "../../styles/theme";
import { styles as form } from "../Services/AddServiceModal.styles";
import { DIRECTORY, Category, DirEntry } from "./catalogData";

type DirCategory = Exclude<Category, "Services">;

const ADD_LABEL: Record<DirCategory, string> = {
  "Referral doctors": "Add referral doctor",
  Labs: "Add lab",
  Suppliers: "Add supplier",
  Contacts: "Add contact",
};
const CAT_ICON: Record<DirCategory, string> = {
  "Referral doctors": "stethoscope",
  Labs: "heart-pulse",
  Suppliers: "buildings",
  Contacts: "user",
};

/**
 * DirectoryView — one Catalog directory tab (referral doctors / labs /
 * suppliers / contacts). Search + a contextual "Add" on the toolbar, a grid of
 * ContactCards, and the detail / edit / add / refer modals (all built on the
 * shared Modal + ModalHeader, like Add Service).
 */
export function DirectoryView({ category }: { category: DirCategory }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<DirEntry | null>(null);
  const [refer, setRefer] = useState<DirEntry | null>(null);
  const [edit, setEdit] = useState<DirEntry | null>(null);
  const [adding, setAdding] = useState(false);

  const rows = DIRECTORY[category].filter((e) => {
    const t = q.trim().toLowerCase();
    return !t || e.name.toLowerCase().includes(t) || e.subtitle.toLowerCase().includes(t);
  });

  const blank: DirEntry = { id: "new", name: "", subtitle: "", icon: <Icon name={CAT_ICON[category]} tone="inherit" size={22} />, phone: "", email: "", address: "", tags: [] };

  return (
    <div style={styles.content}>
      <div style={styles.toolbar}>
        <div style={{ width: 320, maxWidth: "100%" }}>
          <Field variant="pill" fill="outline" type="search" value={q} onChange={setQ} placeholder={`Search ${category.toLowerCase()}`} iconLeft={<Icon name="search" tone="muted" />} ariaLabel={`Search ${category}`} />
        </div>
        <Button variant="dark" size="md" iconLeft={<Icon name="plus" tone="inherit" size={16} />} onClick={() => setAdding(true)}>
          {ADD_LABEL[category]}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div style={styles.empty}>
          {q.trim()
            ? `No ${category.toLowerCase()} match “${q}”.`
            : `No ${category.toLowerCase()} yet — add one with “${ADD_LABEL[category]}”.`}
        </div>
      ) : (
        <div style={styles.grid}>
          {rows.map((e) => (
            <ContactCard key={e.id} entry={e} onOpen={setOpen} onEdit={setEdit} />
          ))}
        </div>
      )}

      {open && <ContactDetail entry={open} onClose={() => setOpen(null)} onRefer={(e) => { setOpen(null); setRefer(e); }} onEdit={(e) => { setOpen(null); setEdit(e); }} />}
      {refer && <ReferOut entry={refer} onClose={() => setRefer(null)} />}
      {edit && <ContactEdit entry={edit} title="Edit contact" onClose={() => setEdit(null)} />}
      {adding && <ContactEdit entry={blank} title={ADD_LABEL[category]} onClose={() => setAdding(false)} />}
    </div>
  );
}

// ── Contact detail ──────────────────────────────────────────────────────────
function ContactDetail({ entry, onClose, onRefer, onEdit }: { entry: DirEntry; onClose: () => void; onRefer: (e: DirEntry) => void; onEdit: (e: DirEntry) => void }) {
  return (
    <Modal isOpen onClose={onClose} surface={colors.neutral100} width={480}>
      <div style={form.cardBody}>
        <ModalHeader title={entry.name} subtitle={entry.subtitle} onClose={onClose} />

        <div style={{ display: "flex", gap: spacing["2xs"] }}>
          {entry.phone && <QuickIcon icon="phone" label="Call" />}
          {entry.whatsapp && <QuickIcon icon="chat-square-call" label="WhatsApp" />}
          {entry.email && <QuickIcon icon="envelope" label="Email" />}
          {entry.address && <QuickIcon icon="map-point" label="Directions" />}
          <QuickIcon icon="share" label="Share card" />
        </div>

        {entry.details && (
          <Section title="Details">
            {entry.details.map((d) => <Row key={d.label} k={d.label} v={d.value} />)}
            {entry.phone && <Row k="Phone" v={entry.phone} />}
            {entry.email && <Row k="Email" v={entry.email} />}
            {entry.address && <Row k="Address" v={entry.address} />}
          </Section>
        )}
        {entry.offers && (
          <Section title={entry.offersLabel ?? "Offered"}>
            {entry.offers.map((o) => (
              <div key={o.name} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: `1px solid ${colors.neutral150}`, fontSize: fonts.size.s }}>
                <span style={{ color: colors.neutral800 }}>{o.name}</span>
                <span style={{ color: colors.neutral900, fontWeight: fonts.weight.medium }}>{o.meta}</span>
              </div>
            ))}
          </Section>
        )}
        {entry.activity && (
          <Section title="Activity">
            {entry.activity.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0", fontSize: fonts.size.xs, color: colors.neutral600 }}>
                <Icon name="status-dot" tone="inherit" size={14} /> <span>{a}</span>
              </div>
            ))}
          </Section>
        )}

        <div style={{ ...form.footer, justifyContent: "space-between" }}>
          <Button variant="light" size="sm" iconLeft={<Icon name="edit-pencil" tone="inherit" size={16} />} onClick={() => onEdit(entry)}>Edit</Button>
          <div style={{ display: "flex", gap: spacing.s }}>
            <Button variant="light" size="sm" onClick={onClose}>Close</Button>
            {entry.cta && <Button variant="primary" size="sm" onClick={() => (entry.cta === "Refer" ? onRefer(entry) : onClose())}>{entry.cta}</Button>}
          </div>
        </div>
      </div>
    </Modal>
  );
}
function QuickIcon({ icon, label }: { icon: string; label: string }) {
  return <IconButton ariaLabel={label} title={label} size={36}><Icon name={icon} tone="inherit" size={19} /></IconButton>;
}

// ── Add / Edit (mirrors AddServiceModal) ────────────────────────────────────
function ContactEdit({ entry, title, onClose }: { entry: DirEntry; title: string; onClose: () => void }) {
  const isEdit = title.startsWith("Edit");
  const [name, setName] = useState(entry.name);
  const [subtitle, setSubtitle] = useState(entry.subtitle);
  const [phone, setPhone] = useState(entry.phone ?? "");
  const [email, setEmail] = useState(entry.email ?? "");
  const [address, setAddress] = useState(entry.address ?? "");
  const [tags, setTags] = useState((entry.tags ?? []).join(", "));
  return (
    <Modal isOpen onClose={onClose} surface={colors.neutral100} width={440}>
      <div style={form.cardBody}>
        <ModalHeader title={title} onClose={onClose} />
        <div style={form.form}>
          <div style={form.field}>
            <label style={form.label}>Name<span style={form.required}>*</span></label>
            <Field variant="box" value={name} onChange={setName} placeholder="e.g. Dr. Anjali Menon" autoFocus ariaLabel="Name" />
          </div>
          <div style={form.field}>
            <label style={form.label}>Title / type</label>
            <Field variant="box" value={subtitle} onChange={setSubtitle} placeholder="e.g. Dermatosurgery · Apollo" ariaLabel="Title" />
          </div>
          <div style={form.row}>
            <div style={form.field}>
              <label style={form.label}>Phone</label>
              <Field variant="box" type="tel" value={phone} onChange={setPhone} placeholder="+91 …" ariaLabel="Phone" />
            </div>
            <div style={form.field}>
              <label style={form.label}>Email</label>
              <Field variant="box" type="email" value={email} onChange={setEmail} placeholder="name@clinic.in" ariaLabel="Email" />
            </div>
          </div>
          <div style={form.field}>
            <label style={form.label}>Address</label>
            <Field variant="box" value={address} onChange={setAddress} placeholder="Area, city" ariaLabel="Address" />
          </div>
          <div style={form.field}>
            <label style={form.label}>Tags</label>
            <Field variant="box" value={tags} onChange={setTags} placeholder="Comma-separated" ariaLabel="Tags" />
          </div>
        </div>
        <div style={form.footer}>
          <Button variant="light" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={onClose}>{isEdit ? "Save changes" : title}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Refer a patient ─────────────────────────────────────────────────────────
function ReferOut({ entry, onClose }: { entry: DirEntry; onClose: () => void }) {
  const [note, setNote] = useState("Suspected basal cell carcinoma on the left nasal ala — requesting excision + margins.");
  return (
    <Modal isOpen onClose={onClose} surface={colors.neutral100} width={480}>
      <div style={form.cardBody}>
        <ModalHeader title="Refer a patient" onClose={onClose} />
        <div style={form.form}>
          <div style={form.field}>
            <label style={form.label}>To</label>
            <ChipRow icon={entry.icon} title={entry.name} sub={entry.subtitle} />
          </div>
          <div style={form.field}>
            <label style={form.label}>Patient</label>
            <ChipRow icon={<Icon name="user" tone="inherit" size={18} />} title="Aarav Sharma" sub="T001 · 32y · Male" />
          </div>
          <div style={form.field}>
            <label style={form.label}>Reason / clinical note</label>
            <Field variant="box" multiline value={note} onChange={setNote} ariaLabel="Reason" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: fonts.size.s, color: colors.neutral700 }}>
            <Icon name="check-circle" tone="inherit" size={18} /> Attach last prescription — Acne protocol (12 Jun)
          </div>
          <div style={{ background: colors.primary100, borderRadius: radii.l, padding: 14, fontSize: fonts.size.xs, color: colors.neutral600, lineHeight: 1.5 }}>
            <strong style={{ color: colors.neutral900, fontFamily: fonts.family.secondary }}>Preview</strong><br />
            “Dear {entry.name}, kindly see Aarav Sharma (32/M). {note} Regards, Dr. Anita Rao, Skylar Dermatology.”
          </div>
        </div>
        <div style={form.footer}>
          <Button variant="light" size="sm" iconLeft={<Icon name="printer" tone="inherit" size={16} />}>Print</Button>
          <Button variant="primary" size="sm" iconLeft={<Icon name="chat-square-call" tone="inherit" size={16} />} onClick={onClose}>Send on WhatsApp</Button>
        </div>
      </div>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold, color: colors.neutral500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", fontSize: fonts.size.s }}>
      <span style={{ color: colors.neutral500 }}>{k}</span>
      <span style={{ color: colors.neutral900, textAlign: "right" }}>{v}</span>
    </div>
  );
}
function ChipRow({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: colors.primary100, borderRadius: radii.l, padding: "8px 12px" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: colors.primary200, color: colors.primary700, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div><div style={{ fontSize: fonts.size.s, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>{title}</div><div style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>{sub}</div></div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  content: { display: "flex", flexDirection: "column", gap: spacing.l },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.m },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: spacing.m },
  empty: { padding: `${spacing["3xl"]} ${spacing.l}`, textAlign: "center", color: colors.neutral500, fontSize: fonts.size.s },
};
