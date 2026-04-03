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
            Book an appointment for
            <span style={styles.clickableDoctor} onClick={handleDoctorCycle}>
              {activeDoctor?.name}
            </span>
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
                placeholder="hello@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div style={{ ...styles.iconField, width: "180px" }}>
              <PhoneIcon style={styles.iconFieldIcon} />
              <input
                style={styles.iconFieldInput}
                placeholder="+91xxxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.iconField}>
              <CalendarIcon style={styles.iconFieldIcon} />
              <input
                style={styles.iconFieldInput}
                type="text"
                placeholder="Enter date of birth"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
              />
            </div>
            <div style={{ fontSize: "16px", color: colors.neutral900 }}>or</div>
            <div style={{ ...styles.iconField, width: "180px" }}>
              <HashtagIcon style={styles.iconFieldIcon} />
              <input
                style={styles.iconFieldInput}
                placeholder="Age"
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
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
              style={{ ...styles.iconField, borderBottom: "none", cursor: "pointer", padding: 0, justifyContent: "space-between" }}
              onClick={() => setShowTimePicker(true)}
            >
              <span style={{ fontSize: "16px", color: form.time ? colors.neutral900 : colors.neutral500 }}>
                {form.time || "Select Time"}
              </span>
              <ClockIcon style={styles.iconFieldIcon} />
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
          <button style={styles.pillButtonSecondary}>
            <PlusIcon style={{ width: "20px", height: "20px" }} />
            Book Now Pay Later
          </button>
          <button style={styles.pillButtonPrimary}>
            <CalendarIcon style={{ width: "20px", height: "20px", color: "white" }} />
            Pay & Book
          </button>
        </div>
      </div>
    </div>
  );
}
