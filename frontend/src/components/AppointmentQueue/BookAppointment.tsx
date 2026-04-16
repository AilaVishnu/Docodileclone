import React, { useState, useEffect } from "react";
import { styles } from "./BookAppointment.styles";
import { colors } from "../../styles/theme";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";
import {
  StethoscopeIcon,
  PulseIcon,
  BackIcon,
  UserHandsIcon,
  LetterIcon,
  PhoneIcon,
  CalendarIcon,
  HashtagIcon,
  ClockIcon,
  PlusIcon
} from "../../iconsUtil";
import { Card } from "../Card/Card";
import { BillCard } from "../BillCard/BillCard";
import { UnderlineSelect } from "../Input/UnderlineSelect/UnderlineSelect";
import { Select } from "../Input/Select/Select";
import { Toast } from "../Toast";
import { API_BASE_URL } from "../../apiConfig";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash.svg";

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
  notes?: string;
  fee?: number;
};

type BookAppointmentProps = {
  doctors: Doctor[];
  initialDoctorId?: string;
  onBack: (successMessage?: string) => void;
  editingAppointment?: EditAppointmentData;
};

export function BookAppointment({ doctors, initialDoctorId, onBack, editingAppointment }: BookAppointmentProps) {
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

  const initTime = editingAppointment ? parseScheduledTime(editingAppointment.scheduledTime) : null;

  const [selectedDoctorId, setSelectedDoctorId] = useState(
    editingAppointment?.doctorId || initialDoctorId || (doctors.length > 0 ? doctors[0].id : "")
  );
  const [patientId] = useState(() => {
    const key = "docodile_patient_counter";
    const current = parseInt(localStorage.getItem(key) || "0", 10);
    return "T" + String(current + 1).padStart(3, "0");
  });
  const [form, setForm] = useState({
    name: editingAppointment?.patientName || "",
    email: editingAppointment?.patientEmail || "",
    phone: editingAppointment?.patientPhone || "",
    dob: "",
    age: editingAppointment?.patientAge ? String(editingAppointment.patientAge) : "",
    gender: editingAppointment?.patientGender || "Male",
    type: editingAppointment?.type || "New",
    services: editingAppointment?.service
      ? editingAppointment.service.split(" + ").filter(Boolean)
      : [],
    date: initTime?.date || new Date(),
    time: initTime?.timeStr || (() => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const period = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
    })(),
    paymentMethod: "Cash",
    note: editingAppointment?.notes || "",
    subtotal: editingAppointment?.fee || 500.0,
    tax: "" as string,
    discount: 0.0,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dobDigits, setDobDigits] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [taxMode, setTaxMode] = useState<"%" | "₹">("%");
  const [discountMode, setDiscountMode] = useState<"%" | "₹">("₹");

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatDob = (digits: string): string => {
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    if (digits.length <= 2) return dd;
    if (digits.length <= 4) {
      if (mm.length === 2) {
        const mIdx = Number(mm) - 1;
        return (mIdx >= 0 && mIdx <= 11) ? `${dd} ${MONTHS[mIdx]}` : `${dd} ${mm}`;
      }
      return `${dd} ${mm}`;
    }
    const mIdx = Number(mm) - 1;
    const monName = (mIdx >= 0 && mIdx <= 11) ? MONTHS[mIdx] : mm;
    return `${dd} ${monName} ${yyyy}`;
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
    let age = today.getFullYear() - birth.getFullYear();
    const mDiff = today.getMonth() - birth.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
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

  const handleBook = async (payStatus: string) => {
    if (!form.name.trim()) { setToastMessage("Please enter patient name"); return; }
    if (!form.email.trim()) { setToastMessage("Please enter email address"); return; }
    if (!isValidEmail(form.email)) { setToastMessage("Please enter a valid email address"); return; }
    if (!form.phone.trim() || form.phone.trim() === "+91") { setToastMessage("Please enter phone number"); return; }
    if (!isValidPhone(form.phone)) { setToastMessage("Please enter a valid 10-digit phone number"); return; }
    if (!form.dob && !form.age) { setToastMessage("Please enter date of birth or age"); return; }
    if (!activeDoctor) { setToastMessage("Please select a doctor"); return; }
    if (form.services.length === 0) { setToastMessage("Please select at least one service"); return; }

    setSubmitting(true);
    try {
      const { hour, minute } = parseTimeTo24h(form.time);
      const scheduledTime = new Date(form.date);
      scheduledTime.setHours(hour, minute, 0, 0);

      const body = {
        patientName: form.name,
        patientEmail: form.email || null,
        patientPhone: form.phone || null,
        patientGender: form.gender || null,
        patientDob: dobDigits.length === 8 ? `${dobDigits.slice(4,8)}-${dobDigits.slice(2,4)}-${dobDigits.slice(0,2)}` : null,
        patientAge: form.age ? Number(form.age) : null,
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
          const key = "docodile_patient_counter";
          const current = parseInt(localStorage.getItem(key) || "0", 10);
          localStorage.setItem(key, String(current + 1));
        }
        onBack(editingAppointment ? "Appointment updated successfully" : "Appointment booked successfully");
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

  const subtotal = Number(form.subtotal) || 0;
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
      <header style={styles.header}>
        <button style={styles.backButton} onClick={() => onBack()} title="Back to Appointments">
          <BackIcon style={{ color: colors.neutral700 }} />
        </button>

        <div style={styles.titleContainer}>
          <h2 style={styles.title}>
            Book an appointment for{" "}
            <UnderlineSelect
              options={doctors.map(d => ({ label: d.name, value: d.id }))}
              value={selectedDoctorId}
              onChange={(val) => setSelectedDoctorId(val)}
              placeholder="Select Doctor"
              fontSize="24px"
            />
          </h2>
        </div>
      </header>

      <div style={styles.grid}>
        {/* Patient ID Card */}
        <Card style={{ ...styles.card, ...styles.patientIdCard }}>
          <span style={{ fontSize: "14px", color: colors.neutral500 }}>Patient ID</span>
          <h1 style={styles.patientIdText}>{patientId}</h1>
        </Card>

        {/* Patient Details Card */}
        <Card style={{ ...styles.card, ...styles.formCard }}>
          <div style={styles.iconField}>
            <UserHandsIcon style={styles.iconFieldIcon} />
            <input
              style={styles.iconFieldInput}
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.iconField}>
              <LetterIcon style={styles.iconFieldIcon} />
              <input
                style={styles.iconFieldInput}
                type="text"
                placeholder="hello@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => setForm((prev) => ({ ...prev, email: prev.email.trim().toLowerCase() }))}
              />
            </div>
            <div style={{ ...styles.iconField, width: "180px" }}>
              <PhoneIcon style={styles.iconFieldIcon} />
              <input
                style={styles.iconFieldInput}
                placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9+ ]/g, "");
                  // Extract only digits to check length
                  let digits = val.replace(/\D/g, "");
                  if (digits.startsWith("91") && digits.length > 10) digits = digits.substring(2);
                  if (digits.length > 10) return; // Block input beyond 10 digits
                  setForm({ ...form, phone: val });
                }}
                onBlur={() => {
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
          </div>

          <div style={styles.row}>
            <div style={styles.iconField}>
              <CalendarIcon style={styles.iconFieldIcon} />
              <input
                style={styles.iconFieldInput}
                type="text"
                placeholder="DD MM YYYY"
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
                onFocus={() => {
                  // Keep digits so user can backspace and edit
                }}
              />
            </div>
            <div style={{ fontSize: "16px", color: colors.neutral900 }}>or</div>
            <div style={{ ...styles.iconField, width: "180px" }}>
              <HashtagIcon style={styles.iconFieldIcon} />
              <input
                style={styles.iconFieldInput}
                placeholder="Age"
                type="number"
                min="0"
                max="150"
                value={form.age}
                onChange={(e) => {
                  const ageStr = e.target.value;
                  setDobDigits("");
                  setForm({ ...form, age: ageStr, dob: "" });
                }}
              />
            </div>
          </div>

          <div style={{ ...styles.radioGroup, marginTop: "8px" }}>
            {["Male", "Female", "Other"].map((g) => (
              <label key={g} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === g}
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
            onPaymentMethodChange={(m) => setForm({ ...form, paymentMethod: m })}
            note={form.note}
            onNoteChange={(n) => setForm({ ...form, note: n })}
            subtotal={form.subtotal}
            onSubtotalChange={(v) => setForm({ ...form, subtotal: v })}
            tax={form.tax}
            onTaxChange={(v) => setForm({ ...form, tax: v })}
            discount={form.discount}
            onDiscountChange={(v) => setForm({ ...form, discount: v })}
            total={Math.round(total)}
            onTaxModeChange={setTaxMode}
            onDiscountModeChange={setDiscountMode}
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
              <span style={{ fontSize: "16px", color: form.date ? colors.neutral900 : colors.neutral500 }}>
                {formatDate(form.date) || "Select Date"}
              </span>
            </div>
            {showDatePicker && (
              <div style={{ position: "absolute", bottom: "100%", left: "50%", zIndex: 1100 }}>
                <DatePicker
                  selectedDate={form.date}
                  onSelect={(date: Date) => {
                    setForm({ ...form, date });
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                  style={{ top: "auto", bottom: "8px" }}
                />
              </div>
            )}
          </Card>

          <Card style={{ ...styles.card, ...styles.scheduleMiniCard, position: "relative" }}>
            <div
              style={{ ...styles.iconField, borderBottom: "none", cursor: "pointer", padding: 0 }}
              onClick={() => setShowTimePicker(true)}
            >
              <ClockIcon style={styles.iconFieldIcon} />
              <span style={{ fontSize: "16px", color: form.time ? colors.neutral900 : colors.neutral500 }}>
                {form.time || "Select Time"}
              </span>
            </div>
            {showTimePicker && (
              <div style={{ position: "absolute", bottom: "100%", left: "50%", zIndex: 1100 }}>
                <TimePicker
                  initialTime={form.time}
                  onSelect={(time: string) => {
                    setForm({ ...form, time });
                    setShowTimePicker(false);
                  }}
                  onClose={() => setShowTimePicker(false)}
                  style={{ top: "auto", bottom: "8px" }}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Appointment Details Card */}
        <Card style={{ ...styles.card, ...styles.appointmentDetailsCard }}>
          <div style={styles.appointmentRow}>
            <div style={styles.appointmentLabelGroup}>
              <StethoscopeIcon style={styles.appointmentIcon} />
              <label style={styles.fieldLabel}>Doctor</label>
            </div>
            <div style={{ flex: 1 }}>
              <Select
                options={doctors.map(d => ({ label: d.name, value: d.id }))}
                value={selectedDoctorId}
                onChange={(val: string) => setSelectedDoctorId(val)}
                placeholder="Select Doctor"
              />
            </div>
          </div>

          {form.services.map((svc, i) => (
            <div key={i} style={styles.appointmentRow}>
              <div style={styles.appointmentLabelGroup}>
                <PulseIcon style={styles.appointmentIcon} />
                <label style={styles.fieldLabel}>Service</label>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <Select
                    options={["Consultation", "PRP", "Hydrafacial", "Laser Hair Removal", "Skin Tag Removal", "Acne Scar Treatment"]}
                    value={svc}
                    onChange={(val: string) => {
                      const updated = [...form.services];
                      updated[i] = val;
                      setForm({ ...form, services: updated });
                    }}
                    placeholder="Select Service"
                  />
                </div>
                <button
                  onClick={() => {
                    const updated = form.services.filter((_, idx) => idx !== i);
                    setForm({ ...form, services: updated });
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", flexShrink: 0 }}
                >
                  <TrashIcon width={20} height={20} />
                </button>
              </div>
            </div>
          ))}
          <div style={styles.appointmentRow}>
            <div style={styles.appointmentLabelGroup}>
              <PulseIcon style={styles.appointmentIcon} />
              <label style={styles.fieldLabel}>Service</label>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1 }}>
                <Select
                  options={["Consultation", "PRP", "Hydrafacial", "Laser Hair Removal", "Skin Tag Removal", "Acne Scar Treatment"]}
                  value=""
                  onChange={(val: string) => setForm({ ...form, services: [...form.services, val] })}
                  placeholder="+ Add Service"
                />
              </div>
              <div style={{ width: "28px", flexShrink: 0 }} />
            </div>
          </div>
        </Card>

        {/* Footer Buttons */}
        <div style={styles.footerButtonGroup}>
          <button style={styles.pillButtonSecondary} onClick={() => handleBook("Unpaid")} disabled={submitting}>
            <PlusIcon style={{ width: "20px", height: "20px" }} />
            {submitting ? "Booking..." : "Book Now Pay Later"}
          </button>
          <button style={styles.pillButtonPrimary} onClick={() => handleBook("Paid")} disabled={submitting}>
            <CalendarIcon style={{ width: "20px", height: "20px", color: "white" }} />
            {submitting ? "Booking..." : "Pay & Book"}
          </button>
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
