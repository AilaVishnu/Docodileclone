import React, { useState, useEffect, useRef } from "react";
import { styles } from "./WalkInModal.styles";
import { Button } from "../Button";
import {
  searchPatients,
  createAppointment,
  PatientSearchResult,
  AppointmentType,
  PaymentMode,
} from "../../services/appointmentService";

type WalkInModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export function WalkInModal({ onClose, onSuccess }: WalkInModalProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  // New patient form
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState("");

  // Appointment details
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("CONSULTATION");
  const [fee, setFee] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode | "">("");

  // Loading/error state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Search patients as user types
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPatients(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  // Auto-fill phone for new patient if searching by number
  useEffect(() => {
    if (isNewPatient && /^\d+$/.test(searchQuery)) {
      setNewPatientPhone(searchQuery);
    }
  }, [isNewPatient, searchQuery]);

  const handleSelectPatient = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setShowResults(false);
    setSearchQuery("");
    setIsNewPatient(false);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setIsNewPatient(false);
  };

  const handleAddNewPatient = () => {
    setIsNewPatient(true);
    setShowResults(false);
    if (/^\d+$/.test(searchQuery)) {
      setNewPatientPhone(searchQuery);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    try {
      // Validate
      if (!selectedPatient && !isNewPatient) {
        throw new Error("Please select or add a patient");
      }

      if (isNewPatient) {
        if (!newPatientName.trim()) {
          throw new Error("Patient name is required");
        }
        if (!newPatientPhone.trim()) {
          throw new Error("Phone number is required");
        }
      }

      // For now, use a hardcoded doctor ID (would come from context in real app)
      const doctorId = localStorage.getItem("docodile_user_id") || "00000000-0000-0000-0000-000000000000";

      await createAppointment({
        patientId: selectedPatient?.id,
        newPatient: isNewPatient
          ? {
              name: newPatientName.trim(),
              phone: newPatientPhone.trim(),
              gender: newPatientGender || undefined,
              age: newPatientAge ? parseInt(newPatientAge) : undefined,
            }
          : undefined,
        doctorId,
        type: appointmentType,
        fee: fee ? parseFloat(fee) : undefined,
        paymentMode: paymentMode || undefined,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Walk-in Appointment</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Patient Section */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Patient</p>

          {selectedPatient ? (
            <div style={styles.selectedPatient}>
              <div style={styles.selectedPatientInfo}>
                <p style={styles.searchResultName}>{selectedPatient.name}</p>
                <p style={styles.searchResultMeta}>
                  {selectedPatient.phone}
                  {selectedPatient.age && ` • ${selectedPatient.age}y`}
                  {selectedPatient.gender && ` • ${selectedPatient.gender}`}
                </p>
              </div>
              <button style={styles.changeButton} onClick={handleClearPatient}>
                Change
              </button>
            </div>
          ) : isNewPatient ? (
            <>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name *</label>
                  <input
                    style={styles.input}
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="Patient name"
                    autoFocus
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone *</label>
                  <input
                    style={styles.input}
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    placeholder="Mobile number"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Age</label>
                  <input
                    style={styles.input}
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(e.target.value)}
                    placeholder="Age"
                    type="number"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gender</label>
                  <select
                    style={styles.select}
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button style={styles.changeButton} onClick={handleClearPatient}>
                ← Search existing patient
              </button>
            </>
          ) : (
            <div style={styles.searchContainer}>
              <input
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by phone or name..."
                autoFocus
              />
              {showResults && (
                <div style={styles.searchResults}>
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      style={styles.searchResultItem}
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <p style={styles.searchResultName}>{patient.name}</p>
                      <p style={styles.searchResultMeta}>
                        {patient.phone}
                        {patient.age && ` • ${patient.age}y`}
                      </p>
                    </div>
                  ))}
                  {searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div style={styles.searchResultItem} onClick={handleAddNewPatient}>
                      <p style={styles.searchResultName}>+ Add new patient</p>
                      <p style={styles.searchResultMeta}>No matches found</p>
                    </div>
                  )}
                </div>
              )}
              {searchQuery.length >= 2 && searchResults.length > 0 && (
                <div style={styles.divider}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerText}>or</span>
                  <div style={styles.dividerLine} />
                </div>
              )}
              {searchQuery.length >= 2 && (
                <Button variant="light" size="sm" onClick={handleAddNewPatient}>
                  + Add as new patient
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Appointment Type */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Appointment Type</p>
          <div style={styles.typeToggle}>
            <button
              style={{
                ...styles.typeButton,
                ...(appointmentType === "CONSULTATION" ? styles.typeButtonActive : {}),
              }}
              onClick={() => setAppointmentType("CONSULTATION")}
            >
              Consultation
            </button>
            <button
              style={{
                ...styles.typeButton,
                ...(appointmentType === "REVIEW" ? styles.typeButtonActive : {}),
              }}
              onClick={() => setAppointmentType("REVIEW")}
            >
              Review
            </button>
          </div>
        </div>

        {/* Fee & Payment */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Fee & Payment</p>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fee (₹)</label>
              <input
                style={styles.input}
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="500"
                type="number"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Mode</label>
              <select
                style={styles.select}
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode | "")}
              >
                <option value="">Select</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Footer */}
        <div style={styles.footer}>
          <Button variant="light" size="md" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={submitting || (!selectedPatient && !isNewPatient)}
          >
            {submitting ? "Adding..." : "Add to Queue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
