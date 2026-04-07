import React, { useState } from "react";
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
import { UnderlineSelect } from "../Input/UnderlineSelect/UnderlineSelect";
import { Toast } from "../Toast";
import { API_BASE_URL } from "../../apiConfig";

type Doctor = {
  id: string;
  name: string;
};

type BookAppointmentProps = {
  doctors: Doctor[];
  initialDoctorId?: string;
  onBack: () => void;
};

export function BookAppointment({ doctors, initialDoctorId, onBack }: BookAppointmentProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || (doctors.length > 0 ? doctors[0].id : ""));
  const [patientId] = useState("T023"); // Default for now
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    age: "",
    gender: "Male",
    type: "New", // New or Review
    service: "Consultation",
    date: new Date(),
    time: "10:00 AM",
    paymentMethod: "Cash",
    note: "",
    subtotal: 500.0,
    tax: 0.0,
    discount: 0.0,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dobDigits, setDobDigits] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
        patientDob: form.dob || null,
        doctorId: selectedDoctorId,
        scheduledTime: scheduledTime.getFullYear() + "-" +
          String(scheduledTime.getMonth() + 1).padStart(2, "0") + "-" +
          String(scheduledTime.getDate()).padStart(2, "0") + "T" +
          String(scheduledTime.getHours()).padStart(2, "0") + ":" +
          String(scheduledTime.getMinutes()).padStart(2, "0") + ":00",
        type: form.type,
        service: form.service,
        isWalkin: false,
        paymentMethod: form.paymentMethod,
        notes: form.note || null,
        fee: total > 0 ? total : null,
        payStatus,
      };

      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onBack();
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

  const total = (Number(form.subtotal) || 0) + (Number(form.tax) || 0) - (Number(form.discount) || 0);

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
        <button style={styles.backButton} onClick={onBack} title="Back to Appointments">
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
                onChange={() => {}}
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
        <Card style={{ ...styles.card, ...styles.billingCard }}>
          <h3 style={styles.billingTitle}>Bill</h3>
          
          <div style={styles.billingRowInline}>
            <label style={styles.billingLabel}>Method</label>
            <div style={styles.radioGroupInline}>
              {["Cash", "Card", "UPI", "No Bill"].map((m) => (
                <label key={m} style={styles.radioLabelSmall}>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={form.paymentMethod === m}
                    onChange={() => setForm({ ...form, paymentMethod: m })}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div style={styles.billingRowInline}>
            <label style={styles.billingLabel}>Note</label>
            <div style={styles.billingValueArea}>
              <input 
                style={styles.borderlessInput}
                placeholder="Internal notes..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
            <div style={styles.billingRowInline}>
              <label style={styles.billingLabel}>Subtotal</label>
              <div style={styles.billingValueArea}>
                <input 
                  style={styles.borderlessInput}
                  type="number"
                  value={form.subtotal}
                  onChange={(e) => setForm({ ...form, subtotal: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={styles.billingRowInline}>
              <label style={styles.billingLabel}>Tax</label>
              <div style={styles.billingValueArea}>
                <input 
                  style={styles.borderlessInput}
                  type="number"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={styles.billingRowInline}>
              <label style={styles.billingLabel}>Discount</label>
              <div style={styles.billingValueArea}>
                <input 
                  style={styles.borderlessInput}
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={styles.totalRow}>
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

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
            <select
              style={styles.select}
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.appointmentRow}>
            <div style={styles.appointmentLabelGroup}>
              <PulseIcon style={styles.appointmentIcon} />
              <label style={styles.fieldLabel}>Service</label>
            </div>
            <select style={styles.select} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
              <option value="Consultation">Consultation</option>
            </select>
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
