import React, { useEffect, useState } from "react";
import { Clinic } from "../../components/ClinicTabs";
import { ClinicDisplayCard } from "../../components/ClinicDisplayCard/ClinicDisplayCard";
import { styles } from "./ClinicSelectionPage.styles";
import { Button } from "../../components/Button";

type ClinicSelectionPageProps = {
  onSelectClinic: (clinic: Clinic) => void;
  onLogout: () => void;
};

export function ClinicSelectionPage({ onSelectClinic, onLogout }: ClinicSelectionPageProps) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Docodile | Select Clinic";
    
    const fetchClinics = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/tenant/clinics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("docodile_token")}`,
          },
        });
        
        if (response.status === 401 || response.status === 403) {
          onLogout();
          return;
        }

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const mappedClinics: Clinic[] = data.map((c: any) => ({
              id: c.id,
              name: c.name || "Your Clinic",
              domain: c.domain || "",
              phone: c.phone || "",
              address: c.address || "",
              specialties: c.speciality ? c.speciality.split(",") : [],
              staff: [] // We don't need staff for selection card
            }));
            setClinics(mappedClinics);
          } else {
            console.error("API did not return an array of clinics", data);
            setClinics([]);
          }
        } else {
          console.error("Failed to fetch clinics, status:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch clinics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loaderArea}>
          <p style={styles.loadingText}>Loading your clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.grid}>
        {clinics.length > 0 ? (
          clinics.map((clinic) => (
            <ClinicDisplayCard 
              key={clinic.id} 
              clinic={clinic} 
              onSelect={() => onSelectClinic(clinic)} 
            />
          ))
        ) : (
          <div style={{ ...styles.loaderArea, flexDirection: "column", gap: "20px" }}>
            <p style={styles.loadingText}>No clinics found.</p>
            <Button variant="dark" onClick={() => (window.location.href = "/build")}>
              Create Your First Clinic
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
