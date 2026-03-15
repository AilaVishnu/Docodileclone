import React, { useState, useEffect } from "react";
import { styles } from "./BookAppointment.styles";
import { colors } from "../../styles/theme";
import { DatePicker } from "./DatePicker";
import { Button } from "../Button";
import { 
  StethoscopeIcon, 
  PulseIcon, 
  BackIcon, 
  UserHandsIcon, 
  LetterIcon, 
  PhoneIcon, 
  CalendarIcon, 
  HashtagIcon, 
  ClockIcon 
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
        <div style={{ ...styles.column, ...styles.leftColumn }}>
          {/* Patient ID Card */}
          <Card style={{ ...styles.card, ...styles.patientIdCard }}>
            <span style={{ fontSize: "14px", color: colors.neutral500 }}>Patient ID</span>
            <h1 style={styles.patientIdText}>{patientId}</h1>
          </Card>

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
              <div style={{ position: "absolute", bottom: "100%", left: 0, zIndex: 1000 }}>
                <DatePicker 
                  selectedDate={form.date}
                  onSelect={(date: Date) => {
                    setForm({ ...form, date });
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              </div>
            )}
          </Card>

          <Card style={{ ...styles.card, ...styles.scheduleMiniCard }}>
            <div style={{ ...styles.iconField, borderBottom: "none", padding: 0 }}>
              <ClockIcon style={styles.iconFieldIcon} />
              <input 
                style={styles.iconFieldInput} 
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </Card>
        </div>

        <div style={{ ...styles.column, ...styles.centerColumn }}>
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
              <select style={styles.select} value={form.service} onChange={(e) => setForm({...form, service: e.target.value})}>
                <option value="Consultation">Consultation</option>
              </select>
            </div>
          </Card>
        </div>

        <div style={{ ...styles.column, ...styles.rightColumn }}>
          {/* Billing Card */}
          <Card style={{ ...styles.card, ...styles.billingCard }}>
            <h3 style={{ margin: 0, fontSize: "18px" }}>Payment & Bill</h3>
            
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Payment Method</label>
              <div style={{ ...styles.radioGroup, flexWrap: "wrap", gap: "12px" }}>
                {["Cash", "Card", "UPI", "No Bill"].map((m) => (
                  <label key={m} style={styles.radioLabel}>
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

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Note</label>
              <textarea 
                style={{ ...styles.input, height: "60px", resize: "none" }}
                placeholder="Internal notes..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <div style={styles.billingRow}>
                <span>Subtotal</span>
                <input 
                  style={{ ...styles.input, width: "100px", padding: "4px 8px" }}
                  type="number"
                  value={form.subtotal}
                  onChange={(e) => setForm({ ...form, subtotal: Number(e.target.value) })}
                />
              </div>
              <div style={styles.billingRow}>
                <span>Tax</span>
                <input 
                  style={{ ...styles.input, width: "100px", padding: "4px 8px" }}
                  type="number"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })}
                />
              </div>
              <div style={styles.billingRow}>
                <span>Discount</span>
                <input 
                  style={{ ...styles.input, width: "100px", padding: "4px 8px" }}
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                />
              </div>
              <div style={styles.totalRow}>
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <Button variant="secondary" style={{ flex: 1 }}>Print</Button>
              <Button variant="primary" style={{ flex: 1 }}>Generate</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
