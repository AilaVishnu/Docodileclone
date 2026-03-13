import React, { useEffect, useState } from "react";
import { AddStaffModal } from "../../components/AddStaffModal";
import { ClinicTabs, Clinic, Staff } from "../../components/ClinicTabs";
import { styles } from "./BuildYourClinicPage.styles";
import { ClinicWorkspace } from "../../components/ClinicWorkspace";
import { Button } from "../../components/Button";
import { ClinicInfoCard } from "../../components/ClinicInfoCard";
import { StaffIllustration } from "../../components/AddStaffModal/StaffIllustration";
import { ReactComponent as NextIcon } from "../../assets/Arrow Right.svg";
import { ReactComponent as HelpIcon } from "../../assets/Help.svg";
import { ReactComponent as PlusIcon } from "../../assets/Plus.svg";
import { ReactComponent as ClinicRoof } from "../../assets/clinic roof.svg";

export function BuildYourClinicPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [activeClinicId, setActiveClinicId] = useState<string>("");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);

  useEffect(() => {
    document.title = "Docodile | Build Your Clinic";
    
    const fetchClinics = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/tenant/clinics", {
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
                const staffResponse = await fetch(`http://localhost:8080/api/tenant/clinics/${c.id}/staff`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
                  },
                });
                if (staffResponse.ok) {
                  const staffData = await staffResponse.json();
                  staffList = staffData.map((s: any) => ({
                    id: s.id,
                    name: s.name || "",
                    role: s.role.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" "),
                    gender: s.gender || "",
                    email: s.email || "",
                    phone: s.phone || "",
                    speciality: s.speciality || "",
                    registrationNo: s.registrationNo || ""
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
                specialties: c.speciality ? c.speciality.split(",") : [],
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
              specialties: [],
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
    const newClinic: Clinic = {
      id: String(Date.now()),
      name: `Your Clinic ${clinics.length + 1}`,
      domain: "",
      phone: "",
      address: "",
      specialties: [],
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

  const handleOpenAddStaff = () => {
    setEditingStaff(undefined);
    setIsAddStaffOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setIsAddStaffOpen(true);
  };

  const handleSaveStaff = async (data: Omit<Staff, "id">) => {
    try {
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      const staffId = editingStaff && isUuid(editingStaff.id) ? editingStaff.id : null;

      const response = await fetch(`http://localhost:8080/api/tenant/clinics/${activeClinicId}/staff`, {
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
          speciality: data.speciality,
          registrationNo: data.registrationNo
        }),
      });

      if (response.ok) {
        const savedStaffData = await response.json();
        const mappedStaff: Staff = {
          id: savedStaffData.id,
          name: savedStaffData.name || "",
          role: savedStaffData.role.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" "),
          gender: savedStaffData.gender || "",
          email: savedStaffData.email || "",
          phone: savedStaffData.phone || "",
          speciality: savedStaffData.speciality || "",
          registrationNo: savedStaffData.registrationNo || ""
        };

        if (editingStaff) {
          const updatedStaff = activeClinic.staff.map(s =>
            s.id === editingStaff.id ? mappedStaff : s
          );
          handleUpdateClinic({ staff: updatedStaff });
        } else {
          handleUpdateClinic({ staff: [...activeClinic.staff, mappedStaff] });
        }
        setIsAddStaffOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to save staff member");
      }
    } catch (error) {
      console.error("Failed to save staff", error);
      alert("An error occurred while saving staff member");
    }
  };


  return (
    <div style={styles.page}>
      {/* Page title */}
      <h2 style={{ ...styles.title, marginBottom: 32 }}>Build your Clinic</h2>

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
              />
            ) : null
          }
          right={
            activeClinic ? (
              <div style={styles.rightContainer}>
                <div style={styles.houseContainer}>
                  {/* Roof */}
                  <ClinicRoof style={styles.roofImage} />

                  {/* House Body — grouped arches and labels */}
                  <div style={styles.houseBody}>
                    <div style={styles.staffList}>
                      {activeClinic.staff.map((staff: Staff) => (
                        <div key={staff.id} style={styles.staffCardWrapper}>
                          <div
                            style={styles.staffCard}
                            onClick={() => handleEditStaff(staff)}
                          >
                            <StaffIllustration
                              role={staff.role}
                              gender={staff.gender}
                              width="100%"
                              height="100%"
                              borderRadius="60px 60px 0 0"
                            />
                          </div>
                          <div style={styles.staffName}>{staff.name}</div>
                          <div style={styles.staffRole}>{staff.role}</div>
                        </div>
                      ))}

                      {/* Add Staff arch */}
                      <div style={styles.staffCardWrapper}>
                        <div style={styles.addStaffCard} onClick={handleOpenAddStaff}>
                          <PlusIcon style={{ width: 32, height: 32 }} />
                        </div>
                        <div style={styles.staffName}>&nbsp;</div>
                        <div style={styles.staffRole}>&nbsp;</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null
          }
        />

        <AddStaffModal
          isOpen={isAddStaffOpen}
          onClose={() => setIsAddStaffOpen(false)}
          onSave={handleSaveStaff}
          initialData={editingStaff}
        />

        {/* Footer actions */}
        <div style={styles.footer}>
          <Button size="md" variant="secondaryLight" iconRight={<HelpIcon />}>
            Help
          </Button>
          <Button size="md" variant="dark" iconRight={<NextIcon />}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
