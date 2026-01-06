import React, { useState } from "react";
import { ClinicTabs, Clinic } from "../../components/ClinicTabs";
import { styles } from "./BuildYourClinicPage.styles";
import { ClinicWorkspace } from "../../components/ClinicWorkspace";
import { Button } from "../../components/Button";
import { ClinicInfoCard } from "../../components/ClinicInfoCard";
import { ReactComponent as NextIcon } from "../../assets/Arrow Right.svg";
import { ReactComponent as HelpIcon } from "../../assets/Help.svg";
import { ReactComponent as PlusIcon } from "../../assets/Plus.svg";

export function BuildYourClinicPage() {
  const [clinics, setClinics] = useState<Clinic[]>([
    { id: "1", name: "Your Clinic", location: "Add Clinic Address" }
  ]);

  const [activeClinicId, setActiveClinicId] = useState(clinics[0].id);

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
      <h2 style={{...styles.title, marginBottom: 32}}>Build your Clinic</h2>

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
              <Button size="sm" variant="dark" iconLeft={<PlusIcon />}>
                Add Staff
              </Button>
            </div>
          }
        />

        {/* Footer actions */}
        <div style={styles.footer}>
          <Button size="md" variant="secondaryLight" iconRight={<HelpIcon />}>
            Help
          </Button>

          <Button size="md" variant="primary" iconRight={<NextIcon />}>
            Next
          </Button>
        </div>
      </div>

    </div>
  );
}
