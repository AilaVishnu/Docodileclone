import React, { useEffect, useState } from "react";
import { AddStaffModal } from "../../components/AddStaffModal";
import { ClinicTabs, Clinic, Staff } from "../../components/ClinicTabs";
import { styles } from "./BuildYourClinicPage.styles";
import { ClinicWorkspace } from "../../components/ClinicWorkspace";
import { Button } from "../../components/Button";
import { ClinicInfoCard } from "../../components/ClinicInfoCard";
import { ReactComponent as NextIcon } from "../../assets/Arrow Right.svg";
import { ReactComponent as HelpIcon } from "../../assets/Help.svg";
import { ReactComponent as PlusIcon } from "../../assets/Plus.svg";
import { ReactComponent as ClinicRoof } from "../../assets/clinic roof.svg";
import { ReactComponent as DefaultAvatar } from "../../assets/Doctor Img.svg";

export function BuildYourClinicPage() {
  useEffect(() => {
    document.title = "Docodile | Build Your Clinic";
  }, []);

  const [clinics, setClinics] = useState<Clinic[]>([
    {
      id: "1",
      name: "Your Clinic",
      domain: "",
      phone: "",
      address: "",
      specialties: [],
      staff: []
    }
  ]);

  const [activeClinicId, setActiveClinicId] = useState(clinics[0].id);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);

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

  const handleSaveStaff = (data: Omit<Staff, "id">) => {
    if (editingStaff) {
      const updatedStaff = activeClinic.staff.map(s =>
        s.id === editingStaff.id ? { ...data, id: editingStaff.id } : s
      );
      handleUpdateClinic({ staff: updatedStaff });
    } else {
      const newStaff: Staff = { ...data, id: String(Date.now()) };
      handleUpdateClinic({ staff: [...activeClinic.staff, newStaff] });
    }
    setIsAddStaffOpen(false);
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
            <ClinicInfoCard
              clinic={activeClinic}
              onUpdate={handleUpdateClinic}
            />
          }
          right={
            <div style={styles.rightContainer}>
              <div style={styles.houseContainer}>
                {/* Roof */}
                <ClinicRoof style={styles.roofImage} />

                {/* House Body — avatar arches only */}
                <div style={styles.houseBody}>
                  <div style={styles.staffList}>
                    {activeClinic.staff.map((staff: Staff) => (
                      <div
                        key={staff.id}
                        style={styles.staffCard}
                        onClick={() => handleEditStaff(staff)}
                      >
                        <DefaultAvatar style={styles.staffImage} />
                      </div>
                    ))}

                    {/* Add Staff arch */}
                    <div style={styles.addStaffCard} onClick={handleOpenAddStaff}>
                      <PlusIcon style={{ width: 32, height: 32 }} />
                    </div>
                  </div>
                </div>

                {/* Labels row — below the house body, same background */}
                <div style={styles.staffLabelsRow}>
                  {activeClinic.staff.map((staff: Staff) => (
                    <div key={staff.id} style={styles.staffLabelWrapper}>
                      <div style={styles.staffName}>{staff.name}</div>
                      <div style={styles.staffRole}>{staff.role}</div>
                    </div>
                  ))}
                  {/* Spacer for add card column */}
                  <div style={styles.staffLabelWrapper} />
                </div>
              </div>
            </div>
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
