import React, { useState, useEffect } from "react";
import { styles } from "./BookAppointment.styles";
import { colors, fonts, spacing } from "../../styles/theme";
import { Icon } from "../Icon";
import { Card } from "../Card/Card";
import { PageHeader } from "../PageHeader/PageHeader";
import { Switch } from "../Switch/Switch";
import { BillCard } from "../BillCard/BillCard";
import { UnderlineSelect } from "../Input/UnderlineSelect/UnderlineSelect";
import { Select } from "../Input/Select/Select";
import { Toast } from "../Toast";
import { resolveToastIcon } from "../Toast/toastIcon";
import { ConfirmDialog } from "../ConfirmDialog";
import { RadioGroup } from "../Radio";
import { PatientDetailsForm } from "../PatientDetailsForm";
import { DateField } from "../DateField";
import { TimeField } from "../TimeField";
import { API_BASE_URL } from "../../apiConfig";
import { listServices, ServiceDTO } from "../../api/services";
import { pickAvatar } from "../../utils/avatar";

type Doctor = {
  id: string;
  name: string;
};

export type EditAppointmentData = {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientGender?: string;
  patientDob?: string;
  patientAge?: number;
  // Backend-issued per-clinic patient number (the real "T###" code). Pass
  // it through here so the Edit Appointment header can render the same
  // T### the queue shows, instead of falling back to "T---".
  patientDisplayNo?: number | null;
  // Sticky walk-in flag — when reopening a walk-in appointment the time
  // pill should still read "Walk-in" instead of the wall-clock time.
  isWalkin?: boolean;
  service?: string;
  type: string;
  scheduledTime: string;
  doctorId: string;
  payStatus?: string;
  paymentMethod?: string;
  notes?: string;
  fee?: number;
  // When set, every input renders disabled and the save action is
  // suppressed — useful for viewing the booking details of completed
  // or out-of-window appointments without allowing edits.
  readOnly?: boolean;
  readOnlyReason?: string;
};

type BookAppointmentProps = {
  doctors: Doctor[];
  initialDoctorId?: string;
  onBack: (successMessage?: string) => void;
  editingAppointment?: EditAppointmentData;
  bookingKey?: number;
};

export function BookAppointment({ doctors, initialDoctorId, onBack, editingAppointment, bookingKey }: BookAppointmentProps) {
  const parseScheduledTime = (time?: string) => {
    if (!time) return { date: new Date(), timeStr: "10:00 AM" };
    // Parse as local time (not UTC)
    const parts = time.split("T");
    const dateParts = parts[0].split("-");
    const timeParts = (parts[1] || "10:00:00").split(":");
    const d = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]),
      Number(timeParts[0]), Number(timeParts[1]), 0);
    let hours = d.getHours();
    const mins = d.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return { date: d, timeStr: `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${period}` };
  };

  // Services + prices come from the clinic's services catalog. Mounted-once
  // fetch; the bill totals recompute reactively as the map fills in.
  const [serviceCatalog, setServiceCatalog] = useState<ServiceDTO[]>([]);
  useEffect(() => {
    let cancelled = false;
    listServices()
      .then((list) => { if (!cancelled) setServiceCatalog(list); })
      .catch(() => { /* leave empty — the dropdown will just have no options */ });
    return () => { cancelled = true; };
  }, []);
  const SERVICE_PRICES: Record<string, number> = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of serviceCatalog) map[s.name] = Number(s.price);
    return map;
  }, [serviceCatalog]);
  const SERVICE_OPTIONS = React.useMemo(
    () => serviceCatalog.map((s) => s.name),
    [serviceCatalog]
  );

  const initTime = editingAppointment ? parseScheduledTime(editingAppointment.scheduledTime) : null;

  const [selectedDoctorId, setSelectedDoctorId] = useState(
    editingAppointment?.doctorId || initialDoctorId || (doctors.length > 0 ? doctors[0].id : "")
  );
  const [overridePatientNumber, setOverridePatientNumber] = useState<number | null>(null);
  const currentCounter = parseInt(localStorage.getItem("docodile_patient_counter") || "0", 10);
  const patientMap: Record<string, number> = JSON.parse(
    localStorage.getItem("docodile_patient_map") || "{}"
  );
  const editingPatientNumber = editingAppointment ? patientMap[editingAppointment.id] : undefined;
  // Prefer the backend's per-clinic display_no (V46), which is the same T###
  // the queue / Patient Files / Prescription pad all show. Fall back to the
  // legacy localStorage map for old rows that pre-date the backfill, and
  // finally "T---" if we truly have nothing.
  const patientId = editingAppointment
    ? editingAppointment.patientDisplayNo != null
      ? "T" + String(editingAppointment.patientDisplayNo).padStart(3, "0")
      : editingPatientNumber
        ? "T" + String(editingPatientNumber).padStart(3, "0")
        : "T---"
    : overridePatientNumber
      ? "T" + String(overridePatientNumber).padStart(3, "0")
      : "T" + String(currentCounter + 1).padStart(3, "0");
  const [form, setForm] = useState({
    name: editingAppointment?.patientName || "",
    email: editingAppointment?.patientEmail || "",
    phone: editingAppointment?.patientPhone || "",
    dob: "",
    age: editingAppointment?.patientAge ? `${Math.floor(editingAppointment.patientAge / 12)} / ${editingAppointment.patientAge % 12}` : "",
    gender: editingAppointment?.patientGender || "Male",
    type: editingAppointment?.type || "New",
    services: editingAppointment?.service
      ? editingAppointment.service.split(" + ").filter(Boolean)
      : [],
    date: initTime?.date || new Date(),
    time: initTime?.timeStr || "",
    // Walk-in flag — when true the time pill renders "Walk-in" instead of
    // the wall-clock time, and isWalkin=true is sent to the backend so the
    // queue card / billing flow treats it the same as a queue-side walk-in.
    isWalkin: !!editingAppointment?.isWalkin,
    // A WAIVED appointment reads back as the "Waive" channel at a full 100%
    // write-off (its fee holds the pre-waive service amount).
    paymentMethod: editingAppointment?.payStatus?.toUpperCase() === "WAIVED" ? "Waive" : (editingAppointment?.paymentMethod || ""),
    note: editingAppointment?.notes || "",
    subtotal: editingAppointment?.fee || 0,
    tax: "" as string,
    discount: editingAppointment?.payStatus?.toUpperCase() === "WAIVED" ? 100 : 0.0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [dobDigits, setDobDigits] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  // Same-day-duplicate confirmation. Holds the in-flight booking args
  // (payStatus, successMessage) plus the prompt message — drives the
  // "Are you sure?" dialog rendered near the bottom of the JSX.
  const [pendingDupe, setPendingDupe] = useState<
    { payStatus: string; successMessage?: string; message: string } | null
  >(null);
  const [taxMode, setTaxMode] = useState<"%" | "₹">("%");
  const [discountMode, setDiscountMode] = useState<"%" | "₹">(editingAppointment?.payStatus?.toUpperCase() === "WAIVED" ? "%" : "₹");
  // "Advanced" toggle in the page header — reveals extra fields. Wiring the
  // extra fields is deferred; for now this state is set but unused.
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [allPatients, setAllPatients] = useState<any[]>([]);
  // When the user picks an existing patient from the search dropdown (or is
  // editing an existing appointment), the patient identity fields lock so
  // staff can't accidentally rewrite a patient's name/phone/dob. The user
  // can click "Clear" to release the lock and start a new patient entry.
  const [lockedPatientId, setLockedPatientId] = useState<string | null>(
    editingAppointment ? "editing" : null
  );
  const patientFieldsLocked = lockedPatientId !== null;
  const [isDirty, setIsDirty] = useState(false);
  const initialRenderRef = React.useRef(true);
  useEffect(() => {
    const t = setTimeout(() => { initialRenderRef.current = false; }, 100);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (initialRenderRef.current) return;
    setIsDirty(true);
    setErrors((prev) => {
      if (Object.values(prev).every((v) => !v)) return prev;
      return {
        ...prev,
        name: prev.name && !form.name.trim(),
        email: prev.email && !!form.email.trim() && !isValidEmail(form.email),
        phone: prev.phone && (!form.phone.trim() || form.phone.trim() === "+91" || !isValidPhone(form.phone)),
        dob: prev.dob && !form.dob && !form.age,
        doctor: prev.doctor && !selectedDoctorId,
        services: prev.services && form.services.length === 0,
        time: prev.time && !form.time,
        paymentMethod: prev.paymentMethod && !form.paymentMethod,
      };
    });
  }, [form, selectedDoctorId, dobDigits]);

  // Auto-select Waive whenever discount+mode drives the total to zero (or below).
  // Skipped on initial render so a saved paymentMethod (e.g. "Waive") isn't
  // wiped before the user has had a chance to interact with the bill.
  useEffect(() => {
    if (initialRenderRef.current) return;
    const sub = form.services.reduce((s, svc) => s + (SERVICE_PRICES[svc] || 0), 0);
    const d = Number(form.discount) || 0;
    const isFullWaive =
      sub > 0 &&
      ((discountMode === "%" && d >= 100) ||
        (discountMode === "₹" && d >= sub));
    if (isFullWaive && form.paymentMethod !== "Waive") {
      setForm((prev) => ({ ...prev, paymentMethod: "Waive" }));
    } else if (!isFullWaive && form.paymentMethod === "Waive") {
      setForm((prev) => ({ ...prev, paymentMethod: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.discount, discountMode, form.services]);

  const formatDob = (digits: string): string => {
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    if (digits.length <= 2) return dd;
    if (digits.length <= 4) return `${dd}-${mm}`;
    return `${dd}-${mm}-${yyyy}`;
  };

  const calcAge = (digits: string): string => {
    if (digits.length !== 8) return form.age;
    const d = Number(digits.slice(0, 2));
    const mIdx = Number(digits.slice(2, 4)) - 1;
    const y = Number(digits.slice(4, 8));
    if (d < 1 || d > 31 || mIdx < 0 || mIdx > 11 || y <= 1900) return form.age;
    const birth = new Date(y, mIdx, d);
    const today = new Date();
    if (birth > today) return form.age;
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    return `${years} / ${months}`;
  };

  // Fetch existing patients for autocomplete suggestions.
  useEffect(() => {
    const token = localStorage.getItem("docodile_token") ?? "";
    fetch(`${API_BASE_URL}/api/patients`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then(setAllPatients)
      .catch(() => {});
  }, []);

  const fillFromPatient = (p: any) => {
    const clean = (p.phone ?? "").replace(/\D/g, "").slice(-10);
    const formattedPhone = clean.length === 10
      ? `+91 ${clean.substring(0, 5)} ${clean.substring(5)}`
      : (p.phone ?? "");
    let newDobDigits = "";
    if (p.dob) {
      const parts = String(p.dob).split("-");
      if (parts.length === 3) newDobDigits = parts[2] + parts[1] + parts[0];
    }
    // Look up previously assigned T-number for this patient via their phone.
    const phoneMap: Record<string, number> = JSON.parse(localStorage.getItem("docodile_patient_phone_map") || "{}");
    const existingNumber = clean ? phoneMap[clean] ?? null : null;
    setOverridePatientNumber(existingNumber);
    setForm((prev) => ({
      ...prev,
      name: p.name ?? "",
      phone: formattedPhone,
      gender: p.gender ?? prev.gender,
      dob: newDobDigits ? formatDob(newDobDigits) : prev.dob,
      age: newDobDigits ? calcAge(newDobDigits) : (p.age ? `${Math.floor(p.age / 12)} / ${p.age % 12}` : prev.age),
    }));
    if (newDobDigits) setDobDigits(newDobDigits);
    // Lock identity fields so the staff can't drift this picked patient's
    // saved data through accidental keystrokes.
    setLockedPatientId(p.id);
  };

  // Release the identity lock and clear the form so the user can enter a
  // brand-new patient (the dropdown only locks; this is the explicit unlock).
  const clearSelectedPatient = () => {
    setLockedPatientId(null);
    setOverridePatientNumber(null);
    setDobDigits("");
    setForm((prev) => ({
      ...prev,
      name: "",
      email: "",
      phone: "",
      gender: "",
      dob: "",
      age: "",
    }));
  };

  // Pre-fill DOB when editing
  useEffect(() => {
    if (editingAppointment?.patientDob) {
      const parts = editingAppointment.patientDob.split("-");
      if (parts.length === 3) {
        const digits = parts[2] + parts[1] + parts[0]; // "2005-11-07" → "07112005"
        setDobDigits(digits);
        setForm((prev) => ({ ...prev, dob: formatDob(digits), age: calcAge(digits) }));
      }
    }
  }, []);

  const parseTimeTo24h = (time: string): { hour: number; minute: number } => {
    const [timePart, period] = time.split(" ");
    let [hour, minute] = timePart.split(":").map(Number);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return { hour, minute };
  };

  const isValidEmail = (email: string) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone: string) => {
    if (!phone) return true;
    const digits = phone.replace(/\D/g, "");
    const cleaned = digits.startsWith("91") && digits.length > 10 ? digits.substring(2) : digits;
    if (cleaned.length === 0) return true; // truly empty after stripping prefix
    return cleaned.length === 10;
  };

  const handleBook = async (payStatus: string, successMessage?: string, force: boolean = false) => {
    // Payment method is only required when the booking is being marked
    // Paid right now. "Book Now Pay Later" keeps the bill open and
    // shouldn't force the receptionist to pick a channel they don't yet
    // know — the patient settles at the counter later.
    const requiresPaymentMethod = payStatus === "Paid";
    const newErrors: Record<string, boolean> = {
      name: !form.name.trim(),
      email: !!form.email.trim() && !isValidEmail(form.email),
      phone: !form.phone.trim() || form.phone.trim() === "+91" || !isValidPhone(form.phone),
      dob: !form.dob && !form.age,
      doctor: !activeDoctor,
      services: form.services.length === 0,
      time: !form.time,
      paymentMethod: requiresPaymentMethod && !form.paymentMethod,
    };
    setErrors(newErrors);
    const firstError =
      newErrors.name ? "Please enter patient name" :
      newErrors.email ? "Please enter a valid email address" :
      newErrors.phone ? "Please enter a valid phone number" :
      newErrors.dob ? "Please enter date of birth or age" :
      newErrors.doctor ? "Please select a doctor" :
      newErrors.services ? "Please select at least one service" :
      newErrors.time ? "Please select a time" :
      newErrors.paymentMethod ? "Please select a payment method" :
      null;
    if (firstError) {
      setToastMessage(firstError);
      return;
    }

    setSubmitting(true);
    try {
      // Duplicate check — surface a confirm prompt if this patient (phone
      // AND name, matching the backend's resolution rule) already has an
      // appointment on the selected date. `force` skips this on the
      // re-submit triggered by the confirmation modal.
      if (!editingAppointment && !force) {
        const dateStr = `${form.date.getFullYear()}-${String(form.date.getMonth() + 1).padStart(2, "0")}-${String(form.date.getDate()).padStart(2, "0")}`;
        const aptsRes = await fetch(`${API_BASE_URL}/api/tenant/appointments?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("docodile_token")}` },
        });
        if (aptsRes.ok) {
          const apts: any[] = await aptsRes.json();
          const phoneClean = form.phone.replace(/\D/g, "").slice(-10);
          const nameClean = form.name.trim().toLowerCase();
          const duplicates = phoneClean
            ? apts.filter((a) =>
                (a.patientPhone ?? "").replace(/\D/g, "").slice(-10) === phoneClean &&
                (a.patientName ?? "").trim().toLowerCase() === nameClean
              )
            : [];
          if (duplicates.length > 0) {
            const fmtT = (iso: string) => {
              const d = new Date(iso);
              return Number.isNaN(d.getTime())
                ? ""
                : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
            };
            const timeStr = duplicates
              .map((a: any) => fmtT(a.scheduledTime))
              .filter(Boolean)
              .join(", ");
            setPendingDupe({
              payStatus,
              successMessage,
              message: `${form.name} already has an appointment on ${formatDate(form.date)}${timeStr ? ` at ${timeStr}` : ""}. Add another?`,
            });
            return;
          }
        }
      }

      const { hour, minute } = parseTimeTo24h(form.time);
      const scheduledTime = new Date(form.date);
      scheduledTime.setHours(hour, minute, 0, 0);

      const body = {
        patientName: form.name,
        patientEmail: form.email || null,
        patientPhone: form.phone || null,
        patientGender: form.gender || null,
        patientDob: dobDigits.length === 8 ? `${dobDigits.slice(4, 8)}-${dobDigits.slice(2, 4)}-${dobDigits.slice(0, 2)}` : null,
        patientAge: form.age ? (() => {
          const yPart = parseInt(form.age.split("/")[0]?.trim() || "0", 10) || 0;
          const mPart = parseInt(form.age.split("/")[1]?.trim() || "0", 10) || 0;
          return yPart * 12 + mPart;
        })() : null,
        doctorId: selectedDoctorId,
        scheduledTime: scheduledTime.getFullYear() + "-" +
          String(scheduledTime.getMonth() + 1).padStart(2, "0") + "-" +
          String(scheduledTime.getDate()).padStart(2, "0") + "T" +
          String(scheduledTime.getHours()).padStart(2, "0") + ":" +
          String(scheduledTime.getMinutes()).padStart(2, "0") + ":00",
        type: form.type,
        service: form.services.join(" + "),
        isWalkin: form.isWalkin,
        // Persist whatever payment channel the desk picked (Cash/Card/UPI/Waive)
        // so it survives a reload / reopen — it's the chosen/intended method.
        // Paid vs unpaid is governed by payStatus, not this field, so a stored
        // method on an unpaid row isn't "already paid", just the selected channel.
        paymentMethod: form.paymentMethod || null,
        notes: form.note || null,
        // A waive is a full write-off: the total nets to ₹0, but we still record
        // the SERVICE amount (subtotal) as the fee so a WAIVED invoice can be
        // minted for it. Otherwise the fee is the net charged.
        fee: form.paymentMethod === "Waive" ? (subtotal > 0 ? subtotal : null) : (total > 0 ? total : null),
        payStatus: form.paymentMethod === "Waive" ? "WAIVED" : payStatus,
        // Tells the backend to skip its own same-day duplicate check.
        // Only true on the second submit after the user confirmed the
        // duplicate in the modal below.
        force,
      };

      const url = editingAppointment
        ? `${API_BASE_URL}/api/tenant/appointments/${editingAppointment.id}`
        : `${API_BASE_URL}/api/tenant/appointments`;
      const res = await fetch(url, {
        method: editingAppointment ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        if (!editingAppointment) {
          const prev = parseInt(localStorage.getItem("docodile_patient_counter") || "0", 10);
          // Reuse the existing patient's T-number if we selected from suggestions.
          const assigned = overridePatientNumber ?? (prev + 1);
          if (!overridePatientNumber) {
            localStorage.setItem("docodile_patient_counter", String(assigned));
          }
          try {
            const savedApt = await res.clone().json();
            if (savedApt?.id) {
              const map = JSON.parse(localStorage.getItem("docodile_patient_map") || "{}");
              map[savedApt.id] = assigned;
              localStorage.setItem("docodile_patient_map", JSON.stringify(map));
            }
            // Persist phone → T-number so future bookings for this patient reuse it.
            const phoneClean = form.phone.replace(/\D/g, "").slice(-10);
            if (phoneClean) {
              const phoneMap = JSON.parse(localStorage.getItem("docodile_patient_phone_map") || "{}");
              if (!phoneMap[phoneClean]) {
                phoneMap[phoneClean] = assigned;
                localStorage.setItem("docodile_patient_phone_map", JSON.stringify(phoneMap));
              }
            }
          } catch {}
        }
        onBack(successMessage || (editingAppointment ? "Appointment updated successfully" : "Appointment booked successfully"));
      } else {
        try {
          const err = await res.json();
          // 409 from the backend = same-day duplicate the client check
          // missed (stale data / direct API call). Same prompt either way.
          if (res.status === 409 && err?.duplicate && !editingAppointment) {
            // Backend caught a duplicate the client check missed (e.g. stale
            // data). Same confirm dialog as above.
            setPendingDupe({
              payStatus,
              successMessage,
              message: err.error || `${form.name} already has an appointment on ${formatDate(form.date)}. Add another?`,
            });
            return;
          }
          setToastMessage(err.error || err.message || "Failed to book appointment");
        } catch {
          setToastMessage(`Failed to book appointment (${res.status})`);
        }
      }
    } catch (e) {
      console.error("Booking error:", e);
      setToastMessage("An error occurred while booking. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  const handleDoctorCycle = () => {
    const currentIndex = doctors.findIndex(d => d.id === selectedDoctorId);
    const nextIndex = (currentIndex + 1) % doctors.length;
    setSelectedDoctorId(doctors[nextIndex].id);
  };

  const subtotal = form.services.reduce((sum, svc) => sum + (SERVICE_PRICES[svc] || 0), 0);
  const taxVal = parseFloat(String(form.tax)) || 0;
  const taxAmount = taxMode === "%" ? subtotal * taxVal / 100 : taxVal;
  const discountVal = Number(form.discount) || 0;
  const discountAmount = discountMode === "%" ? subtotal * discountVal / 100 : discountVal;
  const total = subtotal + taxAmount - discountAmount;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div style={styles.overlay}>
      <PageHeader
        onBack={() => onBack()}
        backLabel="Back to Appointments"
        // Span the full bar (no content cap) and use TopNav's right padding
        // (spacing.xl = 24px) so the Advanced toggle right-aligns with the
        // avatar at any viewport.
        innerStyle={{ maxWidth: "none", paddingRight: spacing.xl }}
        title={
          editingAppointment ? (
            "Edit Appointment"
          ) : (
            <>
              Book an appointment for{" "}
              <UnderlineSelect
                options={doctors.map(d => ({ label: d.name, value: d.id }))}
                value={selectedDoctorId}
                onChange={(val) => setSelectedDoctorId(val)}
                placeholder="Select Doctor"
              />
            </>
          )
        }
        actions={
          <label style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, cursor: "pointer", fontSize: fonts.size.s, color: colors.neutral900, fontFamily: fonts.family.primary, userSelect: "none" }}>
            Advanced
            <Switch checked={isAdvanced} onChange={setIsAdvanced} size="sm" ariaLabel="Advanced booking mode" />
          </label>
        }
      />

      {editingAppointment?.readOnly && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          margin: `0 ${spacing.xl}`,
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: spacing.xs,
            padding: `${spacing["2xs"]} ${spacing.m}`,
            backgroundColor: colors.primary200,
            color: colors.primary800,
            borderRadius: 999,
            fontFamily: fonts.family.primary,
            fontSize: fonts.size.xs,
            fontWeight: fonts.weight.medium,
            lineHeight: fonts.lineHeight.s,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>{editingAppointment.readOnlyReason ?? "This appointment is locked — view only."}</span>
          </div>
        </div>
      )}

      <div style={{
        ...styles.grid,
        ...(editingAppointment?.readOnly ? { pointerEvents: "none" as const, opacity: 0.85 } : {}),
      }}>
        {/* Patient ID Card — avatar above the ID. Avatar reacts to the gender +
            age the user has filled in below. */}
        <Card style={{ ...styles.card, ...styles.patientIdCard }}>
          <img
            src={pickAvatar({
              gender: form.gender,
              ageYears: form.age ? parseInt(form.age.split("/")[0]?.trim() || "", 10) : null,
            })}
            alt=""
            style={styles.patientAvatar}
          />
          <h1 style={styles.patientIdText}>{patientId}</h1>
        </Card>

        {/* Patient Details Card */}
        <PatientDetailsForm
          style={{ gridColumn: "2", gridRow: "1" }}
          value={{ name: form.name, email: form.email, phone: form.phone, dob: form.dob, age: form.age, gender: form.gender }}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          errors={{ name: errors.name, email: errors.email, phone: errors.phone, dob: errors.dob }}
          dobDigits={dobDigits}
          setDobDigits={setDobDigits}
          patients={allPatients}
          onSelectExisting={fillFromPatient}
          locked={patientFieldsLocked}
          showClearLink={patientFieldsLocked && lockedPatientId !== "editing"}
          onClearLocked={clearSelectedPatient}
        />

        {/* Billing Card */}
        <div style={{ gridColumn: "3", gridRow: "1 / span 2", alignSelf: "stretch" }}>
          <BillCard
            paymentMethod={form.paymentMethod}
            onPaymentMethodChange={(m) => {
              if (m === "Waive") {
                setDiscountMode("%");
                setForm({ ...form, paymentMethod: m, discount: 100 });
              } else {
                if (form.paymentMethod === "Waive") {
                  setForm({ ...form, paymentMethod: m, discount: 0 });
                } else {
                  setForm({ ...form, paymentMethod: m });
                }
              }
            }}
            note={form.note}
            onNoteChange={(n) => setForm({ ...form, note: n })}
            subtotal={subtotal}
            onSubtotalChange={(v) => setForm({ ...form, subtotal: v })}
            tax={form.tax}
            onTaxChange={(v) => setForm({ ...form, tax: v })}
            discount={form.discount}
            onDiscountChange={(v) => setForm({ ...form, discount: v })}
            total={Math.round(total)}
            onTaxModeChange={setTaxMode}
            onDiscountModeChange={setDiscountMode}
            services={form.services.map(svc => ({ name: svc, price: SERVICE_PRICES[svc] || 0 }))}
            isPaid={editingAppointment?.payStatus?.toUpperCase() === "PAID"}
            patientName={form.name}
            patientMeta={{
              age: form.age ? (parseInt(form.age.split("/")[0]?.trim() || "", 10) || undefined) : undefined,
              gender: form.gender || undefined,
              mobile: form.phone || undefined,
            }}
          />
        </div>

        <div style={styles.scheduleColumn}>
          {/* Schedule Mini Cards Stack */}
          <Card style={{ ...styles.card, ...styles.scheduleMiniCard }}>
            <RadioGroup
              name="type"
              value={form.type}
              onChange={(t) => setForm({ ...form, type: t })}
              options={["New", "Review"]}
            />
          </Card>

          <DateField
            value={form.date}
            onChange={(date) => setForm({ ...form, date })}
            format={formatDate}
            disablePast
            disabled={!!editingAppointment && form.isWalkin}
            disabledTitle="Walk-in date can't be edited"
          />

          <TimeField
            value={form.time}
            onChange={(time) => setForm({ ...form, time, isWalkin: false })}
            onWalkin={(time) => setForm({ ...form, time, isWalkin: true })}
            selectedDate={form.date}
            isWalkin={form.isWalkin}
            invalid={!!errors.time}
            disabled={!!editingAppointment && form.isWalkin}
            disabledTitle="Walk-in time can't be edited"
          />
          {errors.time && (
            <div style={{ color: colors.red200, fontSize: fonts.size.xs, marginLeft: 4 }}>
              Please select a time
            </div>
          )}
        </div>

        {/* Appointment Details Card */}
        <Card style={{ ...styles.card, ...styles.appointmentDetailsCard }}>
          {(() => {
            // Also lock on readOnly — the row's own `pointerEvents: "auto"`
            // overrides the parent grid's readOnly pointer-events block, so
            // we have to re-assert it here. Same on the Service row below.
            const paidLocked = editingAppointment?.payStatus?.toUpperCase() === "PAID";
            const doctorLocked = paidLocked || !!editingAppointment?.readOnly;
            // Only dim at the row level when *paid* is the lock reason —
            // when it's just readOnly the parent grid is already at 0.85
            // opacity, and multiplying with 0.6 here makes the text barely
            // legible.
            const rowOpacity = paidLocked && !editingAppointment?.readOnly ? 0.6 : 1;
            return (
              <div style={styles.appointmentRow}>
                <div style={styles.appointmentLabelGroup}>
                  <Icon name="stethoscope" tone="inherit" style={styles.appointmentIcon} />
                  <label style={styles.fieldLabel}>Doctor</label>
                </div>
                <div style={{ flex: 1, pointerEvents: doctorLocked ? "none" : "auto", opacity: rowOpacity }}>
                  <Select
                    options={doctors.map(d => ({ label: d.name, value: d.id }))}
                    value={selectedDoctorId}
                    onChange={(val: string) => setSelectedDoctorId(val)}
                    placeholder="Select Doctor"
                    error={errors.doctor}
                    disabled={doctorLocked}
                  />
                </div>
              </div>
            );
          })()}

          {(() => {
            const paidLocked = editingAppointment?.payStatus?.toUpperCase() === "PAID";
            const servicesLocked = paidLocked || !!editingAppointment?.readOnly;
            // See doctor row above — don't multiply with parent grid's 0.85
            // when readOnly already dims the whole thing.
            const rowOpacity = paidLocked && !editingAppointment?.readOnly ? 0.6 : 1;
            return <>
              {form.services.map((svc, i) => (
                <div key={i} style={styles.appointmentRow}>
                  <div style={styles.appointmentLabelGroup}>
                    <Icon name="pulse" tone="inherit" style={styles.appointmentIcon} />
                    <label style={styles.fieldLabel}>Service</label>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", pointerEvents: servicesLocked ? "none" : "auto", opacity: rowOpacity }}>
                    <div style={{ flex: 1 }}>
                      <Select
                        options={SERVICE_OPTIONS}
                        value={svc}
                        onChange={(val: string) => {
                          const updated = [...form.services];
                          updated[i] = val;
                          setForm({ ...form, services: updated });
                        }}
                        placeholder="Select Service"
                        disabled={servicesLocked}
                      />
                    </div>
                    {!servicesLocked ? (
                      // Any service — including the last one — can be removed;
                      // the user can re-pick via "Add Service". Booking stays
                      // gated on having at least one service (submit validation),
                      // so clearing the only row just blocks Book until re-added.
                      <button
                        onClick={() => {
                          const removed = form.services[i];
                          const updated = form.services.filter((_, idx) => idx !== i);
                          setForm({ ...form, services: updated });
                          setToastMessage(`${removed} removed`);
                        }}
                        title="Remove service"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          opacity: 1,
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="trash" size={20} tone="inherit" />
                      </button>
                    ) : (
                      <div style={{ width: "28px", flexShrink: 0 }} />
                    )}
                  </div>
                </div>
              ))}
              {!servicesLocked && (
                <div style={styles.appointmentRow}>
                  <div style={styles.appointmentLabelGroup}>
                    <Icon name="pulse" tone="inherit" style={styles.appointmentIcon} />
                    <label style={styles.fieldLabel}>Service</label>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1 }}>
                      <Select
                        options={SERVICE_OPTIONS}
                        value=""
                        onChange={(val: string) => setForm({ ...form, services: [...form.services, val] })}
                        placeholder="+ Add Service"
                        error={errors.services}
                      />
                    </div>
                    <div style={{ width: "28px", flexShrink: 0 }} />
                  </div>
                </div>
              )}
            </>;
          })()}
        </Card>

        {/* Footer Buttons */}
        <div style={styles.footerButtonGroup}>
          {editingAppointment ? (
            <>
              {!editingAppointment.readOnly && isDirty && (
                <button style={styles.pillButtonPrimary} onClick={() => handleBook(editingAppointment.payStatus || "Unpaid")} disabled={submitting}>
                  <Icon name="edit-pencil" size={18} tone="inverse" />
                  {submitting ? "Saving..." : "Save Edits"}
                </button>
              )}
              {/* "Pay Due" button removed per product feedback — payment is
                  handled exclusively via the queue's Mark-as-Paid kebab
                  action / Bill Medicines flow, so an extra CTA on the Edit
                  Appointment view was redundant. */}
            </>
          ) : (
            <>
              <button
                style={{
                  ...styles.pillButtonSecondary,
                  ...(form.paymentMethod === "Waive" ? { opacity: 0.38, cursor: "not-allowed" } : {}),
                }}
                onClick={() => handleBook("Unpaid")}
                disabled={submitting || form.paymentMethod === "Waive"}
              >
                <Icon name="calendar" size={20} tone="inherit" />
                {submitting ? "Booking..." : "Book Now Pay Later"}
              </button>
              <button style={styles.pillButtonPrimary} onClick={() => handleBook("Paid")} disabled={submitting}>
                <Icon name="verified-badge" size={20} tone="inverse" />
                {submitting ? "Booking..." : "Pay & Book"}
              </button>
            </>
          )}
        </div>
      </div>

      <Toast
        message={toastMessage}
        {...resolveToastIcon(toastMessage)}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />

      <ConfirmDialog
        isOpen={!!pendingDupe}
        title="Are you sure?"
        message={pendingDupe?.message}
        confirmLabel="Yes, add anyway"
        cancelLabel="Nope"
        onConfirm={() => {
          const p = pendingDupe;
          setPendingDupe(null);
          if (p) void handleBook(p.payStatus, p.successMessage, true);
        }}
        onCancel={() => setPendingDupe(null)}
      />
    </div>
  );
}

