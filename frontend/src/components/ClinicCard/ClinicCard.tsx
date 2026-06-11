import React from "react";
import { styles } from "./ClinicCard.styles";
import { Button } from "../Button";
import { DomainInput } from "../Input/DomainInput/DomainInput";
import { ReactComponent as BuildingIcon } from "../../assets/Buildings.svg";
import { ReactComponent as PhoneIcon } from "../../assets/Phone.svg";
import { ReactComponent as LocationIcon } from "../../assets/Map Point.svg";
import { ReactComponent as SpecialtyIcon } from "../../assets/Stethoscope.svg";

type ClinicCardProps = {
  name: string;
  domain: string;
  phone: string;
  address: string;
  departments: string[];
  onGoToDashboard?: () => void;
  onEditDetails?: () => void;
};

export function ClinicCard({
  name,
  domain,
  phone,
  address,
  departments,
  onGoToDashboard,
  onEditDetails,
}: ClinicCardProps) {
  return (
    <div style={styles.card}>
      <h3 style={styles.clinicName}>{name || "Your Clinic"}</h3>

      {domain && <DomainInput value={domain} readOnly />}

      <div style={styles.fieldRow}>
        <span style={styles.fieldIcon}><BuildingIcon width={20} height={20} /></span>
        <span style={styles.fieldText}>{name || "—"}</span>
      </div>

      <div style={styles.fieldRow}>
        <span style={styles.fieldIcon}><PhoneIcon width={20} height={20} /></span>
        <span style={styles.fieldText}>{phone || "—"}</span>
      </div>

      {departments.length > 0 && (
        <div style={styles.specialtyRow}>
          <span style={styles.fieldIcon}><SpecialtyIcon width={20} height={20} /></span>
          <div style={styles.tagRow}>
            {departments.map((d, i) => (
              <span key={i} style={styles.tag}>
                {d} <span style={styles.tagX}>✕</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {address && (
        <div style={styles.fieldRowMultiline}>
          <span style={styles.fieldIcon}><LocationIcon width={20} height={20} /></span>
          <span style={styles.fieldText}>{address}</span>
        </div>
      )}

      <div style={styles.buttonWrapper}>
        {onEditDetails && (
          <Button size="sm" variant="light" onClick={onEditDetails}>
            Edit Details
          </Button>
        )}
        {onGoToDashboard && (
          <Button size="sm" variant="dark" onClick={onGoToDashboard}>
            Go to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
