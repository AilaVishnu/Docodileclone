import React from "react";
import { Modal } from "../../components/Modal/Modal";
import { ModalHeader } from "../../components/ModalHeader";
import { Button } from "../../components/Button";
import { Patient, usePatients } from "../../hooks/usePatients";
import { useDoctors } from "../../hooks/useDoctors";
import { Select } from "../../components/Input/Select/Select";
import { RadioGroup } from "../../components/Radio";
import { DatePicker } from "../../components/DatePicker/DatePicker";
import { CalendarIcon } from "../../iconsUtil";
import { listServices, ServiceDTO } from "../../api/services";
import { pickAvatar } from "../../utils/avatar";
import { colors, fonts, radii, spacing } from "../../styles/theme";

// ─────────────────────────────────────────────────────────────────────────────
// "New Prescription" flow on the Prescription page. Two views inside one
// modal:
//   1. Pick — search the clinic's patients, click a row to select.
//   2. Add  — basic patient form (name, phone, gender, age, email).
// Visual style mirrors the Pharmacy "Add stock" modal: rounded card inputs on
// neutral150 fill, two-column grids, ghost / primary footer with a top rule.
// Both views call back with the chosen doctorId so the walk-in lands under
// that doctor's tab in both the Prescription and Appointments queues.
// ─────────────────────────────────────────────────────────────────────────────

export type NewPatientDraft = {
  name: string;
  phone: string;
  gender: string;
  age: string;       // years, free-text — matches BookAppointment's "yrs" column
  dob: string;       // dd mm yyyy as typed; converted to yyyy-MM-dd on submit
  email: string;
  service: string;
  // Resolved at submit time from the services catalog. Without this the
  // walk-in is booked with fee=0 and the Pay Due dialog shows "No charges".
  fee: number | null;
};

type NewPrescriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // Pick-existing now also passes the service+fee the user chose in the modal,
  // so the walk-in lands with the right price instead of the always-default
  // "Consultation".
  onSelectPatient: (patient: Patient, doctorId: string, service: string, fee: number | null) => void;
  onAddPatient: (draft: NewPatientDraft, doctorId: string) => void;
};

export function NewPrescriptionModal({
  isOpen,
  onClose,
  onSelectPatient,
  onAddPatient,
}: NewPrescriptionModalProps) {
  const [view, setView] = React.useState<"pick" | "add">("pick");
  const { data: doctors, loading: doctorsLoading } = useDoctors();
  const [doctorId, setDoctorId] = React.useState<string>("");

  React.useEffect(() => {
    if (isOpen) setView("pick");
  }, [isOpen]);

  React.useEffect(() => {
    if (!doctorId && doctors.length > 0) setDoctorId(doctors[0].id);
  }, [doctors, doctorId]);

  const canSubmit = doctorId.length > 0;

  // Design-system Select instead of a native <select> — gives the same
  // chevron/hover/portal-dropdown UI used across the app (no system blue
  // highlight or default OS font).
  const doctorPicker = (
    <Field label="Assign to doctor">
      <Select
        options={doctors.map((d) => ({ label: d.name, value: d.id }))}
        value={doctorId}
        onChange={setDoctorId}
        placeholder={doctorsLoading ? "Loading…" : "Select doctor"}
        disabled={doctorsLoading || doctors.length === 0}
      />
    </Field>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={styles.container}>
        <ModalHeader
          title={view === "pick" ? "New Prescription" : "Add new patient"}
          subtitle={view === "pick" ? "Pick a patient to start a prescription, or add a new one." : "Fill in the patient's basic details."}
          onClose={onClose}
        />

        {view === "pick" ? (
          <PickView
            doctorPicker={doctorPicker}
            canSubmit={canSubmit}
            onSelect={(p, service, fee) => { onSelectPatient(p, doctorId, service, fee); onClose(); }}
            onAddNew={() => setView("add")}
          />
        ) : (
          <AddView
            doctorPicker={doctorPicker}
            canSubmit={canSubmit}
            onCancel={() => setView("pick")}
            onSubmit={(draft) => { onAddPatient(draft, doctorId); onClose(); }}
          />
        )}
      </div>
    </Modal>
  );
}

// ─── Shared field wrapper — label + input + optional error, identical
//     spacing/typography to the Pharmacy Add-stock modal.
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.fieldLabel}>
        {label}{required && <span style={styles.requiredMark}> *</span>}
      </label>
      {children}
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

// ─── Pick view ───────────────────────────────────────────────────────────────

function PickView({
  doctorPicker,
  onSelect,
  onAddNew,
  canSubmit,
}: {
  doctorPicker: React.ReactNode;
  onSelect: (p: Patient, service: string, fee: number | null) => void;
  onAddNew: () => void;
  canSubmit: boolean;
}) {
  const { data: patients, loading, error } = usePatients();
  const [query, setQuery] = React.useState("");
  // Highlight, not submit — the row click only stages a patient. Start Rx
  // in the footer is the explicit commit so the user can re-pick freely.
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  // Start Rx is clickable by default (coloured, not greyed-out) and validates
  // on click — like a login button that prompts "please fill this in".
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleStartRx = () => {
    if (!canSubmit) { setSubmitError("Please assign a doctor first."); return; }
    if (!selectedPatient) { setSubmitError("Please select a patient first."); return; }
    setSubmitError(null);
    onSelect(selectedPatient, service, feeFor(service));
  };

  // Same service-catalog pattern as AddView so the walk-in for an existing
  // patient also carries the right price (otherwise Pay Due shows ₹0.00).
  const [serviceCatalog, setServiceCatalog] = React.useState<ServiceDTO[]>([]);
  const [service, setService] = React.useState<string>("Consultation");
  const services = React.useMemo(
    () => (serviceCatalog.length > 0 ? serviceCatalog.map((s) => s.name) : ["Consultation"]),
    [serviceCatalog],
  );
  React.useEffect(() => {
    let cancelled = false;
    listServices()
      .then((list) => { if (!cancelled && list.length > 0) setServiceCatalog(list); })
      .catch(() => { /* keep the fallback "Consultation" */ });
    return () => { cancelled = true; };
  }, []);
  const feeFor = (name: string): number | null => {
    const match = serviceCatalog.find((s) => s.name === name);
    return match ? (Number(match.price) || 0) : null;
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.phone ?? "").toLowerCase().includes(q),
    );
  }, [patients, query]);

  return (
    <>
      <div style={styles.formCard}>
        {doctorPicker}
        <Field label="Service">
          <Select
            options={services}
            value={service}
            onChange={setService}
            placeholder="Select service"
          />
        </Field>
        <Field label="Search">
          {/* Search + Add new patient sit on one row — the add CTA is a
              quiet ghost button next to Search instead of a primary in the
              footer, so it can't be mistaken for "submit". */}
          <div style={styles.searchRow}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone"
              style={styles.textInput}
            />
            <button type="button" onClick={onAddNew} style={styles.btnGhostCompact}>
              + Add new patient
            </button>
          </div>
        </Field>
        <div style={styles.list}>
          {loading && <p style={styles.empty}>Loading patients…</p>}
          {error && !loading && <p style={styles.empty}>Couldn't load patients ({error})</p>}
          {!loading && !error && filtered.length === 0 && (
            <p style={styles.empty}>
              {query ? "No patients match." : "No patients yet — add one to get started."}
            </p>
          )}
          {filtered.map((p) => (
            <PatientRow
              key={p.id}
              patient={p}
              disabled={!canSubmit}
              selected={selectedPatient?.id === p.id}
              onSelect={canSubmit ? setSelectedPatient : () => { /* doctor not picked */ }}
            />
          ))}
        </div>
      </div>

      <footer style={styles.footer}>
        {submitError && <span style={styles.footerError}>{submitError}</span>}
        <span style={{ display: "inline-flex" }}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartRx}
          >
            Start Rx
          </Button>
        </span>
      </footer>
    </>
  );
}

function PatientRow({
  patient,
  onSelect,
  disabled,
  selected,
}: {
  patient: Patient;
  onSelect: (p: Patient) => void;
  disabled: boolean;
  selected: boolean;
}) {
  const [hover, setHover] = React.useState(false);
  const ageYears = patient.age != null ? Math.floor(patient.age / 12) : null;
  const avatar = pickAvatar({ gender: patient.gender, ageYears });
  const meta = [
    patient.displayNo != null ? `T${patient.displayNo}` : null,
    patient.phone || null,
  ].filter(Boolean).join(" · ");

  // Selected = primary200 + primary700 border, hover = active shade100,
  // resting = neutral150. Makes the staged-patient state unambiguous so
  // the user sees what Start Rx is about to commit.
  const bg = selected
    ? colors.primary200
    : (hover && !disabled ? colors.active.shade100 : colors.neutral150);

  return (
    <button
      type="button"
      style={{
        ...styles.row,
        backgroundColor: bg,
        border: selected ? `1px solid ${colors.primary700}` : "1px solid transparent",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(patient)}
      disabled={disabled}
    >
      <img src={avatar} alt="" style={styles.rowAvatar} />
      <span style={styles.rowName}>{patient.name}</span>
      <span style={styles.rowMeta}>{meta}</span>
    </button>
  );
}

// ─── Add view ────────────────────────────────────────────────────────────────

const GENDERS = ["Male", "Female", "Other"];

function AddView({
  doctorPicker,
  onCancel,
  onSubmit,
  canSubmit,
}: {
  doctorPicker: React.ReactNode;
  onCancel: () => void;
  onSubmit: (draft: NewPatientDraft) => void;
  canSubmit: boolean;
}) {
  const [draft, setDraft] = React.useState<NewPatientDraft>({
    name: "", phone: "", gender: "", age: "", dob: "", email: "", service: "Consultation", fee: null,
  });
  const [serviceCatalog, setServiceCatalog] = React.useState<ServiceDTO[]>([]);
  const services = React.useMemo(
    () => (serviceCatalog.length > 0 ? serviceCatalog.map((s) => s.name) : ["Consultation"]),
    [serviceCatalog],
  );

  React.useEffect(() => {
    let cancelled = false;
    listServices()
      .then((list) => {
        if (cancelled || list.length === 0) return;
        setServiceCatalog(list);
        setDraft((d) => {
          const match = list.find((s) => s.name === d.service);
          return match ? { ...d, fee: Number(match.price) || 0 } : d;
        });
      })
      .catch(() => { /* keep the fallback "Consultation" */ });
    return () => { cancelled = true; };
  }, []);

  const set = (key: keyof NewPatientDraft) => (val: string) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const onServiceChange = (name: string) => {
    const match = serviceCatalog.find((s) => s.name === name);
    setDraft((d) => ({ ...d, service: name, fee: match ? Number(match.price) || 0 : null }));
  };

  // Phone: digits + spaces + "+", capped to 10 digits (after stripping leading 91).
  const onPhoneChange = (val: string) => {
    let v = val.replace(/[^0-9+ ]/g, "");
    let digits = v.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length > 10) digits = digits.substring(2);
    if (digits.length > 10) return;
    setDraft((d) => ({ ...d, phone: v }));
  };
  const onPhoneBlur = () => {
    let clean = draft.phone.replace(/\D/g, "");
    if (clean.startsWith("91") && clean.length > 10) clean = clean.substring(2);
    clean = clean.substring(0, 10);
    if (clean.length === 0) { setDraft((d) => ({ ...d, phone: "" })); return; }
    const next = clean.length > 5
      ? `+91 ${clean.substring(0, 5)} ${clean.substring(5)}`
      : `+91 ${clean}`;
    setDraft((d) => ({ ...d, phone: next }));
  };
  const phoneDigits = draft.phone.replace(/\D/g, "").replace(/^91/, "");
  const phoneValid = phoneDigits.length === 10;

  // Age: digits only, max 3 chars.
  const onAgeChange = (val: string) => {
    const digits = val.replace(/\D/g, "").substring(0, 3);
    setDraft((d) => ({ ...d, age: digits, ...(digits ? { dob: "" } : {}) }));
  };

  // DOB: calendar popover.
  const [showDobPicker, setShowDobPicker] = React.useState(false);
  const onDobSelect = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = String(date.getFullYear());
    setDraft((d) => ({ ...d, dob: `${dd} ${mm} ${yyyy}`, age: "" }));
    setShowDobPicker(false);
  };

  const hasDobOrAge = draft.dob.trim().length > 0 || draft.age.trim().length > 0;

  // Add & start Rx is clickable by default (coloured, not greyed-out) and
  // validates on click — surfacing a friendly message instead of a dead button.
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = () => {
    let message: string | null = null;
    if (!canSubmit) message = "Please assign a doctor first.";
    else if (draft.name.trim().length === 0) message = "Please enter the patient's name.";
    else if (!phoneValid) message = "Please enter a 10-digit phone number.";
    else if (draft.gender.length === 0) message = "Please select a gender.";
    else if (!hasDobOrAge) message = "Please enter a date of birth or age.";
    else if (draft.service.trim().length === 0) message = "Please select a service.";
    if (message) { setSubmitError(message); return; }
    setSubmitError(null);
    onSubmit(draft);
  };

  return (
    <>
      <div style={styles.formCard}>
        {doctorPicker}
        <Field label="Name" required>
          <input type="text" value={draft.name} onChange={(e) => set("name")(e.target.value)} placeholder="Patient name" style={styles.textInput} />
        </Field>
        <div style={styles.twoCol}>
          <Field label="Phone" required error={draft.phone.length > 0 && !phoneValid ? "Enter a 10-digit number" : undefined}>
            <input
              type="text"
              value={draft.phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              onBlur={onPhoneBlur}
              placeholder="+91 XXXXX XXXXX"
              style={styles.textInput}
            />
          </Field>
          <Field label="Email (optional)">
            <input type="text" value={draft.email} onChange={(e) => set("email")(e.target.value)} placeholder="hello@example.com" style={styles.textInput} />
          </Field>
        </div>
        <div style={styles.dobAgeRow}>
          <Field label="DOB" required>
            <div style={{ position: "relative" }}>
              <button type="button" onClick={() => setShowDobPicker(true)} style={styles.dobTrigger}>
                <CalendarIcon style={styles.dobTriggerIcon} />
                <span style={{ ...styles.dobTriggerText, color: draft.dob ? colors.neutral900 : colors.neutral500 }}>
                  {draft.dob || "dd mm yyyy"}
                </span>
              </button>
              {showDobPicker && (
                <div style={styles.dobPickerWrap}>
                  <DatePicker
                    selectedDate={parseDdMmYyyy(draft.dob) ?? new Date()}
                    onSelect={onDobSelect}
                    onClose={() => setShowDobPicker(false)}
                  />
                </div>
              )}
            </div>
          </Field>
          <span style={styles.dobAgeSeparator}>or</span>
          <Field label="Age (years)" required>
            <input type="text" value={draft.age} onChange={(e) => onAgeChange(e.target.value)} placeholder="Age" style={styles.textInput} />
          </Field>
        </div>
        <Field label="Gender" required>
          <RadioGroup
            name="newrx-gender"
            value={draft.gender}
            onChange={set("gender")}
            options={GENDERS}
          />
        </Field>
        <Field label="Service" required>
          <Select
            options={services}
            value={draft.service}
            onChange={onServiceChange}
            placeholder="Select service"
          />
        </Field>
      </div>

      <footer style={styles.footer}>
        {submitError && <span style={styles.footerError}>{submitError}</span>}
        <Button variant="light" size="sm" onClick={onCancel}>Back</Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
        >
          Add & start Rx
        </Button>
      </footer>
    </>
  );
}

// "dd mm yyyy" → Date (or null on garbage). Used to seed the calendar.
function parseDdMmYyyy(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{4})$/);
  if (!m) return null;
  const dd = Number(m[1]); const mm = Number(m[2]); const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

// ─── Styles — match the Pharmacy Add-stock modal exactly ─────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column", gap: spacing.s, width: 520, maxWidth: "92vw" },

  // White-ish form card containing all fields — same shell as Add Stock.
  formCard: {
    display: "flex", flexDirection: "column", gap: spacing.s,
    backgroundColor: colors.neutral100, borderRadius: radii.xl,
    border: `1px solid ${colors.neutral200}`, padding: spacing.m,
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.m },

  fieldWrap: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs, lineHeight: fonts.lineHeight.xs,
    color: colors.neutral500, fontWeight: fonts.weight.regular,
  },
  requiredMark: { color: colors.red200 },
  fieldError: {
    fontFamily: fonts.family.primary, fontSize: fonts.control.xs,
    color: colors.red200, marginTop: 2,
  },

  // Rounded card-shaped inputs on neutral150 fill — same shape as Add Stock.
  textInput: {
    width: "100%", height: "var(--input-h, 40px)", boxSizing: "border-box",
    padding: `0 ${spacing.s}`,
    border: `1px solid ${colors.neutral300}`, borderRadius: radii.m,
    backgroundColor: colors.neutral150,
    fontFamily: fonts.family.primary, fontSize: fonts.control.sm,
    color: colors.neutral900, outline: "none",
  },
  // Search input + Add-new-patient ghost button laid out as one row inside
  // the Field, so the add CTA sits next to its "alternative" (Search) and
  // can't be mistaken for a submit action.
  searchRow: { display: "flex", gap: spacing.s, alignItems: "stretch" },

  // Pick-view patient list.
  list: { display: "flex", flexDirection: "column", gap: spacing.xs, maxHeight: 280, overflowY: "auto", marginTop: 4 },
  empty: { fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral500, textAlign: "center", margin: `${spacing.s} 0` },
  row: { display: "flex", alignItems: "center", gap: spacing.s, padding: `${spacing.xs} ${spacing.s}`, border: "none", borderRadius: radii.m, textAlign: "left", width: "100%", transition: "background-color 0.15s ease" },
  rowAvatar: { width: 32, height: 32, borderRadius: "50%", flexShrink: 0, objectFit: "cover" },
  rowName: { flex: 1, fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral900 },
  rowMeta: { fontFamily: fonts.family.primary, fontSize: fonts.control.xs, color: colors.neutral500 },

  // DOB / Age row with the "or" separator between two card inputs.
  dobAgeRow: { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: spacing.m, alignItems: "end" },
  dobAgeSeparator: { fontFamily: fonts.family.primary, fontSize: fonts.size.s, color: colors.neutral500, paddingBottom: 10 },

  // DOB click-to-open trigger — matches the rounded textInput look so the
  // date field sits flush with Name/Phone/Email.
  dobTrigger: {
    display: "flex", alignItems: "center", gap: spacing.xs,
    width: "100%", height: 35, boxSizing: "border-box",
    padding: `0 ${spacing.s}`,
    border: `1px solid ${colors.neutral300}`, borderRadius: radii.m,
    backgroundColor: colors.neutral150,
    cursor: "pointer", outline: "none", textAlign: "left" as const,
  },
  dobTriggerIcon: { width: 16, height: 16, color: colors.neutral900, opacity: 0.8, flexShrink: 0 },
  dobTriggerText: { flex: 1, fontFamily: fonts.family.primary, fontSize: fonts.control.sm },
  dobPickerWrap: { position: "absolute" as const, top: "100%", left: 0, zIndex: 10, marginTop: 4 },

  // Footer with top rule + ghost/primary buttons — same as Add Stock.
  footer: {
    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: spacing.s,
    paddingTop: spacing.s, borderTop: `1px solid ${colors.neutral200}`,
  },
  // Validate-on-click message — sits to the left of the footer buttons,
  // same red token/typography as the per-field error.
  footerError: {
    marginRight: "auto",
    fontFamily: fonts.family.primary, fontSize: fonts.control.xs,
    color: colors.red200, textAlign: "left" as const,
  },
  // Compact ghost variant — height matches the rounded card inputs (35) so
  // it sits flush in the Search row. Same ghost tokens, shorter padding.
  btnGhostCompact: {
    fontFamily: fonts.family.primary, fontSize: fonts.control.sm,
    color: colors.neutral900, background: "transparent",
    border: `1px solid ${colors.primary300}`, borderRadius: radii.full,
    padding: `0 ${spacing.m}`, height: 35, cursor: "pointer",
    whiteSpace: "nowrap" as const, flexShrink: 0,
  },
};
