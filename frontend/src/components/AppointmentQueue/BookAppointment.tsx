import React, { useState, useEffect } from "react";
import { styles } from "./BookAppointment.styles";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";
import {
  StethoscopeIcon,
  PulseIcon,
  UserHandsIcon,
  LetterIcon,
  PhoneIcon,
  CalendarIcon,
  HashtagIcon,
  ClockIcon,
  PlusIcon
} from "../../iconsUtil";
import { Card } from "../Card/Card";
import { PageHeader } from "../PageHeader/PageHeader";
import { Switch } from "../Switch/Switch";
import { BillCard } from "../BillCard/BillCard";
import { UnderlineSelect } from "../Input/UnderlineSelect/UnderlineSelect";
import { Select } from "../Input/Select/Select";
import { Toast } from "../Toast";
import { API_BASE_URL } from "../../apiConfig";
import { listServices, ServiceDTO } from "../../api/services";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash.svg";
import { ReactComponent as EditPencilIcon } from "../../assets/icons/edit-pencil.svg";
import { ReactComponent as BillCheckIcon } from "../../assets/icons/bill-check.svg";
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
  service?: string;
  type: string;
  scheduledTime: string;
  doctorId: string;
  payStatus?: string;
  paymentMethod?: string;
  notes?: string;
  fee?: number;
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
  const patientId = editingAppointment
    ? editingPatientNumber
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
    paymentMethod: editingAppointment?.paymentMethod || "",
    note: editingAppointment?.notes || "",
    subtotal: editingAppointment?.fee || 0,
    tax: "" as string,
    discount: 0.0,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dobDigits, setDobDigits] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [taxMode, setTaxMode] = useState<"%" | "₹">("%");
  const [discountMode, setDiscountMode] = useState<"%" | "₹">("₹");
  // "Advanced" toggle in the page header — reveals extra fields. Wiring the
  // extra fields is deferred; for now this state is set but unused.
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const monthInputRef = React.useRef<HTMLInputElement>(null);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [showNameSugg, setShowNameSugg] = useState(false);
  const [showPhoneSugg, setShowPhoneSugg] = useState(false);
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

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hasDob = dobDigits.length > 0;
  const hasManualAge = !hasDob && form.age.replace(/[^0-9]/g, "").length > 0;

  const formatDob = (digits: string): string => {
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    if (digits.length <= 2) return dd;
    if (digits.length <= 4) return `${dd} ${mm}`;
    return `${dd} ${mm} ${yyyy}`;
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

  const nameSuggestions: any[] = form.name.trim().length >= 1
    ? allPatients.filter((p) => p.name.toLowerCase().includes(form.name.toLowerCase())).slice(0, 6)
    : [];
  const phoneSuggestions: any[] = form.phone.replace(/\D/g, "").length >= 6
    ? allPatients.filter((p) => (p.phone ?? "").replace(/\D/g, "").includes(form.phone.replace(/\D/g, ""))).slice(0, 6)
    : [];

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
    setShowNameSugg(false);
    setShowPhoneSugg(false);
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

  const handleBook = async (payStatus: string, successMessage?: string) => {
    const newErrors: Record<string, boolean> = {
      name: !form.name.trim(),
      email: !!form.email.trim() && !isValidEmail(form.email),
      phone: !form.phone.trim() || form.phone.trim() === "+91" || !isValidPhone(form.phone),
      dob: !form.dob && !form.age,
      doctor: !activeDoctor,
      services: form.services.length === 0,
      time: !form.time,
      paymentMethod: !form.paymentMethod,
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
      // Duplicate check — block if this phone already has an appointment on the selected date.
      if (!editingAppointment) {
        const dateStr = `${form.date.getFullYear()}-${String(form.date.getMonth() + 1).padStart(2, "0")}-${String(form.date.getDate()).padStart(2, "0")}`;
        const aptsRes = await fetch(`${API_BASE_URL}/api/tenant/appointments?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("docodile_token")}` },
        });
        if (aptsRes.ok) {
          const apts: any[] = await aptsRes.json();
          const phoneClean = form.phone.replace(/\D/g, "").slice(-10);
          const duplicate = phoneClean
            ? apts.find((a) => (a.patientPhone ?? "").replace(/\D/g, "").slice(-10) === phoneClean)
            : null;
          if (duplicate) {
            setToastMessage(`${form.name} already has an appointment on ${formatDate(form.date)}`);
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
        isWalkin: false,
        paymentMethod: form.paymentMethod,
        notes: form.note || null,
        fee: total > 0 ? total : null,
        payStatus,
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
                fontSize={fonts.size.h5}
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

      <div style={styles.grid}>
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
        <Card style={{ ...styles.card, ...styles.formCard }}>
          {patientFieldsLocked && lockedPatientId !== "editing" && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--book-clearlink-mb, 6px)" }}>
              <button
                type="button"
                onClick={clearSelectedPatient}
                style={{ background: "none", border: "none", color: colors.secondary700, cursor: "pointer", fontSize: fonts.size.xs, textDecoration: "underline", padding: 0 }}
              >
                Clear & enter new patient
              </button>
            </div>
          )}
          <div style={{ position: "relative" }}>
            <div style={{ ...styles.iconField, ...(errors.name ? { borderBottomColor: colors.red200, backgroundColor: "rgba(255,0,0,0.05)" } : {}), ...(patientFieldsLocked ? { opacity: 0.65 } : {}) }}>
              <UserHandsIcon style={styles.iconFieldIcon} />
              <input
                style={styles.iconFieldInput}
                placeholder="Name"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setShowNameSugg(true); }}
                onFocus={() => setShowNameSugg(true)}
                onBlur={() => setTimeout(() => setShowNameSugg(false), 150)}
                disabled={patientFieldsLocked}
              />
            </div>
            {showNameSugg && nameSuggestions.length > 0 && (
              <div style={patientSuggStyle}>
                {nameSuggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    style={patientSuggItem}
                    onMouseDown={() => fillFromPatient(p)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primary100; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <span style={{ color: colors.neutral500, fontSize: fonts.size.xs }}>{p.phone ?? ""}</span>
                  </button>
                ))}
              </div>
            )}
            {errors.name && (
              <div style={{ color: colors.red200, fontSize: fonts.size.xs, marginTop: 2, marginLeft: 4 }}>
                Please enter patient name
              </div>
            )}
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...styles.iconField, ...(errors.email ? { borderBottomColor: colors.red200, backgroundColor: "rgba(255,0,0,0.05)" } : {}), ...(patientFieldsLocked ? { opacity: 0.65 } : {}) }}>
                <LetterIcon style={styles.iconFieldIcon} />
                <input
                  style={styles.iconFieldInput}
                  type="text"
                  placeholder="hello@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onBlur={() => setForm((prev) => ({ ...prev, email: prev.email.trim().toLowerCase() }))}
                  disabled={patientFieldsLocked}
                />
              </div>
              {errors.email && (
                <div style={{ color: colors.red200, fontSize: fonts.size.xs, marginTop: 2, marginLeft: 4 }}>
                  Please enter a valid email
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            <div style={{ ...styles.iconField, ...(errors.phone ? { borderBottomColor: colors.red200, backgroundColor: "rgba(255,0,0,0.05)" } : {}), ...(patientFieldsLocked ? { opacity: 0.65 } : {}) }}>
              <PhoneIcon style={styles.iconFieldIcon} />
              <input
                style={styles.iconFieldInput}
                placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                disabled={patientFieldsLocked}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9+ ]/g, "");
                  let digits = val.replace(/\D/g, "");
                  if (digits.startsWith("91") && digits.length > 10) digits = digits.substring(2);
                  if (digits.length > 10) return;
                  setForm({ ...form, phone: val });
                  setShowPhoneSugg(true);
                }}
                onFocus={() => setShowPhoneSugg(true)}
                onBlur={() => {
                  setTimeout(() => setShowPhoneSugg(false), 150);
                  let clean = form.phone.replace(/\D/g, "");
                  if (clean.startsWith("91") && clean.length > 10) clean = clean.substring(2);
                  clean = clean.substring(0, 10);
                  if (clean.length === 0) { setForm((prev) => ({ ...prev, phone: "" })); return; }
                  if (clean.length > 5) {
                    setForm((prev) => ({ ...prev, phone: `+91 ${clean.substring(0, 5)} ${clean.substring(5)}` }));
                  } else {
                    setForm((prev) => ({ ...prev, phone: `+91 ${clean}` }));
                  }
                }}
              />
            </div>
            {showPhoneSugg && phoneSuggestions.length > 0 && (
              <div style={patientSuggStyle}>
                {phoneSuggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    style={patientSuggItem}
                    onMouseDown={() => fillFromPatient(p)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primary100; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <span style={{ color: colors.neutral500, fontSize: fonts.size.xs }}>{p.phone ?? ""}</span>
                  </button>
                ))}
              </div>
            )}
              {errors.phone && (
                <div style={{ color: colors.red200, fontSize: fonts.size.xs, marginTop: 2, marginLeft: 4 }}>
                  Please enter a valid phone number
                </div>
              )}
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.iconField, position: "relative", flex: 1, minWidth: 0, ...(errors.dob ? { borderBottomColor: colors.red200, backgroundColor: "rgba(255,0,0,0.05)" } : {}), ...(patientFieldsLocked ? { opacity: 0.65, pointerEvents: "none" as const } : {}) }}>
              <span
                onClick={() => {
                  if (patientFieldsLocked) return;
                  if (hasManualAge) setForm((prev) => ({ ...prev, age: "", dob: "" }));
                  setShowDobPicker(true);
                }}
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: spacing.xs, opacity: hasManualAge ? 0.4 : 1 }}
              >
                <CalendarIcon style={styles.iconFieldIcon} />
                <span style={{ fontSize: fonts.size.m, color: colors.neutral900 }}>DOB</span>
              </span>
              <input
                style={{ ...styles.iconFieldInput, opacity: hasManualAge ? 0.4 : 1 }}
                type="text"
                placeholder="dd mm yyyy"
                disabled={patientFieldsLocked}
                onFocus={() => { if (hasManualAge) setForm((prev) => ({ ...prev, age: "", dob: "" })); }}
                value={formatDob(dobDigits)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault();
                    const next = dobDigits.slice(0, -1);
                    setDobDigits(next);
                    setForm((prev) => ({ ...prev, dob: formatDob(next), age: next.length === 8 ? calcAge(next) : "" }));
                  } else if (/^[0-9]$/.test(e.key) && dobDigits.length < 8) {
                    e.preventDefault();
                    const next = dobDigits + e.key;
                    setDobDigits(next);
                    setForm((prev) => ({ ...prev, dob: formatDob(next), age: calcAge(next) }));
                  }
                }}
                onChange={() => { }}
              />
              {showDobPicker && (
                <DatePicker
                  selectedDate={new Date()}
                  onSelect={(date: Date) => {
                    const dd = String(date.getDate()).padStart(2, "0");
                    const mm = String(date.getMonth() + 1).padStart(2, "0");
                    const yyyy = String(date.getFullYear());
                    const digits = dd + mm + yyyy;
                    setDobDigits(digits);
                    setForm((prev) => ({ ...prev, dob: formatDob(digits), age: calcAge(digits) }));
                    setShowDobPicker(false);
                  }}
                  onClose={() => setShowDobPicker(false)}
                />
              )}
            </div>
            <div style={{ fontSize: fonts.size.m, color: colors.neutral900 }}>or</div>
            <div
              style={{
                ...styles.iconField,
                flex: 1,
                minWidth: 0,
                gap: spacing.xs,
                justifyContent: "flex-start",
                ...(errors.dob ? { borderBottomColor: colors.red200, backgroundColor: "rgba(255,0,0,0.05)" } : {}),
                ...(patientFieldsLocked ? { opacity: 0.65, pointerEvents: "none" as const } : {}),
              }}
            >
              <span style={{ fontSize: fonts.size.m, color: colors.neutral900, opacity: hasDob ? 0.4 : 1 }}>Age</span>
              <input
                className="text-input-field"
                style={{ ...styles.iconFieldInput, width: 32, flex: "0 0 auto", borderBottom: "none", textAlign: "center", MozAppearance: "textfield", opacity: hasDob ? 0.4 : 1 } as any}
                type="number"
                min="0"
                max="150"
                placeholder="-"
                disabled={patientFieldsLocked}
                onFocus={() => { if (hasDob) { setDobDigits(""); setForm((prev) => ({ ...prev, age: "", dob: "" })); } }}
                value={form.age.split("/")[0]?.trim() || ""}
                onChange={(e) => {
                  const y = e.target.value;
                  const m = form.age.split("/")[1]?.trim() || "";
                  setDobDigits("");
                  setForm({ ...form, age: (y || m) ? `${y || "0"} / ${m || "0"}` : "", dob: "" });
                  if (y.length >= 2) monthInputRef.current?.focus();
                }}
              />
              <style>{`
                input[type=number]::-webkit-outer-spin-button,
                input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
              `}</style>
              <span style={{ fontSize: fonts.size.m, color: colors.neutral400, opacity: hasDob ? 0.4 : 1 }}>yrs</span>
              <input
                ref={monthInputRef}
                className="text-input-field"
                style={{ ...styles.iconFieldInput, width: 32, flex: "0 0 auto", borderBottom: "none", textAlign: "center", MozAppearance: "textfield", opacity: hasDob ? 0.4 : 1 } as any}
                type="number"
                min="0"
                max="11"
                placeholder="-"
                disabled={patientFieldsLocked}
                onFocus={() => { if (hasDob) { setDobDigits(""); setForm((prev) => ({ ...prev, age: "", dob: "" })); } }}
                value={form.age.split("/")[1]?.trim() || ""}
                onChange={(e) => {
                  let m = e.target.value;
                  const n = parseInt(m, 10);
                  if (m !== "" && (isNaN(n) || n < 0 || n > 11)) return;
                  const y = form.age.split("/")[0]?.trim() || "";
                  setDobDigits("");
                  setForm({ ...form, age: (y || m) ? `${y || "0"} / ${m || "0"}` : "", dob: "" });
                }}
              />
              <span style={{ fontSize: fonts.size.m, color: colors.neutral400, opacity: hasDob ? 0.4 : 1 }}>mos</span>
            </div>
          </div>
          {errors.dob && (
            <div style={{ color: colors.red200, fontSize: fonts.size.xs, marginTop: 2, marginLeft: 4 }}>
              Please enter date of birth or age
            </div>
          )}

          <div style={{ ...styles.radioGroup, marginTop: "8px", ...(patientFieldsLocked ? { opacity: 0.65, pointerEvents: "none" as const } : {}) }}>
            {["Male", "Female", "Other"].map((g) => (
              <label key={g} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === g}
                  disabled={patientFieldsLocked}
                  onChange={() => setForm({ ...form, gender: g })}
                />
                {g}
              </label>
            ))}
          </div>
        </Card>

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
          />
        </div>

        <div style={styles.scheduleColumn}>
          {/* Schedule Mini Cards Stack */}
          <Card style={{ ...styles.card, ...styles.scheduleMiniCard }}>
            <div style={styles.radioGroup}>
              {["New", "Review"].map((t) => (
                <label key={t} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="type"
                    checked={form.type === t}
                    onChange={() => setForm({ ...form, type: t })}
                  />
                  {t}
                </label>
              ))}
            </div>
          </Card>

          <Card style={{ ...styles.card, ...styles.scheduleMiniCard, position: "relative" }}>
            <div
              style={{ ...styles.iconField, borderBottom: "none", cursor: "pointer", padding: 0 }}
              onClick={() => setShowDatePicker(true)}
            >
              <CalendarIcon style={styles.iconFieldIcon} />
              <span style={{ fontSize: fonts.size.m, color: form.date ? colors.neutral900 : colors.neutral400 }}>
                {formatDate(form.date) || "Select Date"}
              </span>
            </div>
            {showDatePicker && (
              <DatePicker
                selectedDate={form.date}
                onSelect={(date: Date) => {
                  setForm({ ...form, date });
                  setShowDatePicker(false);
                }}
                onClose={() => setShowDatePicker(false)}
                disablePast
              />
            )}
          </Card>

          <Card style={{ ...styles.card, ...styles.scheduleMiniCard, position: "relative", ...(errors.time ? { borderColor: colors.red200, backgroundColor: "rgba(255,0,0,0.05)" } : {}) }}>
            <div
              style={{ ...styles.iconField, borderBottom: "none", cursor: "pointer", padding: 0 }}
              onClick={() => setShowTimePicker(true)}
            >
              <ClockIcon style={styles.iconFieldIcon} />
              <span style={{ fontSize: fonts.size.m, color: form.time ? colors.neutral900 : colors.neutral400 }}>
                {form.time || "Select Time"}
              </span>
            </div>
            {showTimePicker && (
              <TimePicker
                initialTime={form.time}
                onSelect={(time: string) => {
                  setForm({ ...form, time });
                  setShowTimePicker(false);
                }}
                onClose={() => setShowTimePicker(false)}
              />
            )}
          </Card>
          {errors.time && (
            <div style={{ color: colors.red200, fontSize: fonts.size.xs, marginLeft: 4 }}>
              Please select a time
            </div>
          )}
        </div>

        {/* Appointment Details Card */}
        <Card style={{ ...styles.card, ...styles.appointmentDetailsCard }}>
          {(() => {
            const doctorLocked = editingAppointment?.payStatus?.toUpperCase() === "PAID";
            return (
              <div style={styles.appointmentRow}>
                <div style={styles.appointmentLabelGroup}>
                  <StethoscopeIcon style={styles.appointmentIcon} />
                  <label style={styles.fieldLabel}>Doctor</label>
                </div>
                <div style={{ flex: 1, pointerEvents: doctorLocked ? "none" : "auto", opacity: doctorLocked ? 0.6 : 1 }}>
                  <Select
                    options={doctors.map(d => ({ label: d.name, value: d.id }))}
                    value={selectedDoctorId}
                    onChange={(val: string) => setSelectedDoctorId(val)}
                    placeholder="Select Doctor"
                    error={errors.doctor}
                  />
                </div>
              </div>
            );
          })()}

          {(() => {
            const servicesLocked = editingAppointment?.payStatus?.toUpperCase() === "PAID";
            return <>
              {form.services.map((svc, i) => (
                <div key={i} style={styles.appointmentRow}>
                  <div style={styles.appointmentLabelGroup}>
                    <PulseIcon style={styles.appointmentIcon} />
                    <label style={styles.fieldLabel}>Service</label>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", pointerEvents: servicesLocked ? "none" : "auto", opacity: servicesLocked ? 0.6 : 1 }}>
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
                      />
                    </div>
                    {!servicesLocked ? (
                      <button
                        onClick={() => {
                          const removed = form.services[i];
                          const updated = form.services.filter((_, idx) => idx !== i);
                          setForm({ ...form, services: updated });
                          setToastMessage(`${removed} removed`);
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", flexShrink: 0 }}
                      >
                        <TrashIcon width={20} height={20} />
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
                    <PulseIcon style={styles.appointmentIcon} />
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
              {isDirty && (
                <button style={styles.pillButtonPrimary} onClick={() => handleBook(editingAppointment.payStatus || "Unpaid")} disabled={submitting}>
                  <EditPencilIcon width={18} height={18} style={{ color: colors.neutral100 }} />
                  {submitting ? "Saving..." : "Save Edits"}
                </button>
              )}
              {editingAppointment.payStatus?.toUpperCase() !== "PAID" && (
                <button style={styles.pillButtonPayDue} onClick={() => handleBook("Paid", "Payment is done")} disabled={submitting}>
                  <BillCheckIcon width={20} height={20} style={{ color: colors.neutral100 }} />
                  {submitting ? "Saving..." : "Pay Due"}
                </button>
              )}
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
                <PlusIcon style={{ width: "20px", height: "20px" }} />
                {submitting ? "Booking..." : "Book Now Pay Later"}
              </button>
              <button style={styles.pillButtonPrimary} onClick={() => handleBook("Paid")} disabled={submitting}>
                <CalendarIcon style={{ width: "20px", height: "20px", color: colors.neutral100 }} />
                {submitting ? "Booking..." : "Pay & Book"}
              </button>
            </>
          )}
        </div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}

const patientSuggStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 2000,
  backgroundColor: colors.neutral100,
  border: `${strokes.xs} solid ${colors.primary300}`,
  borderRadius: radii.m,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  marginTop: 4,
  padding: spacing["2xs"],
};

const patientSuggItem: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${spacing.xs} ${spacing.s}`,
  background: "transparent",
  border: "none",
  borderRadius: radii.xs,
  cursor: "pointer",
  textAlign: "left",
  gap: spacing.s,
  fontFamily: fonts.family.primary,
  fontSize: fonts.size.s,
  color: colors.neutral900,
};
