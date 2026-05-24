import React, { useEffect, useState } from "react";
import { Tabs, TabItem } from "../Tabs";
import { QueueTable, Appointment } from "./QueueTable";
import { styles } from "./AppointmentQueue.styles";
import { DatePicker } from "./DatePicker";
import { colors } from "../../styles/theme";
import { BookAppointment, EditAppointmentData } from "./BookAppointment";
import { BillMedicinesModal } from "./BillMedicinesModal";
import { DoctorStatusCard } from "./DoctorStatusCard";
import { HeatmapCard } from "./HeatmapCard";
import { Toast } from "../Toast";
import { Button } from "../Button";
import { confirmStyles } from "../AddStaffModal/AddStaffModal.styles";
import { API_BASE_URL } from "../../apiConfig";

type Doctor = {
  id: string;
  name: string;
};

type BillingMedicine = {
  id: string;
  name: string;
  dosage?: string;
  unitPrice: number;
  qty: number;
};

type AppointmentQueueProps = {
  isBooking?: boolean;
  bookingKey?: number;
  onBack?: () => void;
  onEditStart?: () => void;
  onViewPatientFile?: (patient: import("../../hooks/usePatients").Patient, appointmentId: string, doctorId: string) => void;
};

export function AppointmentQueue({ isBooking, bookingKey, onBack, onEditStart, onViewPatientFile }: AppointmentQueueProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeDoctorId, setActiveDoctorId] = useState<string>("");
  const [appointments, setAppointments] = useState<Record<string, Appointment[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingAppointment, setEditingAppointment] = useState<EditAppointmentData | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [medsBillingApt, setMedsBillingApt] = useState<Appointment | null>(null);
  const [billingMedicines, setBillingMedicines] = useState<BillingMedicine[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);

  const doStatusChange = async (aptId: string, newStatus: string) => {
    const token = localStorage.getItem("docodile_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/tenant/appointments/${aptId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setToastMessage("Failed to update status");
        return;
      }
    } catch {
      setToastMessage("Network error while updating status");
      return;
    }
    setAppointments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((docId) => {
        const idx = updated[docId].findIndex((a) => a.id === aptId);
        if (idx === -1) return;
        const others = updated[docId].filter((a) => a.id !== aptId);
        const moved = { ...updated[docId][idx], status: newStatus as any };
        updated[docId] = [...others, moved];
      });
      return updated;
    });
    const statusLabel: Record<string, string> = {
      "WAITING": "Marked as Arrived",
      "IN_PROGRESS": "Sent to doctor",
      "COMPLETED": "Marked as Completed",
      "NO_SHOW": "Marked as No-Show",
      "CANCELLED": "Appointment cancelled",
    };
    setToastMessage(statusLabel[newStatus] || "Status updated");
  };

  // Clear editing state when New Appointment is clicked
  useEffect(() => {
    if (isBooking) {
      setEditingAppointment(undefined);
    }
  }, [bookingKey]);

  // Fetch real prescription Rx rows for the selected patient when Bill Medicines opens
  useEffect(() => {
    if (!medsBillingApt?.patientId) {
      setBillingMedicines([]);
      return;
    }
    const patientId = medsBillingApt.patientId;
    setBillingLoading(true);
    const token = localStorage.getItem("docodile_token");
    fetch(`${API_BASE_URL}/api/patients/${patientId}/visits`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((visits: any[]) => {
        // visits are sorted ASC; last entry is the most recent
        const latest = visits[visits.length - 1];
        const rows: BillingMedicine[] = (latest?.prescriptions ?? [])
          .filter((p: any) => p.medicine)
          .map((p: any, i: number) => ({
            id: p.id ?? `rx-${i}`,
            name: p.medicine as string,
            dosage: [p.dosage, p.frequency, p.duration].filter(Boolean).join(" · ") || undefined,
            unitPrice: 0,
            qty: 1,
          }));
        setBillingMedicines(rows);
      })
      .catch(() => setBillingMedicines([]))
      .finally(() => setBillingLoading(false));
  }, [medsBillingApt]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("docodile_token");
      const clinicId = localStorage.getItem("docodile_clinic_id");

      if (!token || !clinicId) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Fetch Doctors of the clinic
        if (doctors.length === 0) {
          const docRes = await fetch(`${API_BASE_URL}/api/doctors`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (docRes.ok) {
            const docData = await docRes.json();
            const doctorList = docData.map((d: any) => ({ id: d.id, name: d.name }));
            
            setDoctors(doctorList);
            if (doctorList.length > 0) {
              setActiveDoctorId(doctorList[0].id);
            }
          }
        }

        // 2. Fetch appointments for selected date
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const aptRes = await fetch(`${API_BASE_URL}/api/tenant/appointments?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (aptRes.ok) {
          const aptData = await aptRes.json();
          const grouped: Record<string, Appointment[]> = {};

          aptData.forEach((apt: any) => {
            if (!grouped[apt.doctorId]) {
              grouped[apt.doctorId] = [];
            }
            grouped[apt.doctorId].push({
              id: apt.id,
              patientId: apt.patientId,
              patientName: apt.patientName,
              patientPhone: apt.patientPhone,
              type: apt.type?.toUpperCase() === "REVIEW" ? "Review" : "New",
              service: apt.service || "",
              scheduledTime: apt.scheduledTime ? new Date(apt.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Walk-in",
              rawScheduledTime: apt.scheduledTime || undefined,
              isWalkin: apt.isWalkin,
              status: apt.status || "WAITING",
              payStatus: apt.payStatus || "DUE",
              paymentMethod: apt.paymentMethod || "",
              doctorId: apt.doctorId,
              patientEmail: apt.patientEmail || "",
              patientGender: apt.patientGender || "",
              patientDob: apt.patientDob || "",
              patientAge: apt.patientAge || undefined,
              notes: apt.notes || "",
              fee: apt.fee || 0,
            });
          });

          setAppointments(grouped);
        }
      } catch (error) {
        console.error("Failed to fetch queue data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, refreshKey]);

  const tabItems: TabItem[] = doctors.map(d => ({
    id: d.id,
    label: d.name
  }));

  const STATUS_PRIORITY: Record<string, number> = {
    "IN_PROGRESS": 0,
    "WAITING": 1,
    "BOOKED": 2,
    "SCHEDULED": 2,
    "COMPLETED": 3,
    "NO_SHOW": 4,
    "CANCELLED": 5,
  };

  const activeQueue = (activeDoctorId ? appointments[activeDoctorId] || [] : [])
    .slice()
    .sort((a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99));

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const dateText = isToday(selectedDate) ? "Today's" : formatDate(selectedDate);

  if (isLoading && doctors.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Queue...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={{ ...styles.header, marginBottom: "24px", position: "relative" }}>
        <div style={{ flex: 1 }} />
        <h1 style={{ ...styles.title, position: "absolute", left: "50%", transform: "translateX(-50%)", zIndex: showDatePicker ? 1100 : "auto" }}>
          <span
            onClick={() => setShowDatePicker(!showDatePicker)}
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              color: colors.neutral900,
              position: "relative",
              display: "inline-block",
            }}
          >
            {dateText}
            {showDatePicker && (
              <DatePicker
                selectedDate={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setShowDatePicker(false);
                }}
                onClose={() => setShowDatePicker(false)}
                style={{
                  top: "calc(100% + 12px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
                showDoneButton
              />
            )}
          </span> Queue
        </h1>

        {showDatePicker && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1050,
            }}
            onClick={() => setShowDatePicker(false)}
          />
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          {/* Internal booking trigger removed in favor of TopNav trigger */}
        </div>
      </header>

      {(isBooking || editingAppointment) && (
        <BookAppointment
          key={`booking-${bookingKey}-${editingAppointment?.id || "new"}`}
          doctors={doctors}
          initialDoctorId={activeDoctorId}
          onBack={(msg?: string) => {
            setEditingAppointment(undefined);
            setRefreshKey((k) => k + 1);
            if (msg) setToastMessage(msg);
            onBack?.();
          }}
          editingAppointment={editingAppointment}
          bookingKey={bookingKey}
        />
      )}

      {!isBooking && !editingAppointment && doctors.length > 0 ? (
        <>
          <Tabs
            items={tabItems}
            activeId={activeDoctorId}
            onSelect={setActiveDoctorId}
          />
          <div style={{ display: "flex", gap: "24px", minWidth: 0, width: "100%" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
          <QueueTable
            appointments={activeQueue}
            doctorName={doctors.find(d => d.id === activeDoctorId)?.name}
            menuItems={[
              { label: "Edit Appointment", onClick: (apt) => {
                setEditingAppointment({
                  id: apt.id,
                  patientName: apt.patientName,
                  patientPhone: apt.patientPhone,
                  patientEmail: apt.patientEmail,
                  patientGender: apt.patientGender,
                  patientDob: apt.patientDob,
                  patientAge: apt.patientAge,
                  service: apt.service,
                  type: apt.type,
                  scheduledTime: apt.rawScheduledTime || "",
                  doctorId: apt.doctorId || activeDoctorId,
                  payStatus: apt.payStatus,
                  paymentMethod: apt.paymentMethod,
                  notes: apt.notes,
                  fee: apt.fee,
                });
                onEditStart?.();
              } },
              { label: "View Patient File", onClick: (apt) => {
                // Pass the full patient + appointment context so the host can
                // route directly into the patient's prescription/visit view
                // (same as PrescriptionQueue's View Pad path) instead of just
                // highlighting the row in the Patient Files index.
                if (apt.patientId && onViewPatientFile) {
                  onViewPatientFile({
                    id: apt.patientId,
                    name: apt.patientName,
                    phone: apt.patientPhone ?? null,
                    email: apt.patientEmail ?? null,
                    gender: apt.patientGender ?? null,
                    dob: apt.patientDob ?? null,
                    age: apt.patientAge ?? null,
                    lastVisitDate: null,
                    treatingDoctorIds: [],
                    treatingDepartments: [],
                  }, apt.id, apt.doctorId || activeDoctorId);
                }
              } },
              { label: "Bill Medicines", onClick: (apt) => {
                setMedsBillingApt(apt);
              } },
            ]}
            onStatusChange={async (aptId, newStatus) => {
              if (newStatus === "CANCELLED") {
                setPendingCancelId(aptId);
                return;
              }
              await doStatusChange(aptId, newStatus);
            }}
          />
          </div>
          <div style={{ marginTop: "-30px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <DoctorStatusCard
              doctorName={doctors.find(d => d.id === activeDoctorId)?.name || ""}
              doctorGender="male"
              appointments={activeQueue}
            />
            <HeatmapCard appointments={activeQueue} />
          </div>
          </div>
        </>
      ) : (
        <div style={{ padding: "48px", textAlign: "center", backgroundColor: colors.neutral100, borderRadius: "24px" }}>
          No doctors found for this clinic. Please add staff in Clinic Setup.
        </div>
      )}

      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />

      {pendingCancelId && (
        <div style={confirmStyles.overlay}>
          <div style={confirmStyles.dialog}>
            <h4 style={confirmStyles.title}>Are you sure?</h4>
            <div style={confirmStyles.actions}>
              <Button variant="dangerLight" size="sm" onClick={() => setPendingCancelId(null)}>
                Nope
              </Button>
              <Button variant="dark" size="sm" onClick={() => {
                const id = pendingCancelId;
                setPendingCancelId(null);
                if (id) doStatusChange(id, "CANCELLED");
              }}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      <BillMedicinesModal
        isOpen={!!medsBillingApt}
        onClose={() => setMedsBillingApt(null)}
        onBilled={(method, total) => {
          const inr = total.toLocaleString("en-IN", { minimumFractionDigits: 2 });
          const msg = method === "Waive"
            ? `Bill waived for ${medsBillingApt?.patientName}`
            : `₹${inr} billed via ${method} for ${medsBillingApt?.patientName}`;
          setToastMessage(msg);
        }}
        patientName={medsBillingApt?.patientName || ""}
        medicines={billingMedicines}
        loading={billingLoading}
        pendingDue={medsBillingApt?.payStatus === "DUE" ? (medsBillingApt.fee ?? 500) : 0}
      />
    </div>
  );
}
