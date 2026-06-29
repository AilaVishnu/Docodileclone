import React, { useEffect, useMemo, useState } from "react";
import { styles as appt } from "../../components/AppointmentQueue/BookAppointment.styles";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { Card } from "../../components/Card";
import { PatientDetailsForm } from "../../components/PatientDetailsForm";
import { BillCard } from "../../components/BillCard/BillCard";
import { Select } from "../../components/Input/Select/Select";
import { UnderlineSelect } from "../../components/Input/UnderlineSelect/UnderlineSelect";
import { RadioGroup } from "../../components/Radio";
import { DateField } from "../../components/DateField";
import { TimeField } from "../../components/TimeField";
import { Icon } from "../../components/Icon";
import { pickAvatar } from "../../utils/avatar";
import { colors, fonts, spacing } from "../../styles/theme";
import { useDoctors } from "../../hooks/useDoctors";
import { usePatients, Patient } from "../../hooks/usePatients";
import { listServices, ServiceDTO } from "../../api/services";

/** What the page hands back to start a walk-in prescription. */
export type PrescribeRequest = {
  doctorId: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  ageMonths: number | null;
  dob: string | null;
  service: string | null;
  fee: number | null;
};

/**
 * NewPrescriptionView — the consolidated "New Prescription" page (replaces the
 * pick/add modals). A doctor starting a prescription for a walk-in with no
 * appointment. Reuses the New-Appointment layout + components; the schedule is
 * frozen to today / walk-in, the bill is optional, and the two CTAs start a
 * walk-in (pay-later or pay-now) and open the Rx pad.
 */
const formatDate = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

export function NewPrescriptionView({ onBack, onPrescribe }: { onBack?: () => void; onPrescribe?: (req: PrescribeRequest, payNow: boolean) => void }) {
  const { data: doctors } = useDoctors();
  const { data: patients } = usePatients();
  const [services, setServices] = useState<ServiceDTO[]>([]);
  useEffect(() => { let live = true; listServices().then((s) => live && setServices(s)).catch(() => {}); return () => { live = false; }; }, []);
  const serviceOptions = useMemo(() => services.map((s) => s.name), [services]);
  const priceOf = (name: string) => services.find((s) => s.name === name)?.price ?? 0;

  const [doctorId, setDoctorId] = useState("");
  useEffect(() => { if (!doctorId && doctors.length > 0) setDoctorId(doctors[0].id); }, [doctors, doctorId]);

  const [type, setType] = useState("New");
  const [today] = useState(() => new Date());
  const [form, setForm] = useState({ name: "", email: "", phone: "", dob: "", age: "", gender: "Male", services: [] as string[], paymentMethod: "", note: "", tax: "", discount: 0 });
  const [dobDigits, setDobDigits] = useState("");
  const [locked, setLocked] = useState(false);
  const [patientId, setPatientId] = useState("T013");

  const subtotal = form.services.reduce((s, svc) => s + priceOf(svc), 0);
  const total = Math.max(0, subtotal - form.discount);

  const fillFromPatient = (p: Patient) => {
    const age = (p as { age?: number }).age ?? 0;
    setForm((prev) => ({ ...prev, name: p.name, phone: (p as { phone?: string | null }).phone ?? "", gender: (p as { gender?: string | null }).gender ?? "Male", age: `${Math.floor(age / 12)} / ${age % 12}`, email: (p as { email?: string | null }).email ?? "" }));
    setLocked(true);
    setPatientId((p as { displayNo?: number }).displayNo != null ? `T${String((p as { displayNo?: number }).displayNo).padStart(3, "0")}` : "T—");
  };
  const clearLocked = () => { setLocked(false); setPatientId("T013"); setForm((p) => ({ ...p, name: "", phone: "", email: "", age: "", dob: "" })); };

  const setServiceAt = (i: number, val: string) => setForm((p) => { const s = [...p.services]; s[i] = val; return { ...p, services: s }; });
  const removeServiceAt = (i: number) => setForm((p) => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }));

  const submit = (payNow: boolean) => {
    const parts = form.age.split("/").map((s) => parseInt(s.trim(), 10) || 0);
    const ageMonths = form.age ? (parts[0] || 0) * 12 + (parts[1] || 0) : null;
    const service = form.services[0] || null;
    onPrescribe?.({
      doctorId,
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      gender: form.gender || null,
      ageMonths,
      dob: form.dob || null,
      service,
      fee: service ? priceOf(service) : null,
    }, payNow);
  };

  return (
    <div style={{ ...appt.overlay, backgroundColor: colors.secondary100 }}>
      <PageHeader
        onBack={onBack}
        backLabel="Back to Rx Pad"
        style={{ backgroundColor: colors.secondary50 }}
        innerStyle={{ maxWidth: "none", paddingRight: spacing.xl }}
        title={
          <>
            New prescription by{" "}
            <UnderlineSelect options={doctors.map((d) => ({ label: d.name, value: d.id }))} value={doctorId} onChange={setDoctorId} placeholder="Select doctor" />
          </>
        }
      />

      <div style={appt.grid}>
        <Card style={{ ...appt.card, ...appt.patientIdCard }}>
          <img src={pickAvatar({ gender: form.gender, ageYears: form.age ? parseInt(form.age.split("/")[0]?.trim() || "", 10) : null })} alt="" style={appt.patientAvatar} />
          <h1 style={appt.patientIdText}>{patientId}</h1>
        </Card>

        <PatientDetailsForm
          style={{ gridColumn: "2", gridRow: "1" }}
          value={{ name: form.name, email: form.email, phone: form.phone, dob: form.dob, age: form.age, gender: form.gender }}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          dobDigits={dobDigits}
          setDobDigits={setDobDigits}
          patients={patients}
          onSelectExisting={fillFromPatient}
          locked={locked}
          showClearLink={locked}
          onClearLocked={clearLocked}
        />

        <div style={{ gridColumn: "3", gridRow: "1 / span 2", alignSelf: "stretch" }}>
          <BillCard
            paymentMethod={form.paymentMethod}
            onPaymentMethodChange={(m) => setForm({ ...form, paymentMethod: m })}
            note={form.note}
            onNoteChange={(n) => setForm({ ...form, note: n })}
            subtotal={subtotal}
            onSubtotalChange={() => {}}
            tax={form.tax}
            onTaxChange={(v) => setForm({ ...form, tax: v })}
            discount={form.discount}
            onDiscountChange={(v) => setForm({ ...form, discount: v })}
            total={Math.round(total)}
            services={form.services.map((svc) => ({ name: svc, price: priceOf(svc) }))}
          />
        </div>

        {/* Schedule — same blocks as New Appointment, frozen (walk-in, now) */}
        <div style={appt.scheduleColumn}>
          <Card style={{ ...appt.card, ...appt.scheduleMiniCard }}>
            <RadioGroup name="visitType" value={type} onChange={setType} options={["New", "Review"]} />
          </Card>
          <DateField value={today} onChange={() => {}} format={formatDate} disabled disabledTitle="Walk-in — today" />
          <TimeField value="" onChange={() => {}} onWalkin={() => {}} selectedDate={today} isWalkin disabled disabledTitle="Walk-in — now" />
        </div>

        <Card style={{ ...appt.card, ...appt.appointmentDetailsCard }}>
          {form.services.map((svc, i) => (
            <div key={i} style={appt.appointmentRow}>
              <div style={appt.appointmentLabelGroup}>
                <Icon name="pulse" tone="inherit" style={appt.appointmentIcon} />
                <label style={appt.fieldLabel}>Service</label>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1 }}><Select options={serviceOptions} value={svc} onChange={(v) => setServiceAt(i, v)} placeholder="Select service" /></div>
                <button onClick={() => removeServiceAt(i)} title="Remove service" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <Icon name="trash" size={20} tone="inherit" />
                </button>
              </div>
            </div>
          ))}
          <div style={appt.appointmentRow}>
            <div style={appt.appointmentLabelGroup}>
              <Icon name="pulse" tone="inherit" style={appt.appointmentIcon} />
              <label style={appt.fieldLabel}>Service</label>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}><Select options={serviceOptions} value="" onChange={(v) => setForm({ ...form, services: [...form.services, v] })} placeholder="+ Add service" /></div>
              <div style={{ width: 28, flexShrink: 0 }} />
            </div>
          </div>
        </Card>

        {/* Two CTAs — mirror Book Now Pay Later / Pay & Book */}
        <div style={appt.footerButtonGroup}>
          <button style={{ ...appt.pillButtonSecondary, width: 250, whiteSpace: "nowrap" }} onClick={() => submit(false)}>
            <Icon name="prescription" size={20} tone="inherit" />
            Prescribe Now Pay Later
          </button>
          <button style={{ ...appt.pillButtonPrimary, width: 250, whiteSpace: "nowrap" }} onClick={() => submit(true)}>
            <Icon name="verified-badge" size={20} tone="inverse" />
            Pay &amp; Prescribe
          </button>
        </div>
      </div>
    </div>
  );
}
