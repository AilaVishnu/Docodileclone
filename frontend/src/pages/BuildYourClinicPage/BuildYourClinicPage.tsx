import React, { useState } from "react";
import { ClinicTabs, Clinic } from "../../components/ClinicTabs";
import { Card } from "../../components/Card";
import { styles } from "./BuildYourClinicPage.styles";
import { ClinicWorkspace } from "../../components/ClinicWorkspace";
import { ClinicInfoPanel } from "../../components/ClinicInfoPanel";
import { HintCard } from "../../components/HintCard";
import { Button } from "../../components/Button";

export function BuildYourClinicPage() {
  const [clinics, setClinics] = useState<Clinic[]>([
    { id: "1", name: "Your Clinic", location: "Add Clinic Address" }
  ]);

  const [activeClinicId, setActiveClinicId] = useState(clinics[0].id);

  const handleRenameClinic = (id: string, name: string) => {
    setClinics((prev) =>
      prev.map((clinic) =>
        clinic.id === id ? { ...clinic, name } : clinic
      )
    );
  };

  const handleRenameLocation = (id: string, location: string) => {
    setClinics((prev) =>
      prev.map((clinic) =>
        clinic.id === id ? { ...clinic, location } : clinic
      )
    );
  };


  const activeClinic = clinics.find(
    (clinic) => clinic.id === activeClinicId
  )!;

  const handleAddClinic = () => {
    const newClinic: Clinic = {
      id: String(clinics.length + 1),
      name: `Your Clinic ${clinics.length + 1}`,
      location: "Add Clinic Address"
    };

    setClinics([...clinics, newClinic]);
    setActiveClinicId(newClinic.id);
  };

  return (
    <div style={styles.page}>
      {/* Page title */}
      <h1 style={{...styles.title, marginBottom: 32}}>Build your Clinic</h1>

      {/* Clinic tabs */}
      <div style={styles.workspaceContainer}>
        <ClinicTabs
          clinics={clinics}
          activeClinicId={activeClinicId}
          onSelectClinic={setActiveClinicId}
          onAddClinic={handleAddClinic}
        />

        {/* Main workspace */}
        <Card>
          <ClinicWorkspace
            left={
              <ClinicInfoPanel
                clinicName={activeClinic.name}
                location={activeClinic.location}
                onClinicRename={(newName) =>
                  handleRenameClinic(activeClinic.id, newName)
                }
                onLocationChange={(newLocation) =>
                  handleRenameLocation(activeClinic.id, newLocation)
                }
                doctors={[]}
                frontDesk={[]}
                pharmacy={[]}
              />
            }
            right={
              <div style={styles.rightContainer}>
                <Button size="sm" variant="dark">
                  + Add Staff
                </Button>
                <HintCard
                  title="Your clinic is ready"
                  description="Add doctors, front desk, or pharmacy staff to begin managing your clinic."
                />
              </div>
            }
          />
        </Card>

        {/* Footer actions */}
        <div style={styles.footer}>
          <Button size="sm" variant="dark">
            Help me
          </Button>

          <Button size="sm" variant="primary">
            Next
          </Button>
        </div>
      </div>

    </div>
  );
}
