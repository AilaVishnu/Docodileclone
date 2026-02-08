import React, { useState } from "react";
import { AddStaffModal } from "../../components/AddStaffModal";
import { ClinicTabs, Clinic } from "../../components/ClinicTabs";
import { styles } from "./BuildYourClinicPage.styles";
import { ClinicWorkspace } from "../../components/ClinicWorkspace";
import { Button } from "../../components/Button";
import { ClinicInfoCard } from "../../components/ClinicInfoCard";
import { ReactComponent as NextIcon } from "../../assets/Arrow Right.svg";
import { ReactComponent as HelpIcon } from "../../assets/Help.svg";
import { ReactComponent as PlusIcon } from "../../assets/Plus.svg";
import { ReactComponent as ClinicRoof } from "../../assets/clinic roof.svg";
import { ReactComponent as DefaultAvatar } from "../../assets/Doctor Img.svg";

type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  role: string;
  speciality: string;
  registrationNo: string;
};

export function BuildYourClinicPage() {
  const [clinics, setClinics] = useState<Clinic[]>([
    { id: "1", name: "Your Clinic", location: "Add Clinic Address" }
  ]);

  const [activeClinicId, setActiveClinicId] = useState(clinics[0].id);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);

  const handleAddClinic = () => {
    const newClinic: Clinic = {
      id: String(clinics.length + 1),
      name: `Your Clinic ${clinics.length + 1}`,
      location: "Add Clinic Address"
    };

    setClinics([...clinics, newClinic]);
    setActiveClinicId(newClinic.id);
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
      // Update existing
      setStaffList(staffList.map(s =>
        s.id === editingStaff.id
          ? { ...data, id: editingStaff.id }
          : s
      ));
    } else {
      // Create new
      const newStaff: Staff = {
        ...data,
        id: String(Date.now()),
      };
      setStaffList([...staffList, newStaff]);
    }
    setIsAddStaffOpen(false);
  };

  return (
    <div style={styles.page}>
      {/* Page title */}
      <h2 style={{ ...styles.title, marginBottom: 32 }}>Build your Clinic</h2>

      {/* Clinic tabs */}
      <div style={styles.workspaceContainer}>
        <ClinicTabs
          clinics={clinics}
          activeClinicId={activeClinicId}
          onSelectClinic={setActiveClinicId}
          onAddClinic={handleAddClinic}
        />

        {/* Main workspace */}
        <ClinicWorkspace
          left={
            <ClinicInfoCard />
          }
          right={
            <div style={styles.rightContainer}>
              <div style={styles.houseContainer}>
                {/* Roof */}
                <ClinicRoof style={styles.roofImage} />

                {/* House Body */}
                <div style={styles.houseBody}>
                  <div style={styles.staffList}>
                    {staffList.map((staff) => (
                      <div
                        key={staff.id}
                        style={styles.staffCard}
                        onClick={() => handleEditStaff(staff)}
                      >
                        <DefaultAvatar style={styles.staffImage} />
                        <div style={styles.staffName}>{staff.name}</div>
                        <div style={styles.staffRole}>{staff.role}</div>
                      </div>
                    ))}

                    {/* Add Staff Button Card */}
                    <div
                      style={styles.addStaffCard}
                      onClick={handleOpenAddStaff}
                    >
                      <PlusIcon style={{ width: 40, height: 40, color: "white" }} />
                    </div>
                  </div>
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
