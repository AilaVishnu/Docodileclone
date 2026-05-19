import React, { useEffect, useMemo, useState } from "react";
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
import { listPharmacyStock, deductPharmacyStock } from "../../api/pharmacy";

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
  // Clinic pharmacy inventory — drives both the unit prices used when
  // seeding the bill from a prescription and the "Add medicine" catalog
  // dropdown. Fetched once on mount; cheap (a few hundred SKUs at most)
  // and the bill modal opens often enough that pre-fetching is a win.
  const [pharmacyStock, setPharmacyStock] = useState<{ id: string; name: string; unitPrice: number }[]>([]);
  useEffect(() => {
    listPharmacyStock()
      .then((meds) => {
        // Collapse multiple batches of the same medicine name into one
        // catalog row — pick the lowest in-stock unit price so the bill
        // never overcharges for a med the clinic has cheaper batches of.
        const byName = new Map<string, { id: string; name: string; unitPrice: number }>();
        for (const m of meds) {
          const key = m.name.trim().toLowerCase();
          if (!key) continue;
          const existing = byName.get(key);
          if (!existing || m.unitPrice < existing.unitPrice) {
            byName.set(key, { id: m.id, name: m.name.trim(), unitPrice: m.unitPrice });
          }
        }
        setPharmacyStock(Array.from(byName.values()));
      })
      .catch(() => setPharmacyStock([]));
  }, []);
  // Lookup map keyed by lowercase med name. Used to attach a unit price
  // when seeding billing rows from a prescription that has no price.
  const priceByName = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of pharmacyStock) m.set(p.name.toLowerCase(), p.unitPrice);
    return m;
  }, [pharmacyStock]);

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
    // Derive the dispensary quantity from the prescription itself so the
    // receptionist doesn't have to mentally compute
    // (units/dose × doses/day × days). Falls back to 1 when any field is
    // missing or non-numeric (e.g. SOS, "As directed").
    const parseDurationDays = (d?: string): number | null => {
      if (!d) return null;
      const m = d.match(/(\d+)\s*(day|week|month|year|d|w|m|y)?/i);
      if (!m) return null;
      const n = parseInt(m[1], 10);
      if (!Number.isFinite(n) || n <= 0) return null;
      const unit = (m[2] ?? "day").toLowerCase();
      if (unit.startsWith("w")) return n * 7;
      if (unit.startsWith("mon") || unit === "m") return n * 30;
      if (unit.startsWith("y")) return n * 365;
      return n; // days / unknown unit
    };
    const computeQty = (dosage?: string, frequency?: string, duration?: string): number | null => {
      const dosageMatch = (dosage ?? "").match(/([\d.]+)/);
      const unitsPerDose = dosageMatch ? parseFloat(dosageMatch[1]) : 1;
      const dosesPerDay = (frequency ?? "")
        .split(/[-+,/\s]+/)
        .map((p) => parseInt(p, 10))
        .filter((n) => Number.isFinite(n))
        .reduce((a, b) => a + b, 0);
      const days = parseDurationDays(duration);
      if (!dosesPerDay || !days || !Number.isFinite(unitsPerDose) || unitsPerDose <= 0) return null;
      return Math.ceil(unitsPerDose * dosesPerDay * days);
    };
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
          .map((p: any, i: number) => {
            const name = p.medicine as string;
            const stocked = priceByName.get(name.trim().toLowerCase());
            return {
              id: p.id ?? `rx-${i}`,
              name,
              dosage: [p.dosage, p.frequency, p.duration].filter(Boolean).join(" · ") || undefined,
              // Look up the clinic's pharmacy unit price by name. Falls
              // back to 0 for prescribed meds the clinic doesn't stock
              // (doctor / pharmacy can override in the modal). inStock
              // drives the modal's "not in inventory" highlight + the
              // editable price field for that row.
              unitPrice: stocked ?? 0,
              inStock: stocked != null,
              // qty = units/dose × doses/day × days, ceiling to a whole
              // unit. The receptionist can still bump up/down in the
              // modal if the doctor wrote SOS or fractional doses.
              qty: computeQty(p.dosage, p.frequency, p.duration) ?? 1,
            };
          });
        setBillingMedicines(rows);
      })
      .catch(() => setBillingMedicines([]))
      .finally(() => setBillingLoading(false));
  }, [medsBillingApt, priceByName]);

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
        // 1. Fetch Staff (to filter doctors)
        if (doctors.length === 0) {
          const staffRes = await fetch(`${API_BASE_URL}/api/tenant/clinics/${clinicId}/staff`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (staffRes.ok) {
            const staffData = await staffRes.json();
            const doctorList = staffData
              .filter((s: any) => s.role === "DOCTOR")
              .map((s: any) => ({ id: s.id, name: s.name }));
            
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
              patientArchived: apt.patientArchived || false,
              createdAt: apt.createdAt || undefined,
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

  const isQueueToday = isToday(selectedDate);
  const dateText = isQueueToday ? "Today's" : formatDate(selectedDate);

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
                if (apt.patientArchived) {
                  setToastMessage(`${apt.patientName} is archived — restore the patient to continue.`);
                  return;
                }
                // Locked = completed appointment OR booking older than
                // 24h. The modal still opens with full details so the
                // receptionist can review, just every field + save
                // action is disabled.
                const isCompleted = apt.status === "COMPLETED";
                const ageMs = apt.createdAt ? Date.now() - new Date(apt.createdAt).getTime() : 0;
                const isPastWindow = apt.createdAt != null && ageMs > 24 * 60 * 60 * 1000;
                const readOnly = isCompleted || isPastWindow;
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
                  readOnly,
                  readOnlyReason: isCompleted
                    ? "Appointment is completed — view only."
                    : isPastWindow ? "Edit window closed (24h after booking) — view only."
                    : undefined,
                });
                onEditStart?.();
              } },
              { label: "View Patient File", onClick: (apt) => {
                // Block navigation for archived patients — the doctor needs
                // to restore them first before adding to their chart.
                if (apt.patientArchived) {
                  setToastMessage(`${apt.patientName} is archived — restore the patient to continue.`);
                  return;
                }
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
                if (apt.patientArchived) {
                  setToastMessage(`${apt.patientName} is archived — restore the patient to continue.`);
                  return;
                }
                setMedsBillingApt(apt);
              } },
            ]}
            // Only today's queue can mutate appointment status — past
            // and future dates render the badge read-only so a stray
            // click can't rewrite history (or pre-empt tomorrow's flow).
            onStatusChange={isQueueToday ? async (aptId, newStatus) => {
              if (newStatus === "CANCELLED") {
                setPendingCancelId(aptId);
                return;
              }
              await doStatusChange(aptId, newStatus);
            } : undefined}
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
        onBilled={(method, total, billedItems) => {
          const inr = total.toLocaleString("en-IN", { minimumFractionDigits: 2 });
          const baseMsg = method === "Waive"
            ? `Bill waived for ${medsBillingApt?.patientName}`
            : `₹${inr} billed via ${method} for ${medsBillingApt?.patientName}`;

          // Persist pay status + method on the appointment row so the
          // queue's Pay pill stays accurate after a reload. WAIVED for a
          // waived bill, PAID for everything else; the channel is the
          // selected radio. Fire-and-forget — toast on failure.
          const aptId = medsBillingApt?.id;
          if (aptId) {
            const token = localStorage.getItem("docodile_token");
            const payStatus = method === "Waive" ? "WAIVED" : "PAID";
            fetch(`${API_BASE_URL}/api/tenant/appointments/${aptId}/payment`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              // pharmacyAmount = the bill total minus any pending
              // consultation due that's rolled in. For waived bills
              // pass 0 so finance reflects the goodwill, not a charge.
              body: JSON.stringify({ payStatus, paymentMethod: method, pharmacyAmount: method === "Waive" ? 0 : total }),
            })
              .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); })
              .then(() => setRefreshKey((k) => k + 1))
              .catch((err) => setToastMessage(`Pay status update failed: ${(err as Error).message}`));
          }

          // Only deduct meds the clinic actually stocks — out-of-stock
          // items have no inventory row to touch. Waived bills still
          // deduct (the meds were dispensed, just not charged).
          const toDeduct = billedItems.filter((b) => b.inStock && b.qty > 0).map((b) => ({ name: b.name, qty: b.qty }));
          if (toDeduct.length === 0) {
            setToastMessage(baseMsg);
            return;
          }
          deductPharmacyStock(toDeduct)
            .then((result) => {
              // Refresh the local catalog so the next bill modal sees
              // the updated stock counts without a page reload.
              listPharmacyStock().then((meds) => {
                const byName = new Map<string, { id: string; name: string; unitPrice: number }>();
                for (const m of meds) {
                  const key = m.name.trim().toLowerCase();
                  if (!key) continue;
                  const existing = byName.get(key);
                  if (!existing || m.unitPrice < existing.unitPrice) {
                    byName.set(key, { id: m.id, name: m.name.trim(), unitPrice: m.unitPrice });
                  }
                }
                setPharmacyStock(Array.from(byName.values()));
              }).catch(() => {});
              const shortFills = result.applied.filter((a) => a.deducted < a.requested);
              if (shortFills.length > 0) {
                const names = shortFills.map((s) => `${s.name} (${s.deducted}/${s.requested})`).join(", ");
                setToastMessage(`${baseMsg} · Short stock on: ${names}`);
              } else {
                setToastMessage(`${baseMsg} · Inventory updated`);
              }
            })
            .catch((err) => {
              setToastMessage(`${baseMsg} · Inventory deduction failed: ${(err as Error).message}`);
            });
        }}
        patientName={medsBillingApt?.patientName || ""}
        medicines={billingMedicines}
        loading={billingLoading}
        // Use this clinic's pharmacy inventory as the Add-medicine
        // catalog so prices match what the dispensary actually stocks.
        // Falls back to the modal's hardcoded default when empty.
        catalog={pharmacyStock.length > 0 ? pharmacyStock : undefined}
        pendingDue={medsBillingApt?.payStatus === "DUE" ? (medsBillingApt.fee ?? 500) : 0}
      />
    </div>
  );
}
