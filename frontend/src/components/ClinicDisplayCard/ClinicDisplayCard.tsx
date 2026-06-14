import React from "react";
import { Clinic } from "../ClinicTabs";
import { styles } from "./ClinicDisplayCard.styles";
import { Button } from "../Button";
import { Icon } from "../Icon";

type ClinicDisplayCardProps = {
  clinic: Clinic;
  onSelect: (id: string) => void;
};

export function ClinicDisplayCard({ clinic, onSelect }: ClinicDisplayCardProps) {
  const { id, name, domain, phone, address, departments } = clinic;

  // Header name (shorter brand name if available, otherwise clinic name)
  const brandName = name.split(" ")[0];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.clinicTitle}>{brandName}</h3>
        <div style={styles.domainSection}>
          <div style={styles.domainPrefix}>{domain || clinic.name.toLowerCase().replace(/\s+/g, "")}</div>
          <div style={styles.domainSuffix}>.docodile.app</div>
        </div>
      </div>

      <div style={styles.infoList}>
        {/* Building / Name */}
        <div style={styles.infoItem}>
          <div style={styles.iconWrapper}>
            <Icon name="buildings" size={24} tone="inherit" />
          </div>
          <p style={styles.infoText}>{name}</p>
        </div>

        {/* Phone */}
        <div style={styles.infoItem}>
          <div style={styles.iconWrapper}>
            <Icon name="phone" size={24} tone="inherit" />
          </div>
          <p style={styles.infoText}>{phone || "No phone added"}</p>
        </div>

        {/* Departments / Tags */}
        <div style={styles.infoItem}>
          <div style={styles.iconWrapper}>
            <Icon name="stethoscope" size={24} tone="inherit" />
          </div>
          <div style={styles.tagList}>
            {departments.length > 0 ? (
              departments.map((d, index) => (
                <span key={index} style={styles.tag}>
                  {d}
                </span>
              ))
            ) : (
              <p style={styles.infoText}>No departments</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div style={styles.infoItem}>
          <div style={styles.iconWrapper}>
            <Icon name="map-point" size={24} tone="inherit" />
          </div>
          <p style={styles.addressText}>{address || "No address added"}</p>
        </div>
      </div>

      <div style={styles.footer}>
        <Button size="sm" variant="dark" onClick={() => onSelect(id)}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
