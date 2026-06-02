import React, { useEffect, useState } from "react";
import { AddStaffModal } from "../../components/AddStaffModal";
import { ClinicTabs, Clinic, Staff } from "../../components/ClinicTabs";
import { styles } from "./BuildYourClinicPage.styles";
import { ClinicWorkspace } from "../../components/ClinicWorkspace";
import { Button } from "../../components/Button";
import { API_BASE_URL } from "../../apiConfig";
import { ClinicInfoCard } from "../../components/ClinicInfoCard";
import { StaffIllustration } from "../../components/AddStaffModal/StaffIllustration";
import { ReactComponent as NextIcon } from "../../assets/Arrow Right.svg";
import { ReactComponent as HelpIcon } from "../../assets/Help.svg";
import { ReactComponent as PlusIcon } from "../../assets/Plus.svg";
import { ReactComponent as ClinicRoof } from "../../assets/clinic roof.svg";
import { ReactComponent as Bush } from "../../assets/bush.svg";
import { Toast } from "../../components/Toast";
import { StaffWindow } from "../../components/StaffWindow";

export function BuildYourClinicPage({ onNext }: { onNext?: () => void }) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [activeClinicId, setActiveClinicId] = useState<string>("");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    document.title = "Docodile | Build Your Clinic";

    const fetchClinics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tenant/clinics`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const mappedClinics: Clinic[] = await Promise.all(data.map(async (c: any) => {
              // Fetch staff for this clinic
              let staffList: Staff[] = [];
              try {
                const staffResponse = await fetch(`${API_BASE_URL}/api/tenant/clinics/${c.id}/staff`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
                  },
                });
                if (staffResponse.ok) {
                  const staffData = await staffResponse.json();
                  staffList = staffData.map((s: any) => ({
                    id: s.id,
                    name: s.name || "",
                    role: s.role === "OTHER" && s.customRole
                      ? s.customRole
                      : s.role.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" "),
                    gender: s.gender || "",
                    email: s.email || "",
                    phone: s.phone || "",
                    department: s.department || "",
                    specialty: s.specialty || "",
                    registrationNo: s.registrationNo || "",
                    qualification: s.qualification || "",
                    medicalCouncil: s.medicalCouncil || "",
                    experienceYears: s.experienceYears != null ? String(s.experienceYears) : "",
                    active: s.active !== false,
                    accountStatus: s.accountStatus ?? "ACTIVE",
                  }));
                }
              } catch (e) {
                console.error(`Failed to fetch staff for clinic ${c.id}`, e);
              }

              return {
                id: c.id,
                name: c.name || "Your Clinic",
                domain: c.domain || "",
                phone: c.phone || "",
                address: c.address || "",
                departments: c.speciality ? c.speciality.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
                staff: staffList
              };
            }));
            setClinics(mappedClinics);
            setActiveClinicId(mappedClinics[0].id);
          } else {
            // Default first clinic if none exist
            const defaultClinic: Clinic = {
              id: "new-1",
              name: "Your Clinic",
              domain: "",
              phone: "",
              address: "",
              departments: [],
              staff: []
            };
            setClinics([defaultClinic]);
            setActiveClinicId(defaultClinic.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch clinics:", error);
      }
    };

    fetchClinics();
  }, []);

  const activeClinic = clinics.find(c => c.id === activeClinicId) || clinics[0];

  const handleAddClinic = () => {
    if (clinics.length >= 5) {
      setToastMessage("Maximum of 5 clinics reached");
      return;
    }

    const newClinic: Clinic = {
      id: String(Date.now()),
      name: `Your Clinic ${clinics.length + 1}`,
      domain: "",
      phone: "",
      address: "",
      departments: [],
      staff: []
    };
    setClinics([...clinics, newClinic]);
    setActiveClinicId(newClinic.id);
  };

  const handleUpdateClinic = (updates: Partial<Clinic>) => {
    setClinics(clinics.map(c =>
      c.id === activeClinicId ? { ...c, ...updates } : c
    ));
  };

  // Push the active clinic's current state (name, address, departments, etc.)
  // to the backend before opening the staff modal. Otherwise the user can add
  // a department locally without clicking Save on the clinic, then assign a
  // staff member to it — and the staff POST fails server-side validation with
  // "Department '<X>' is not configured for this clinic". Returns true on
  // success (or when clinic isn't saved yet, in which case caller already
  // handled it earlier).
  const syncClinicToBackend = async (): Promise<boolean> => {
    if (!activeClinic) return false;
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(activeClinic.id)) {
      // Clinic hasn't been saved yet — staff save itself will surface the
      // "save clinic first" toast.
      return true;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/tenant/clinic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
        },
        body: JSON.stringify({
          id: activeClinic.id,
          name: activeClinic.name,
          address: activeClinic.address,
          phone: activeClinic.phone,
          domain: activeClinic.domain,
          speciality: activeClinic.departments.join(","),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setToastMessage(errorData.error || "Couldn't sync clinic details");
        return false;
      }
      return true;
    } catch {
      setToastMessage("Couldn't sync clinic details");
      return false;
    }
  };

  const handleOpenAddStaff = async () => {
    if (activeClinic && activeClinic.staff.length >= 10) {
      setToastMessage("Maximum of 10 staff members reached");
      return;
    }
    if (!(await syncClinicToBackend())) return;
    setEditingStaff(undefined);
    setIsAddStaffOpen(true);
  };

  const handleEditStaff = async (staff: Staff) => {
    if (!(await syncClinicToBackend())) return;
    setEditingStaff(staff);
    setIsAddStaffOpen(true);
  };

  const handleDeleteStaff = async () => {
    if (!editingStaff) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tenant/clinics/${activeClinicId}/staff/${editingStaff.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
          },
        }
      );

      if (response.ok) {
        const removedName = editingStaff.name;
        // Soft removal — keep the row but flag it inactive so it moves to the
        // "Deactivated" list (where it can be reactivated) instead of vanishing.
        const updatedStaff = activeClinic.staff.map(s =>
          s.id === editingStaff.id ? { ...s, active: false } : s
        );
        handleUpdateClinic({ staff: updatedStaff });
        setIsAddStaffOpen(false);
        setToastMessage(`${removedName} removed — moved to Deactivated`);
      } else {
        const errorData = await response.json();
        setToastMessage(errorData.error || "Failed to remove staff member");
      }
    } catch (error) {
      console.error("Failed to remove staff", error);
      setToastMessage("An error occurred while removing staff member");
    }
  };

  const handleReactivateStaff = async (staff: Staff) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tenant/clinics/${activeClinicId}/staff/${staff.id}/reactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
          },
        }
      );
      if (response.ok) {
        const updatedStaff = activeClinic.staff.map(s =>
          s.id === staff.id ? { ...s, active: true } : s
        );
        handleUpdateClinic({ staff: updatedStaff });
        setToastMessage(`${staff.name} reactivated`);
      } else {
        const errorData = await response.json().catch(() => null);
        setToastMessage(errorData?.error || "Failed to reactivate staff member");
      }
    } catch (error) {
      console.error("Failed to reactivate staff", error);
      setToastMessage("An error occurred while reactivating staff member");
    }
  };

  const handleSaveStaff = async (data: Omit<Staff, "id" | "active">) => {
    try {
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

      if (!isUuid(activeClinicId)) {
        setToastMessage("Please save the clinic details first before adding staff");
        setIsAddStaffOpen(false);
        return;
      }

      const staffId = editingStaff && isUuid(editingStaff.id) ? editingStaff.id : null;

      const response = await fetch(`${API_BASE_URL}/api/tenant/clinics/${activeClinicId}/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
        },
        body: JSON.stringify({
          id: staffId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          role: data.role,
          department: data.department,
          specialty: data.specialty,
          registrationNo: data.registrationNo,
          qualification: data.qualification,
          medicalCouncil: data.medicalCouncil,
          experienceYears: data.experienceYears ? Number(data.experienceYears) : null
        }),
      });

      if (response.ok) {
        const savedStaffData = await response.json();
        const mappedStaff: Staff = {
          id: savedStaffData.id,
          name: savedStaffData.name || "",
          role: savedStaffData.role === "OTHER" && savedStaffData.customRole
            ? savedStaffData.customRole
            : savedStaffData.role.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" "),
          gender: savedStaffData.gender || "",
          email: savedStaffData.email || "",
          phone: savedStaffData.phone || "",
          department: savedStaffData.department || "",
          specialty: savedStaffData.specialty || "",
          registrationNo: savedStaffData.registrationNo || "",
          qualification: savedStaffData.qualification || "",
          medicalCouncil: savedStaffData.medicalCouncil || "",
          experienceYears: savedStaffData.experienceYears != null ? String(savedStaffData.experienceYears) : "",
          active: savedStaffData.active !== false,
          accountStatus: savedStaffData.accountStatus ?? "PENDING_ACTIVATION",
        };

        if (editingStaff) {
          const updatedStaff = activeClinic.staff.map(s =>
            s.id === editingStaff.id ? mappedStaff : s
          );
          handleUpdateClinic({ staff: updatedStaff });
          setToastMessage(`${mappedStaff.name} updated`);
        } else {
          handleUpdateClinic({ staff: [...activeClinic.staff, mappedStaff] });
          setToastMessage(`${mappedStaff.name} added to staff`);
        }
        setIsAddStaffOpen(false);
      } else {
        // Surface the backend's error message verbatim when possible; fall
        // back to the HTTP status so 500s without a JSON body still tell us
        // something useful (e.g. schema mismatch before a migration runs).
        const raw = await response.text();
        let msg = "";
        try {
          msg = raw ? (JSON.parse(raw).error || "") : "";
        } catch {
          msg = raw;
        }
        if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("exist")) {
          setToastMessage("A staff member with this email already exists");
        } else {
          setToastMessage(msg || `Failed to save staff member (HTTP ${response.status})`);
        }
      }
    } catch (error) {
      console.error("Failed to save staff", error);
      setToastMessage(`An error occurred while saving staff member: ${(error as Error).message}`);
    }
  };

  const handleResendInvite = async (staffId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tenant/staff/${staffId}/resend-welcome`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("docodile_token")}` },
      });
      if (res.ok) {
        setToastMessage("Invite email resent");
      } else {
        setToastMessage("Failed to resend invite");
      }
    } catch {
      setToastMessage("Failed to resend invite");
    }
  };

  return (
    <div style={styles.page}>
      {/* Page title */}
      <h2 style={styles.title}>Build your Clinic</h2>

      {/* Clinic tabs + workspace */}
      <div style={styles.workspaceContainer}>
        <ClinicTabs
          clinics={clinics}
          activeClinicId={activeClinicId}
          onSelectClinic={setActiveClinicId}
          onAddClinic={handleAddClinic}
        />

        <ClinicWorkspace
          left={
            activeClinic ? (
              <ClinicInfoCard
                clinic={activeClinic}
                onUpdate={handleUpdateClinic}
                onShowToast={setToastMessage}
              />
            ) : null
          }
          right={
            activeClinic ? (
              <div style={styles.rightContainer}>
                <div style={styles.houseContainer}>
                  {/* Roof */}
                  <ClinicRoof style={styles.roofImage} />

                  {/* House Body — grouped arches and labels. Only active
                      staff appear here; deactivated members move to the list
                      below so they can be reactivated. */}
                  <div style={styles.houseBody}>
                    <div style={styles.staffList}>
                      {activeClinic.staff.filter((s: Staff) => s.active).map((staff: Staff, index: number) => (
                        <div key={staff.id} style={styles.staffCardWrapper}>
                          <StaffWindow colorIndex={index} onClick={() => handleEditStaff(staff)}>
                            <StaffIllustration
                              role={staff.role}
                              gender={staff.gender}
                              width="100%"
                              height="100%"
                              borderRadius="0"
                              crop="bust"
                            />
                          </StaffWindow>
                          <div style={styles.staffName}>{staff.name}</div>
                          <div style={styles.staffRole}>{staff.role}</div>
                          {staff.accountStatus === "PENDING_ACTIVATION" && (
                            <button
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                fontSize: 11,
                                color: "#CF6F2F",
                                fontFamily: "inherit",
                                textDecoration: "underline",
                                marginTop: 2,
                              }}
                              onClick={(e) => { e.stopPropagation(); handleResendInvite(staff.id); }}
                            >
                              Resend invite
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add Staff arch */}
                      {activeClinic.staff.filter((s: Staff) => s.active).length < 10 && (
                        <div style={styles.staffCardWrapper}>
                          <StaffWindow dashed onClick={handleOpenAddStaff}>
                            <PlusIcon style={{ width: 32, height: 32 }} />
                          </StaffWindow>
                          <div style={styles.staffName}>&nbsp;</div>
                          <div style={styles.staffRole}>&nbsp;</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bush */}
                  <Bush style={styles.bushRight} />
                </div>

                {/* Deactivated staff — removed members kept on record. Admin
                    can reactivate them here; their history stays intact. */}
                {activeClinic.staff.some((s: Staff) => !s.active) && (
                  <div style={styles.deactivatedSection}>
                    <div style={styles.deactivatedTitle}>Deactivated staff</div>
                    {activeClinic.staff.filter((s: Staff) => !s.active).map((staff: Staff) => (
                      <div key={staff.id} style={styles.deactivatedRow}>
                        <div style={styles.deactivatedInfo}>
                          <span style={styles.deactivatedName}>{staff.name}</span>
                          <span style={styles.deactivatedRole}>{staff.role}</span>
                        </div>
                        <Button variant="dark" size="sm" onClick={() => handleReactivateStaff(staff)}>
                          Reactivate
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null
          }
        />

        <AddStaffModal
          isOpen={isAddStaffOpen}
          onClose={() => setIsAddStaffOpen(false)}
          onSave={handleSaveStaff}
          onDelete={handleDeleteStaff}
          initialData={editingStaff}
          onShowToast={setToastMessage}
          clinicDepartments={activeClinic?.departments || []}
        />

        {/* Footer actions */}
        <div style={styles.footer}>
          <Button size="md" variant="secondaryLight" iconRight={<HelpIcon />} style={{ minWidth: 180 }}>
            Help
          </Button>
          <Button size="md" variant="dark" iconRight={<NextIcon />} style={{ minWidth: 180 }} onClick={async () => {
            const incomplete = clinics.find(c => !c.name.trim() || !c.phone.trim() || !c.domain.trim() || !c.address.trim());
            if (incomplete) {
              setActiveClinicId(incomplete.id);
              setToastMessage(`Please complete all fields for "${incomplete.name || "Your Clinic"}"`);
              return;
            }

            const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
            try {
              for (const c of clinics) {
                const clinicId = isUuid(c.id) ? c.id : null;
                const res = await fetch(`${API_BASE_URL}/api/tenant/clinic`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
                  },
                  body: JSON.stringify({
                    id: clinicId,
                    name: c.name,
                    address: c.address,
                    phone: c.phone,
                    domain: c.domain,
                    speciality: c.departments.join(","),
                  }),
                });
                if (!res.ok) {
                  const err = await res.json();
                  setActiveClinicId(c.id);
                  setToastMessage(err.error || `Failed to save "${c.name}"`);
                  return;
                }
                const saved = await res.json();
                handleUpdateClinic({ id: saved.id });
              }
              onNext?.();
            } catch {
              setToastMessage("An error occurred while saving clinics");
            }
          }}>
            Next
          </Button>
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
