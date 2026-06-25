import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabItem } from "../Tabs";
import { QueueTable, Appointment } from "./QueueTable";
import { styles } from "./AppointmentQueue.styles";
import { DatePicker } from "../DatePicker/DatePicker";
import { colors, radii } from "../../styles/theme";
import { BookAppointment, EditAppointmentData } from "./BookAppointment";
import { PageHeader } from "../PageHeader/PageHeader";
import { ChevronDown } from "../icons/ChevronDown";
import { BillModal } from "../BillCard/BillModal";
import { DoctorStatusCard } from "./DoctorStatusCard";
import { HeatmapCard } from "./HeatmapCard";
import { Toast } from "../Toast";
import { resolveToastIcon } from "../Toast/toastIcon";
import { ConfirmDialog } from "../ConfirmDialog";
import { API_BASE_URL } from "../../apiConfig";
import { listPharmacyStock } from "../../api/pharmacy";
import { getActiveSessions } from "../../api/visits";
import { recordPatientDeposit } from "../../api/patientSearch";
import { listBills, chargeAppointment, type Bill } from "../../api/bills";
import { RecentBills } from "../BillCard/RecentBills";

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

// Stable empty list for a blank ("Create Bill") editor. Must be a constant —
// a fresh `[]` each render would re-fire BillModal's seed effect (which the 3s
// queue poll re-renders into) and wipe the bill on every tick.
const NO_MEDS: BillingMedicine[] = [];

// Patient label for the bill header — "name (G|years)", matching the queue row.
// `ageMonths` is stored in months (the queue divides by 12).
function patientLabel(name: string, gender?: string, ageMonths?: number): string {
  const g = gender ? gender.charAt(0).toUpperCase() : "";
  const years = ageMonths != null && ageMonths > 0 ? Math.floor(ageMonths / 12) : null;
  const parts = [g, years != null ? String(years) : ""].filter(Boolean);
  return parts.length ? `${name} (${parts.join("|")})` : name;
}

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
  // An ADDITIONAL bill opens BLANK — the consultation + prescribed meds were
  // already billed on the first invoice of the date. The FIRST bill (no prior
  // bill that date) auto-seeds them. Derived from the live bill count so it can
  // never get stuck on a stale flag.
  const additionalBill = (medsBillingApt?.todayBillCount ?? 0) > 0;
  // Recent Bills history (shown when the patient already has a bill today).
  const [billsHistoryApt, setBillsHistoryApt] = useState<Appointment | null>(null);
  const [historyBills, setHistoryBills] = useState<Bill[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const openBillsHistory = (apt: Appointment) => {
    if (apt.patientArchived) {
      setToastMessage(`${apt.patientName} is archived — restore the patient to continue.`);
      return;
    }
    setBillsHistoryApt(apt);
    setHistoryBills([]);
    if (!apt.patientId) return;
    setHistoryLoading(true);
    listBills(apt.patientId)
      .then(setHistoryBills)
      .catch((err) => setToastMessage(`Couldn't load bills: ${(err as Error).message}`))
      .finally(() => setHistoryLoading(false));
  };
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
              deposit: apt.patientDeposit || 0,
              todayBillCount: apt.todayBillCount || 0,
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
    // A never-opened At-Doc consultation swept stale by NoShowSweepJob — group
    // it with the other terminal/missed states at the bottom of the queue.
    "UNSEEN": 6,
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
              // Billing is ONE swapping item: before the day's first bill the
              // kebab shows "Bill" (opens the editor). Once a bill exists for the
              // appointment's date it disappears and "View/Create Bills" takes its
              // place — the Recent Bills history, which carries its own
              // "Create New Bill" for additional invoices.
              { label: "Create Bill", visible: (apt) => !apt.todayBillCount, onClick: (apt) => {
                if (apt.patientArchived) {
                  setToastMessage(`${apt.patientName} is archived — restore the patient to continue.`);
                  return;
                }
                setMedsBillingApt(apt);
              } },
              { label: "View/Create Bills", visible: (apt) => !!apt.todayBillCount, onClick: (apt) => openBillsHistory(apt) },
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

      <BillModal
        isOpen={!!medsBillingApt}
        onClose={() => setMedsBillingApt(null)}
        onBilled={async ({ method, lineItems }) => {
          // ONE atomic call: the server recomputes the totals from these line
          // items, writes payment, creates the invoice, auto-covers from the
          // deposit and deducts stock — so money + inventory never drift apart.
          const aptId = medsBillingApt?.id;
          const who = medsBillingApt?.patientName;
          const isWaive = method === "Waive";
          if (!aptId) { setToastMessage("No appointment to bill"); return; }
          try {
            const result = await chargeAppointment(aptId, { method, items: lineItems });
            const inr = result.bill.billed.toLocaleString("en-IN", { minimumFractionDigits: 2 });
            const baseMsg = isWaive ? `Bill waived for ${who}` : `₹${inr} billed via ${method} for ${who}`;
            setRefreshKey((k) => k + 1);
            // Refresh the local catalog so the next bill sees updated stock.
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
            const shortFills = result.stock.applied.filter((a) => a.deducted < a.requested);
            if (shortFills.length > 0) {
              const names = shortFills.map((s) => `${s.name} (${s.deducted}/${s.requested})`).join(", ");
              setToastMessage(`${baseMsg} · Short stock on: ${names}`);
            } else if (result.stock.applied.length > 0) {
              setToastMessage(`${baseMsg} · Inventory updated`);
            } else {
              setToastMessage(baseMsg);
            }
          } catch (err) {
            setToastMessage(`Charge failed: ${(err as Error).message}`);
          }
        }}
        patientName={medsBillingApt ? patientLabel(medsBillingApt.patientName, medsBillingApt.patientGender, medsBillingApt.patientAge) : ""}
        patientId={medsBillingApt?.patientId}
        // Blank for an additional bill (consultation + meds already invoiced);
        // seeded with the prescribed meds for the first bill of the day.
        medicines={additionalBill ? NO_MEDS : billingMedicines}
        loading={additionalBill ? false : billingLoading}
        // The patient's advance/deposit — seeds the Deposit field, adjusted via
        // the drawer (add/refund) and auto-drawn on Charge & Bill. The backend
        // owns the running net; we sync medsBillingApt so a re-open shows it.
        initialDeposit={medsBillingApt?.deposit ?? 0}
        onDeposit={async (amount, type, mode, details) => {
          const patientId = medsBillingApt?.patientId;
          if (!patientId) throw new Error("No patient to deposit against");
          const { deposit } = await recordPatientDeposit(patientId, amount, type, mode, details);
          setMedsBillingApt((cur) => (cur ? { ...cur, deposit } : cur));
          setRefreshKey((k) => k + 1);
          return deposit;
        }}
        // Use this clinic's pharmacy inventory as the Add-medicine
        // catalog so prices match what the dispensary actually stocks.
        // Falls back to the modal's hardcoded default when empty.
        catalog={pharmacyStock.length > 0 ? pharmacyStock : undefined}
        // The pending consultation/service for this appointment, seeded as the
        // first bill line — only while it's still UNPAID (any status that isn't
        // PAID/WAIVED; the backend uses "Unpaid"/"DUE" interchangeably), so a
        // paid consultation isn't re-billed. This is the old "pending due",
        // now itemized.
        serviceName={medsBillingApt?.service?.trim() || "Consultation"}
        serviceFee={
          !additionalBill && medsBillingApt && !["PAID", "WAIVED"].includes((medsBillingApt.payStatus || "").toUpperCase())
            ? (medsBillingApt.fee ?? 0)
            : 0
        }
      />

      <RecentBills
        isOpen={!!billsHistoryApt}
        onClose={() => setBillsHistoryApt(null)}
        patientName={billsHistoryApt?.patientName || ""}
        bills={historyBills}
        loading={historyLoading}
        // Create New Bill → close the history and open the editor for another
        // invoice. It opens blank automatically because the patient already has
        // a bill for the date (additionalBill = todayBillCount > 0).
        onCreateNew={() => {
          const apt = billsHistoryApt;
          setBillsHistoryApt(null);
          if (apt) setMedsBillingApt(apt);
        }}
      />

    </div>
  );
}
