import React from "react";
import { styles } from "./ClinicTabs.styles";

export type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  role: string;
  speciality: string;
  registrationNo: string;
};

export type Clinic = {
  id: string;
  name: string;
  domain: string;
  phone: string;
  address: string;
  specialties: string[];
  staff: Staff[];
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
