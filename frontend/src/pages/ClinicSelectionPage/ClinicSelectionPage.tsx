import React, { useEffect, useState } from "react";
import { styles } from "./ClinicSelectionPage.styles";
import { ClinicCard } from "../../components/ClinicCard";
import { API_BASE_URL } from "../../apiConfig";

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

  const handleSelectClinic = async (clinicId: string, clinicName: string) => {
    try {
      const token = localStorage.getItem("docodile_token");
      const res = await fetch(`${API_BASE_URL}/auth/switch-clinic`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clinicId }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("docodile_token", data.token);
        if (data.clinicId) localStorage.setItem("docodile_clinic_id", data.clinicId);
        if (data.clinicName) localStorage.setItem("docodile_clinic_name", data.clinicName);
        onSelectClinic(clinicId, clinicName);
        return;
      }
    } catch { /* fall through to non-admin path */ }
    // Non-admin users (staff) go straight through — their token already has the clinic
    onSelectClinic(clinicId, clinicName);
  };

  useEffect(() => {
    document.title = "Docodile | Select Clinic";

    const fetchClinics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tenant/clinics`, {
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
            onGoToDashboard={() => handleSelectClinic(clinic.id, clinic.name)}
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
