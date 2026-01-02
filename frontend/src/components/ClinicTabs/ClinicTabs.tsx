import React from "react";
import { styles } from "./ClinicTabs.styles";

export type Clinic = {
  id: string;
  name: string;
  location: string;
};

type ClinicTabsProps = {
  clinics: Clinic[];
  activeClinicId: string;
  onSelectClinic: (id: string) => void;
  onAddClinic: () => void;
};

export function ClinicTabs({
  clinics,
  activeClinicId,
  onSelectClinic,
  onAddClinic,
}: ClinicTabsProps) {
  return (
    <div style={styles.container}>
      {clinics.map((clinic) => {
        const isActive = clinic.id === activeClinicId;

        return (
          <button
            key={clinic.id}
            onClick={() => onSelectClinic(clinic.id)}
            style={{
              ...styles.tab,
              ...(isActive ? styles.activeTab : {}),
            }}
          >
            {clinic.name}
          </button>
        );
      })}

      <button onClick={onAddClinic} style={styles.addClinic}>
        + Add Clinic
      </button>
    </div>
  );
}
