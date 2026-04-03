import React from "react";
import { Clinic } from "../ClinicTabs";
import { styles } from "./ClinicDisplayCard.styles";
import { Button } from "../Button";
import { ReactComponent as BuildingIcon } from "../../assets/Buildings.svg";
import { ReactComponent as PhoneIcon } from "../../assets/Phone.svg";
import { ReactComponent as StethoscopeIcon } from "../../assets/Stethoscope.svg";
import { ReactComponent as LocationIcon } from "../../assets/Map Point.svg";

type ClinicDisplayCardProps = {
  clinic: Clinic;
  onSelect: (id: string) => void;
};

export function ClinicDisplayCard({ clinic, onSelect }: ClinicDisplayCardProps) {
  const { id, name, domain, phone, address, specialties } = clinic;

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
            <BuildingIcon width={24} height={24} />
          </div>
          <p style={styles.infoText}>{name}</p>
        </div>

        {/* Phone */}
        <div style={styles.infoItem}>
          <div style={styles.iconWrapper}>
            <PhoneIcon width={24} height={24} />
          </div>
          <p style={styles.infoText}>{phone || "No phone added"}</p>
        </div>

        {/* Specialties / Tags */}
        <div style={styles.infoItem}>
          <div style={styles.iconWrapper}>
            <StethoscopeIcon width={24} height={24} />
          </div>
          <div style={styles.tagList}>
            {specialties.length > 0 ? (
              specialties.map((spec, index) => (
                <span key={index} style={styles.tag}>
                  {spec}
                </span>
              ))
            ) : (
              <p style={styles.infoText}>No specialties</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div style={styles.infoItem}>
          <div style={styles.iconWrapper}>
            <LocationIcon width={24} height={24} />
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
