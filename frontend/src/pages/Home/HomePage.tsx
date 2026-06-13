import React, { useEffect, useState } from "react";
import { SideNav, NavTab } from "../../components/SideNav";
import { TopNav } from "../../components/TopNav";
import { PrescriptionView, PatientFilesView, AppointmentsView } from "./Views";
import { ServicesView } from "../Services";
import { HomeView } from "./HomeView";
import { StatsPage } from "../Stats";
import { PharmacyView } from "../Pharmacy";
import { SettingsPage, DEFAULT_SETTINGS_SECTION, SettingsSection } from "../Settings";
import { colors, fonts, ThemeMode } from "../../styles/theme";
import { ComingSoon } from "../../components/ComingSoon/ComingSoon";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ChatBubble } from "../../components/Chat/ChatBubble";
import { setPendingSessionNav } from "../../components/TopNav/SessionTrayButton";
import { hydrateScheduleFromBackend } from "../../components/DoctorSchedule/scheduleStorage";
import { NewPrescriptionModal, type NewPatientDraft } from "../PrescriptionPage/NewPrescriptionModal";
import { createWalkinAppointment } from "../../api/walkin";
import type { Patient } from "../../hooks/usePatients";
import { listServices, type ServiceDTO } from "../../api/services";

type HomePageProps = {
  onLogout: () => void;
  onViewClinic: () => void;
  onViewAllClinics: () => void;
};

export function HomePage({ onLogout, onViewClinic, onViewAllClinics }: HomePageProps) {
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    return (localStorage.getItem("docodile_home_tab") as NavTab) || "Home";
  });

  const setActiveTab = (tab: NavTab) => {
    localStorage.setItem("docodile_home_tab", tab);
    setActiveTabState(tab);
  };
  const [isBooking, setIsBooking] = useState(false);

  // Pull the canonical clinic schedule from the backend on mount and seed the
  // local cache. Without this, the schedule-aware widgets (AnalogClock,
  // HeatmapCard, DoctorScheduleStrip) would read stale localStorage from a
  // previous clinic / device.
  useEffect(() => {
    void hydrateScheduleFromBackend();
  }, []);
  
  // Selected theme mode
  const [themeMode] = useState<ThemeMode>("primary");

  const [bookingKey, setBookingKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [patientFileNavId, setPatientFileNavId] = useState<string | null>(null);
  const [showNewRxModal, setShowNewRxModal] = useState(false);
  // Bumped after a walk-in is created so the Prescription queue refetches
  // and shows the new "At Doc" card without a manual reload.
  const [prescriptionRefreshKey, setPrescriptionRefreshKey] = useState(0);
  const [walkinError, setWalkinError] = useState<string>("");
  // Services catalog kept here so the Pick-existing walk-in path can resolve
  // a fee for the default service ("Consultation") — without it the booking
  // lands with fee=0 and Pay Due reads "No charges on this booking."
  const [serviceCatalog, setServiceCatalog] = useState<ServiceDTO[]>([]);
  useEffect(() => {
    let cancelled = false;
    listServices()
      .then((list) => { if (!cancelled) setServiceCatalog(list); })
      .catch(() => { /* leave empty — walk-in still goes through with null fee */ });
    return () => { cancelled = true; };
  }, []);
  const feeFor = (serviceName: string): number | null => {
    const match = serviceCatalog.find((s) => s.name === serviceName);
    return match ? (Number(match.price) || 0) : null;
  };
  // Which Settings sub-section is open. Persisted so a reload returns to the
  // user's last view inside Settings. Owned at this level because the SideNav
  // (left of the main content) needs it to highlight the active child.
  const [settingsSection, setSettingsSectionState] = useState<SettingsSection>(() => {
    return (localStorage.getItem("docodile_settings_section") as SettingsSection) || DEFAULT_SETTINGS_SECTION;
  });
  const setSettingsSection = (section: SettingsSection) => {
    localStorage.setItem("docodile_settings_section", section);
    setSettingsSectionState(section);
  };

  // Walk-in handlers — both views (Pick existing / Add new) funnel into
  // createWalkinAppointment which creates an implicit "now" appointment at
  // AT_DOC and then bumps the queue refresh key so the new card shows up.
  // The doctorId comes from the picker inside the modal so the assignment
  // is explicit and the walk-in lands under the right doctor's tab in both
  // the Prescription and Appointments queues.
  const runWalkin = async (
    doctorId: string,
    req: {
      name: string;
      phone?: string | null;
      email?: string | null;
      gender?: string | null;
      ageMonths?: number | null;
      dob?: string | null;
      service?: string | null;
      fee?: number | null;
    },
  ) => {
    setWalkinError("");
    if (!doctorId) {
      setWalkinError("Please pick a doctor before assigning the walk-in.");
      return;
    }
    try {
      const result = await createWalkinAppointment({
        patientName: req.name,
        patientPhone: req.phone ?? null,
        patientEmail: req.email ?? null,
        patientGender: req.gender ?? null,
        patientAge: req.ageMonths ?? null,
        patientDob: req.dob ?? null,
        service: req.service ?? null,
        fee: req.fee ?? null,
        doctorId,
      });
      // Drop a pending-session-nav for the just-booked walk-in so the
      // Prescription page auto-opens the Rx pad for this patient on the
      // next render — same mechanism Patient Files "View Pad" uses.
      setPendingSessionNav({
        patient: {
          id: result.patientId,
          name: req.name,
          phone: req.phone ?? null,
          email: req.email ?? null,
          gender: req.gender ?? null,
          dob: req.dob ?? null,
          age: req.ageMonths ?? null,
          displayNo: result.patientDisplayNo,
          lastVisitDate: null,
          treatingDoctorIds: [],
          treatingDepartments: [],
        },
        appointmentId: result.appointmentId,
      });
      setActiveTab("Prescription");
      setPrescriptionRefreshKey((k) => k + 1);
    } catch (e) {
      setWalkinError((e as Error).message || "Couldn't create walk-in");
    }
  };

  // "dd mm yyyy" typed by the user → ISO yyyy-MM-dd for the backend. Returns
  // null on anything that doesn't parse to a real date, so a half-typed value
  // doesn't blow up the create call.
  const parseDob = (s: string): string | null => {
    const m = s.trim().match(/^(\d{1,2})[\s/-](\d{1,2})[\s/-](\d{4})$/);
    if (!m) return null;
    const dd = Number(m[1]); const mm = Number(m[2]); const yyyy = Number(m[3]);
    const d = new Date(yyyy, mm - 1, dd);
    if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
    return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  };

  const handleWalkinExisting = (p: Patient, doctorId: string, service: string, fee: number | null) =>
    void runWalkin(doctorId, {
      name: p.name,
      phone: p.phone,
      email: p.email,
      gender: p.gender,
      // Patient.age is stored in months — pass through so the existing row
      // doesn't get its age field wiped by the find-or-create merge.
      ageMonths: p.age,
      dob: p.dob,
      service,
      // Modal resolves fee from its own catalog; HomePage's feeFor is a
      // backup in case the modal had an empty catalog (e.g. /services failed).
      fee: fee ?? feeFor(service),
    });

  const handleWalkinNew = (d: NewPatientDraft, doctorId: string) => void runWalkin(doctorId, {
    name: d.name,
    phone: d.phone || null,
    email: d.email || null,
    gender: d.gender || null,
    // The Add view collects whole years; convert to months to match how
    // booking persists `age` (years × 12 + months).
    ageMonths: d.age ? Number(d.age) * 12 : null,
    dob: parseDob(d.dob),
    service: d.service || "Consultation",
    // Modal resolves fee from its own copy of the catalog; fall back to the
    // HomePage catalog if for some reason the draft fee is still null.
    fee: d.fee ?? feeFor(d.service || "Consultation"),
  });

  const handleNewAppointment = () => {
    // On the Prescription tab the same CTA opens the pick-or-add patient
    // modal instead of jumping into the appointment booking form.
    if (activeTab === "Prescription") {
      setShowNewRxModal(true);
      return;
    }
    // Only gate on isBooking — the "Current booking data will be discarded"
    // message only makes sense when a new-booking form is open. isEditing
    // tracks the Edit Appointment modal which has its own discard flow.
    if (isBooking) {
      setShowConfirm(true);
      return;
    }
    setActiveTab("Appointments");
    setIsBooking(true);
    setBookingKey((k) => k + 1);
  };

  const handleConfirmNewAppointment = () => {
    setShowConfirm(false);
    setIsEditing(false);
    setActiveTab("Appointments");
    setIsBooking(true);
    setBookingKey((k) => k + 1);
  };

  useEffect(() => {
    document.title = `Docodile | ${activeTab}`;
    // Leaving the Appointments tab implicitly closes any open booking /
    // edit flow. Without this reset, navigating to another section while
    // the booking form is open leaves isBooking=true stuck on — the next
    // "+ New Appointment" click then triggers a phantom discard prompt
    // even though no form is visible.
    if (activeTab !== "Appointments") {
      setIsBooking(false);
      setIsEditing(false);
    }
    // The "New Prescription" pick/add modal belongs to the Prescription
    // module only — close it if the user navigates away mid-flow so it
    // doesn't pop back over a different tab.
    if (activeTab !== "Prescription") {
      setShowNewRxModal(false);
      setWalkinError("");
    }
  }, [activeTab]);

  const styles = {
    container: {
      display: "flex",
      width: "100%",
      height: "100vh",
      overflow: "hidden" as const,
      backgroundColor: colors.active.shade300,
    },
    contentArea: {
      marginLeft: "var(--sidenav-w)",
      width: "calc(100% - var(--sidenav-w))",
      display: "flex",
      flexDirection: "column" as const,
    },
    mainContent: {
      padding: "var(--page-pad-top) var(--page-pad-x) var(--page-pad-bottom)",
      display: "flex",
      flexDirection: "column" as const,
      // Sticky header → page body gap. Generous (24) on the baseline tier,
      // tighter (16) on the compact tier via --main-gap (set in globals.css).
      gap: "var(--main-gap, 24px)",
      flex: 1,
      minHeight: 0,                       // let the flex child shrink so it can scroll
      overflowY: "auto" as const,
      overflowX: "hidden" as const,
      backgroundColor: colors.active.shade200,
      borderTopLeftRadius: "16px",
      position: "relative",
    },
    title: {
      margin: 0,
      textAlign: "center" as const,
      fontFamily: fonts.family.secondary,
      fontSize: fonts.size.h5,
      lineHeight: fonts.lineHeight.h5,
      fontWeight: fonts.weight.regular,
      color: colors.neutral900,
    }
  } as const;


  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return <HomeView />;
      case "Appointments":
        return <AppointmentsView isBooking={isBooking} bookingKey={bookingKey} onBack={() => { setIsBooking(false); setIsEditing(false); }} onEditStart={() => setIsEditing(true)} onViewPatientFile={(patient, appointmentId) => {
          // Open the patient's prescription/visit directly — same path
          // PrescriptionQueue's View Pad uses, so the doctor lands inside
          // the file instead of on the Patient Files index summary.
          setPendingSessionNav({ patient, appointmentId });
          setActiveTab("Prescription");
        }} />;
      case "Prescription":
        return <PrescriptionView onNavigate={setActiveTab} queueRefreshKey={prescriptionRefreshKey} />;
      case "Patient Files":
        return <PatientFilesView onNavigate={setActiveTab} initialSelectedId={patientFileNavId} />;
      case "Services":
        return <ServicesView />;
      case "Stats":
        return <StatsPage />;
      case "Pharmacy":
        return <PharmacyView />;
      case "Settings":
        return <SettingsPage section={settingsSection} />;
      case "Billing":
        return <ComingSoon title="Bills" />;
      default:
        return (
          <div>
            <h1 style={styles.title}>{activeTab}</h1>
            <p style={{ marginTop: '12px', color: colors.neutral600 }}>This section is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <>
    <div style={styles.container} data-theme={themeMode}>
      <SideNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div style={styles.contentArea}>
        {/* Transparent backdrop so the content panel's rounded top-left corner
            reveals the darker shell behind it — a visible rounded corner. */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopNav
            onBuildClinic={onViewClinic}
            onViewAllClinics={onViewAllClinics}
            onLogout={onLogout}
            onNewAppointment={handleNewAppointment}
            isBooking={isBooking}
            primaryActionLabel={activeTab === "Prescription" ? "New Prescription" : undefined}
            primaryActionVariant={activeTab === "Prescription" ? "secondary" : "primary"}
            onNavigate={setActiveTab}
          />
          <main style={styles.mainContent}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>

    <ChatBubble
      clinicId={localStorage.getItem("docodile_clinic_id") ?? ""}
      currentUserId={localStorage.getItem("docodile_user_id") ?? ""}
      currentUserName={localStorage.getItem("docodile_user_email") ?? ""}
    />

    <ConfirmDialog
      isOpen={showConfirm}
      title="Are you sure?"
      message="Current booking data will be discarded."
      confirmLabel="Yes"
      cancelLabel="Nope"
      onConfirm={handleConfirmNewAppointment}
      onCancel={() => setShowConfirm(false)}
    />

    <NewPrescriptionModal
      isOpen={showNewRxModal}
      onClose={() => setShowNewRxModal(false)}
      onSelectPatient={handleWalkinExisting}
      onAddPatient={handleWalkinNew}
    />

    <ConfirmDialog
      isOpen={!!walkinError}
      title="Walk-in failed"
      message={walkinError}
      confirmLabel="OK"
      hideCancel
      onConfirm={() => setWalkinError("")}
      onCancel={() => setWalkinError("")}
    />
    </>
  );
}
