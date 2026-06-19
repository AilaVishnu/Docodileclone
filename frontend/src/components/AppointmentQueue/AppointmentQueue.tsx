import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabItem } from "../Tabs";
import { QueueTable, Appointment } from "./QueueTable";
import { styles } from "./AppointmentQueue.styles";
import { DatePicker } from "../DatePicker/DatePicker";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { BookAppointment, EditAppointmentData } from "./BookAppointment";
import { PageHeader } from "../PageHeader/PageHeader";
import { ChevronDown } from "../icons/ChevronDown";
import { BillMedicinesModal } from "./BillMedicinesModal";
import { BillCard } from "../BillCard/BillCard";
import { DoctorStatusCard } from "./DoctorStatusCard";
import { HeatmapCard } from "./HeatmapCard";
import { Toast } from "../Toast";
import { resolveToastIcon } from "../Toast/toastIcon";
import { Button } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog";
import { Modal } from "../Modal";
import { API_BASE_URL } from "../../apiConfig";
import { listPharmacyStock, deductPharmacyStock } from "../../api/pharmacy";
import { getActiveSessions } from "../../api/visits";

type Doctor = {
  id: string;
  name: string;
  gender?: string;
  role?: string;
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
  // "Mark as Paid" popup state — keeps the receptionist on the queue
  // instead of opening the full Edit modal just to pick a channel.
  const [payDueApt, setPayDueApt] = useState<Appointment | null>(null);
  const [payDueMethod, setPayDueMethod] = useState<string>("Cash");
  const [payDueSubmitting, setPayDueSubmitting] = useState(false);
  const [payDueDiscount, setPayDueDiscount] = useState<number>(0);
  const [payDueDiscountMode, setPayDueDiscountMode] = useState<"%" | "₹">("₹");
  // appointmentId → backend session start (ISO) for in-progress consultations.
  // Polled from the active-sessions endpoint; drives the live status-badge
  // timer (the badge itself ticks each second from this start instant).
  const [sessionStarts, setSessionStarts] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getActiveSessions()
        .then((sessions) => {
          if (cancelled) return;
          const map: Record<string, string> = {};
          for (const s of sessions) {
            if (s.appointmentId) map[s.appointmentId] = s.sessionStartedAt;
          }
          setSessionStarts(map);
        })
        .catch(() => { /* keep last good map on transient errors */ });
    load();
    // Poll fairly often so a freshly started/re-opened consultation's live
    // timer shows up promptly (was 10s — felt laggy).
    const id = window.setInterval(load, 3000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [refreshKey]);
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
    // Topical / liquid / per-pack forms (creams, lotions, drops, syrups…) are
    // dispensed as ONE unit (a tube/bottle/bar) — not "doses × days" like
    // tablets/capsules. Default those to 1; the receptionist can still adjust.
    const PER_PACK_FORM = /cream|lotion|gel|ointment|\boil\b|shampoo|soap|wash|serum|sunscreen|balm|paste|scrub|spray|powder|syrup|suspension|solution|drop|moisturi|conditioner|foam|emulsion|liniment|tincture/i;
    const computeQty = (name: string, dosage?: string, frequency?: string, duration?: string): number | null => {
      if (PER_PACK_FORM.test(name)) return 1;
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
        // Bill the visit tied to *this* appointment, not "the patient's
        // most recent visit". Otherwise a fresh walk-in (no Rx added yet)
        // would leak medicines from the patient's previous visit into the
        // bill. V45 links visits → appointments via appointment_id; rows
        // that pre-date the migration fall back to a same-day match.
        const apt = medsBillingApt;
        const sameDay = (iso?: string | null): boolean => {
          if (!iso || !apt?.rawScheduledTime) return false;
          return iso.slice(0, 10) === apt.rawScheduledTime.slice(0, 10);
        };
        const matching =
          visits.find((v: any) => v.appointmentId && apt?.id && v.appointmentId === apt.id) ??
          visits.find((v: any) => sameDay(v.visitDate));
        const rows: BillingMedicine[] = (matching?.prescriptions ?? [])
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
              qty: computeQty(name, p.dosage, p.frequency, p.duration) ?? 1,
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
            // Exclude deactivated doctors — they keep their clinic membership
            // (for the Deactivated list) but must not be bookable for future
            // appointments. Only active doctors appear in the queue/booking.
            const doctorList = staffData
              .filter((s: any) => s.role === "DOCTOR" && s.active !== false)
              .map((s: any) => ({
                id: s.id,
                name: s.name,
                gender: (s.gender ?? "").toLowerCase(),
                role: "Doctor",
              }));

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

          // Client-side no-show derivation — mirrors the backend
          // NoShowSweepJob (1am cron) so the queue doesn't show stale
          // "Booked" pills before the nightly sweep runs. Any pending
          // appointment (BOOKED/SCHEDULED/WAITING) whose scheduled time is
          // before the start of today is displayed as NO_SHOW.
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const PENDING_STATUSES = new Set(["BOOKED", "SCHEDULED", "WAITING"]);
          const deriveStatus = (rawStatus: string | undefined, rawSched: string | undefined): string => {
            // Legacy walk-in rows can carry "AT_DOC" — normalise to IN_PROGRESS
            // so the existing StatusBadge / sort priority / filter logic apply
            // without a new branch (At Doc is the IN_PROGRESS display label
            // before Start Session is clicked).
            const incoming = rawStatus?.toUpperCase() === "AT_DOC" ? "IN_PROGRESS" : rawStatus;
            const status = incoming || "WAITING";
            if (!PENDING_STATUSES.has(status.toUpperCase())) return status;
            if (!rawSched) return status;
            const sched = new Date(rawSched);
            if (Number.isNaN(sched.getTime())) return status;
            return sched < startOfToday ? "NO_SHOW" : status;
          };

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
              status: deriveStatus(apt.status, apt.scheduledTime) as Appointment["status"],
              payStatus: apt.payStatus || "DUE",
              paymentMethod: apt.paymentMethod || "",
              doctorId: apt.doctorId,
              patientEmail: apt.patientEmail || "",
              patientGender: apt.patientGender || "",
              patientDob: apt.patientDob || "",
              patientAge: apt.patientAge || undefined,
              patientDisplayNo: apt.patientDisplayNo ?? null,
              notes: apt.notes || "",
              fee: apt.fee || 0,
              pharmacyAmount: apt.pharmacyAmount || 0,
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
  const dateText = isQueueToday ? "Today" : formatDate(selectedDate);

  if (isLoading && doctors.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Queue...</div>;
  }

  return (
    <div style={styles.container}>
      <PageHeader
        style={{ marginBottom: "24px" }}
        title={
          <>
            <span
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                color: colors.neutral900,
                backgroundColor: "transparent",
                border: `1px solid ${colors.primary400}`,
                borderRadius: radii.m,
                padding: "4px 12px",
                position: "relative",
                zIndex: showDatePicker ? 1100 : "auto",
              }}
            >
              {dateText}
              <ChevronDown open={showDatePicker} />
              {showDatePicker && (
                <DatePicker
                  selectedDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                  showDoneButton
                />
              )}
            </span> Queue
          </>
        }
      />

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
          <div style={{ display: "flex", gap: "var(--queue-gap, 24px)", minWidth: 0, width: "100%" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
          <QueueTable
            appointments={activeQueue}
            sessionStarts={sessionStarts}
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
                  patientDisplayNo: apt.patientDisplayNo ?? null,
                  isWalkin: !!apt.isWalkin,
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
                    displayNo: apt.patientDisplayNo ?? null,
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
              // One-click consultation-fee paid. Only appears when the
              // appointment is in DUE state (anything other than PAID/
              // WAIVED). PATCHes payStatus → PAID with method "Cash"
              // and refreshes the queue so the pill flips immediately.
              {
                label: "Mark as Paid",
                visible: (apt) => {
                  const ps = (apt.payStatus || "").toUpperCase();
                  return ps !== "PAID" && ps !== "WAIVED";
                },
                onClick: (apt) => {
                  setPayDueApt(apt);
                  setPayDueMethod(apt.paymentMethod || "Cash");
                  setPayDueDiscount(0);
                  setPayDueDiscountMode("₹");
                },
              },
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
              doctorGender={doctors.find(d => d.id === activeDoctorId)?.gender || "male"}
              doctorRole={doctors.find(d => d.id === activeDoctorId)?.role || "Doctor"}
              appointments={activeQueue}
            />
            <HeatmapCard appointments={activeQueue} date={selectedDate} />
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
        {...resolveToastIcon(toastMessage)}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />

      <ConfirmDialog
        isOpen={!!pendingCancelId}
        title="Are you sure?"
        confirmLabel="Yes"
        cancelLabel="Nope"
        destructive
        onConfirm={() => {
          const id = pendingCancelId;
          setPendingCancelId(null);
          if (id) doStatusChange(id, "CANCELLED");
        }}
        onCancel={() => setPendingCancelId(null)}
      />

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

      {/* Pay Due popup — opened by the "Mark as Paid" menu action.
          Tiny modal: shows patient + due amount, lets the receptionist
          pick Cash/Card/UPI/Waive, then PATCHes payStatus → PAID. */}
      {payDueApt && (() => {
        const consultAmt = payDueApt.fee ?? 0;
        const pharmacyAmt = payDueApt.pharmacyAmount ?? 0;
        const subtotal = consultAmt + pharmacyAmt;
        // Waive pins the bill to ₹0 (full 100% discount) and locks the
        // discount input so the receptionist can't override it. Toggle
        // back to Cash/Card/UPI and the prior discount values restore.
        const isWaived = payDueMethod === "Waive";
        const discountAmt = isWaived
          ? subtotal
          : (payDueDiscountMode === "%"
              ? (subtotal * payDueDiscount) / 100
              : payDueDiscount);
        const totalDue = isWaived ? 0 : Math.max(0, subtotal - discountAmt);
        const services: { name: string; price: number }[] = [];
        if (consultAmt > 0) services.push({ name: payDueApt.service?.trim() || "Consultation", price: consultAmt });
        if (pharmacyAmt > 0) services.push({ name: "Pharmacy", price: pharmacyAmt });
        const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return (
        <Modal
          isOpen
          onClose={() => setPayDueApt(null)}
          level="top"
          surface="transparent"
          padding={0}
          radius={0}
          shadow="none"
          width={360}
          closeOnBackdrop={false}
          closeOnEsc={false}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 360, maxWidth: "92vw" }}>
            {/* Receipt card — patient header + bill body + actions, all
                under one white sheet so the action buttons read as part
                of the bill instead of hanging detached below the zigzag. */}
            <div style={{ position: "relative", backgroundColor: colors.neutral100, padding: spacing.xl, borderRadius: "16px 16px 0 0", display: "flex", flexDirection: "column", gap: spacing.s }}>
              {/* Close (X) — top-right; same as Cancel. Disabled mid-submit. */}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setPayDueApt(null)}
                disabled={payDueSubmitting}
                style={{
                  position: "absolute", top: spacing.s, right: spacing.s,
                  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  border: "none", borderRadius: "50%", background: "transparent",
                  cursor: payDueSubmitting ? "default" : "pointer",
                  color: colors.neutral500, fontSize: 18, lineHeight: 1,
                }}
                onMouseEnter={(e) => { if (!payDueSubmitting) e.currentTarget.style.backgroundColor = colors.primary100; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                ✕
              </button>
              {/* Patient name header — serif, centered */}
              <h3 style={{ margin: 0, fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, lineHeight: fonts.lineHeight.h5, fontWeight: fonts.weight.regular, color: colors.neutral900, textAlign: "center" as const }}>
                {payDueApt.patientName}
              </h3>
              <div style={{ fontFamily: fonts.family.primary, fontSize: fonts.size.xs, color: colors.neutral500, textAlign: "center" as const, marginTop: -spacing["2xs"] }}>Pay Due</div>

              {/* Service line items in cream pills */}
              {services.map((svc) => (
                <div key={svc.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${spacing.xs} ${spacing.s}`, backgroundColor: colors.primary100, borderRadius: radii.m, fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral900 }}>
                  <span>{svc.name}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" as const, fontWeight: fonts.weight.medium }}>₹ {fmt(svc.price)}</span>
                </div>
              ))}
              {services.length === 0 && (
                <div style={{ padding: spacing.s, fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral500, textAlign: "center" as const }}>
                  No charges on this booking.
                </div>
              )}

              {/* Subtotal + Discount rows — underline style */}
              {subtotal > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${spacing.xs} 0`, borderBottom: `1px solid ${colors.neutral200}`, fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral700 }}>
                    <span>Subtotal</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" as const }}>₹ {fmt(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: spacing.xs, padding: `${spacing.xs} 0`, borderBottom: `1px solid ${colors.neutral200}`, fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral700, opacity: isWaived ? 0.5 : 1 }}>
                    <span>Discount</span>
                    <input
                      type="number"
                      min={0}
                      value={isWaived ? (payDueDiscountMode === "%" ? 100 : subtotal) : (payDueDiscount || "")}
                      placeholder="0"
                      disabled={isWaived}
                      onChange={(e) => setPayDueDiscount(Number(e.target.value) || 0)}
                      style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", textAlign: "right" as const, fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.neutral900, padding: 0, fontVariantNumeric: "tabular-nums" as const, cursor: isWaived ? "not-allowed" : "text" }}
                    />
                    {/* % / ₹ toggle — also disabled while Waive is on. */}
                    <div style={{ display: "flex", border: `1px solid ${colors.neutral300}`, borderRadius: radii.s, overflow: "hidden", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setPayDueDiscountMode("%")}
                        disabled={isWaived}
                        style={{
                          padding: "2px 10px",
                          border: "none",
                          cursor: isWaived ? "not-allowed" : "pointer",
                          fontFamily: fonts.family.primary,
                          fontSize: fonts.control.xs,
                          fontWeight: payDueDiscountMode === "%" ? fonts.weight.semibold : fonts.weight.regular,
                          backgroundColor: payDueDiscountMode === "%" ? colors.active.shade100 : "transparent",
                          color: payDueDiscountMode === "%" ? colors.neutral900 : colors.neutral500,
                        }}
                      >%</button>
                      <button
                        type="button"
                        onClick={() => setPayDueDiscountMode("₹")}
                        disabled={isWaived}
                        style={{
                          padding: "2px 10px",
                          border: "none",
                          cursor: isWaived ? "not-allowed" : "pointer",
                          fontFamily: fonts.family.primary,
                          fontSize: fonts.control.xs,
                          fontWeight: payDueDiscountMode === "₹" ? fonts.weight.semibold : fonts.weight.regular,
                          backgroundColor: payDueDiscountMode === "₹" ? colors.active.shade100 : "transparent",
                          color: payDueDiscountMode === "₹" ? colors.neutral900 : colors.neutral500,
                        }}
                      >₹</button>
                    </div>
                  </div>
                </>
              )}

              {/* Total — cream-banded headline */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: `${spacing.xs} ${spacing.s}`, backgroundColor: colors.primary100, borderRadius: radii.m, marginTop: spacing["2xs"] }}>
                <span style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.md, fontWeight: fonts.weight.semibold, color: colors.neutral900 }}>Total</span>
                <span style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, lineHeight: 1, color: colors.neutral900, fontWeight: fonts.weight.regular, fontVariantNumeric: "tabular-nums" as const }}>₹ {fmt(totalDue)}</span>
              </div>

              {/* Method radio row */}
              <div style={{ display: "flex", gap: spacing.m, justifyContent: "center", flexWrap: "wrap" as const, paddingTop: spacing["2xs"] }}>
                {["Cash", "Card", "UPI", "Waive"].map((m) => (
                  <label key={m} style={{ display: "flex", alignItems: "center", gap: spacing["2xs"], cursor: "pointer", fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: m === "Waive" ? colors.red200 : colors.neutral900 }}>
                    <input
                      type="radio"
                      name="payDueMethod"
                      checked={payDueMethod === m}
                      onChange={() => setPayDueMethod(m)}
                      style={{ margin: 0, cursor: "pointer" }}
                    />
                    {m}
                  </label>
                ))}
              </div>

              {/* Action buttons — inside the white card, above the zigzag */}
              <div style={{ display: "flex", gap: spacing.s, justifyContent: "center", paddingTop: spacing.s }}>
              <Button
                variant="light"
                size="sm"
                onClick={() => { setPayDueApt(null); }}
                disabled={payDueSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="dark"
                size="sm"
                disabled={payDueSubmitting}
                onClick={async () => {
                  const apt = payDueApt;
                  setPayDueSubmitting(true);
                  const token = localStorage.getItem("docodile_token");
                  const newPayStatus = payDueMethod === "Waive" ? "WAIVED" : "PAID";
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/tenant/appointments/${apt.id}/payment`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      // Discount = full subtotal for Waive, computed
                      // amount otherwise. Backend persists it for the
                      // finance dashboard's collected-revenue rollup.
                      body: JSON.stringify({
                        payStatus: newPayStatus,
                        paymentMethod: payDueMethod,
                        discountAmount: discountAmt,
                      }),
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    setToastMessage(payDueMethod === "Waive"
                      ? `Bill waived for ${apt.patientName}`
                      : `Marked ${apt.patientName} as Paid via ${payDueMethod}`);
                    setRefreshKey((k) => k + 1);
                    setPayDueApt(null);
                  } catch (e) {
                    setToastMessage(`Couldn't update payment: ${(e as Error).message}`);
                  } finally {
                    setPayDueSubmitting(false);
                  }
                }}
              >
                {payDueSubmitting ? "Saving…" : payDueMethod === "Waive" ? "Mark Waived" : "Pay Due"}
              </Button>
            </div>
            </div>
            {/* Zigzag torn-receipt edge under the unified card */}
            <div style={{
              width: "100%",
              height: 20,
              backgroundImage: `linear-gradient(135deg, ${colors.neutral100} 50%, transparent 50%), linear-gradient(225deg, ${colors.neutral100} 50%, transparent 50%)`,
              backgroundSize: "20px 20px",
              backgroundRepeat: "repeat-x",
            }} />
          </div>
        </Modal>
        );
      })()}
    </div>
  );
}
