import React, { useEffect, useState } from "react";
import { AddStaffModal } from "../../components/AddStaffModal";
import { Clinic, Staff } from "../../components/ClinicTabs";
import { styles } from "./BuildYourClinicPage.styles";
import { ClinicWorkspace } from "../../components/ClinicWorkspace";
import { Button } from "../../components/Button";
import { API_BASE_URL } from "../../apiConfig";
import { ClinicInfoCard } from "../../components/ClinicInfoCard";
import { StaffIllustration } from "../../components/AddStaffModal/StaffIllustration";
import { Icon } from "../../components/Icon";
import { ReactComponent as ClinicRoof } from "../../assets/clinic roof.svg";
import { ReactComponent as Bush } from "../../assets/bush.svg";
import { Toast } from "../../components/Toast";
import { resolveToastIcon } from "../../components/Toast/toastIcon";
import { StaffWindow } from "../../components/StaffWindow";

export function BuildYourClinicPage({ onNext }: { onNext?: () => void }) {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    document.title = "Docodile | Build Your Clinic";

    const fetchClinic = async () => {
      try {
        const [clinicRes, staffRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/tenant/clinic`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("docodile_token")}` },
          }),
          fetch(`${API_BASE_URL}/api/tenant/staff`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("docodile_token")}` },
          }),
        ]);

        let clinicData: any = {};
        if (clinicRes.ok) {
          clinicData = await clinicRes.json();
        }

        let staffList: Staff[] = [];
        if (staffRes.ok) {
          const staffData = await staffRes.json();
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

        setClinic({
          id: clinicData.id || "new-1",
          name: clinicData.name || "Your Clinic",
          domain: clinicData.domain || "",
          phone: clinicData.phone || "",
          address: clinicData.address || "",
          departments: clinicData.speciality
            ? clinicData.speciality.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          staff: staffList,
        });
      } catch (error) {
        console.error("Failed to fetch clinic:", error);
        setClinic({
          id: "new-1",
          name: "Your Clinic",
          domain: "",
          phone: "",
          address: "",
          departments: [],
          staff: [],
        });
      }
    };

    fetchClinic();
  }, []);

  const handleUpdateClinic = (updates: Partial<Clinic>) => {
    setClinic(prev => prev ? { ...prev, ...updates } : prev);
  };

  // Push the clinic's current state to the backend before opening the staff
  // modal. Ensures departments are saved server-side before a staff POST that
  // references them. Returns true on success.
  const syncClinicToBackend = async (): Promise<boolean> => {
    if (!clinic) return false;
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(clinic.id)) {
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
          id: clinic.id,
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          speciality: clinic.departments.join(","),
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
    if (!editingStaff || !clinic) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tenant/staff/${editingStaff.id}`,
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
        const updatedStaff = clinic.staff.map(s =>
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
    if (!clinic) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tenant/staff/${staff.id}/reactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
          },
        }
      );
      if (response.ok) {
        const updatedStaff = clinic.staff.map(s =>
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
    if (!clinic) return;
    try {
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

      if (!isUuid(clinic.id)) {
        setToastMessage("Please save the clinic details first before adding staff");
        setIsAddStaffOpen(false);
        return;
      }

      const staffId = editingStaff && isUuid(editingStaff.id) ? editingStaff.id : null;

      const response = await fetch(`${API_BASE_URL}/api/tenant/staff`, {
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
          const updatedStaff = clinic.staff.map(s =>
            s.id === editingStaff.id ? mappedStaff : s
          );
          handleUpdateClinic({ staff: updatedStaff });
          setToastMessage(`${mappedStaff.name} updated`);
        } else {
          handleUpdateClinic({ staff: [...clinic.staff, mappedStaff] });
          setToastMessage(`${mappedStaff.name} added to staff`);
        }
        setIsAddStaffOpen(false);
      } else {
        // Surface the backend's error message verbatim when possible; fall
        // back to the HTTP status so 500s without a JSON body still tell us
        // something useful.
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

      {/* Clinic workspace */}
      <div style={styles.workspaceContainer}>
        <ClinicWorkspace
          left={
            clinic ? (
              <ClinicInfoCard
                clinic={clinic}
                onUpdate={handleUpdateClinic}
                onShowToast={setToastMessage}
              />
            ) : null
          }
          right={
            clinic ? (
              <div style={styles.rightContainer}>
                <div style={styles.houseContainer}>
                  {/* Roof */}
                  <ClinicRoof style={styles.roofImage} />

                  {/* House Body — grouped arches and labels. Only active
                      staff appear here; deactivated members move to the list
                      below so they can be reactivated. */}
                  <div style={styles.houseBody}>
                    <div style={styles.staffList}>
                      {clinic.staff.filter((s: Staff) => s.active).map((staff: Staff, index: number) => (
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
                      <div style={styles.staffCardWrapper}>
                        <StaffWindow dashed onClick={handleOpenAddStaff}>
                          <Icon name="plus" size={32} tone="inherit" />
                        </StaffWindow>
                        <div style={styles.staffName}>&nbsp;</div>
                        <div style={styles.staffRole}>&nbsp;</div>
                      </div>
                    </div>
                  </div>

                  {/* Bush */}
                  <Bush style={styles.bushRight} />
                </div>

                {/* Deactivated staff — removed members kept on record. Admin
                    can reactivate them here; their history stays intact. */}
                {clinic.staff.some((s: Staff) => !s.active) && (
                  <div style={styles.deactivatedSection}>
                    <div style={styles.deactivatedTitle}>Deactivated staff</div>
                    {clinic.staff.filter((s: Staff) => !s.active).map((staff: Staff) => (
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
          clinicDepartments={clinic?.departments || []}
        />

        {/* Footer actions */}
        <div style={styles.footer}>
          <Button size="md" variant="secondaryLight" iconRight={<Icon name="help" tone="inherit" />} style={{ minWidth: 180 }}>
            Help
          </Button>
          <Button size="md" variant="dark" iconRight={<Icon name="arrow-right" tone="inherit" />} style={{ minWidth: 180 }} onClick={async () => {
            if (!clinic) return;
            if (!clinic.name.trim() || !clinic.phone.trim() || !clinic.address.trim()) {
              setToastMessage(`Please complete all fields for "${clinic.name || "Your Clinic"}"`);
              return;
            }

            const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
            try {
              const clinicId = isUuid(clinic.id) ? clinic.id : null;
              const res = await fetch(`${API_BASE_URL}/api/tenant/clinic`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
                },
                body: JSON.stringify({
                  id: clinicId,
                  name: clinic.name,
                  address: clinic.address,
                  phone: clinic.phone,
                  speciality: clinic.departments.join(","),
                }),
              });
              if (!res.ok) {
                const err = await res.json();
                setToastMessage(err.error || `Failed to save "${clinic.name}"`);
                return;
              }
              const saved = await res.json();
              handleUpdateClinic({ id: saved.id });
              onNext?.();
            } catch {
              setToastMessage("An error occurred while saving clinic");
            }
          }}>
            Next
          </Button>
        </div>
      </div>

      <Toast
        message={toastMessage}
        {...resolveToastIcon(toastMessage)}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}
