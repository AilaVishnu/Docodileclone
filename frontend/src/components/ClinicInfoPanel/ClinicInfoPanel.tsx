import React, { useState, useEffect } from "react";
import { styles } from "./ClinicInfoPanel.styles";

type StaffMember = {
  id: string;
  name: string;
  role?: string;
};

export type ClinicInfoPanelProps = {
  clinicName: string;
  location: string;
  doctors: StaffMember[];
  frontDesk: StaffMember[];
  pharmacy: StaffMember[];
  onClinicRename: (name: string) => void;
  onLocationChange: (location: string) => void;
};

export function ClinicInfoPanel({
  clinicName,
  location,
  doctors,
  frontDesk,
  pharmacy,
  onClinicRename,
  onLocationChange,
}: ClinicInfoPanelProps) {
  type EditableField = "name" | "location" | null;

  const [editingField, setEditingField] = useState<EditableField>(null);
  const [draftValue, setDraftValue] = useState("");

  useEffect(() => {
    setEditingField(null);
    setDraftValue("");
  }, [clinicName, location]);

  const startEditing = (field: EditableField, value: string) => {
    setEditingField(field);
    setDraftValue(value);
  };

  const commit = () => {
    if (!draftValue.trim()) {
      setEditingField(null);
      return;
    }

    if (editingField === "name") {
      onClinicRename(draftValue.trim());
    }

    if (editingField === "location") {
      onLocationChange(draftValue.trim());
    }

    setEditingField(null);
  };

  const cancel = () => {
    setEditingField(null);
    setDraftValue("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {editingField === "name" ? (
          <input
            autoFocus
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            style={styles.nameInput}
          />
        ) : (
          <h2
            style={styles.clinicName}
            onClick={() => startEditing("name", clinicName)}
          >
            {clinicName}
          </h2>
        )}

        {editingField === "location" ? (
          <input
            autoFocus
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            style={styles.locationInput}
          />
        ) : (
          <p
            style={styles.location}
            onClick={() => startEditing("location", location)}
          >
            {location}
          </p>
        )}

      </div>

      {/* Doctors */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Doctors</h4>
        {doctors.length > 0 ? (
          doctors.map((doc) => (
            <p key={doc.id} style={styles.item}>
              {doc.name}
              {doc.role && ` / ${doc.role}`}
            </p>
          ))
        ) : (
          <p style={styles.empty}>No doctors added</p>
        )}
      </section>

      {/* Front Desk */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Front Desk</h4>
        {frontDesk.length > 0 ? (
          frontDesk.map((staff) => (
            <p key={staff.id} style={styles.item}>
              {staff.name}
            </p>
          ))
        ) : (
          <p style={styles.empty}>No front desk staff added</p>
        )}
      </section>

      {/* Pharmacy */}
      <section style={styles.section}>
        <h4 style={styles.sectionTitle}>Pharmacy</h4>
        {pharmacy.length > 0 ? (
          pharmacy.map((staff) => (
            <p key={staff.id} style={styles.item}>
              {staff.name}
            </p>
          ))
        ) : (
          <p style={styles.empty}>No pharmacy staff added</p>
        )}
      </section>
    </div>
  );
}
