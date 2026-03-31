import React, { useEffect, useState } from "react";
import { styles } from "./ClinicSelectionPage.styles";
import { ClinicCard } from "../../components/ClinicCard";

type ClinicData = {
  id: string;
  name: string;
  domain: string;
  phone: string;
  address: string;
  specialties: string[];
};

type ClinicSelectionPageProps = {
  onSelectClinic: (clinicId: string, clinicName: string) => void;
  onGoToBuild: () => void;
  onLogout?: () => void;
};

export function ClinicSelectionPage({ onSelectClinic, onGoToBuild, onLogout }: ClinicSelectionPageProps) {
  const [clinics, setClinics] = useState<ClinicData[]>([]);

  useEffect(() => {
    document.title = "Docodile | Select Clinic";

    const fetchClinics = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/tenant/clinics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const mapped: ClinicData[] = data.map((c: any) => ({
            id: c.id,
            name: c.name || "Your Clinic",
            domain: c.domain || "",
            phone: c.phone || "",
            address: c.address || "",
            specialties: c.speciality ? c.speciality.split(",") : [],
          }));
          setClinics(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch clinics:", error);
      }
    };

    fetchClinics();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.cardGrid}>
        {clinics.map((clinic) => (
          <ClinicCard
            key={clinic.id}
            name={clinic.name}
            domain={clinic.domain}
            phone={clinic.phone}
            address={clinic.address}
            specialties={clinic.specialties}
            onGoToDashboard={() => onSelectClinic(clinic.id, clinic.name)}
          />
        ))}
      </div>

      <button style={styles.buildLink} onClick={onGoToBuild}>
        Go to 'Build Your Clinic'
      </button>

      <button style={styles.logoutButton} onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}
