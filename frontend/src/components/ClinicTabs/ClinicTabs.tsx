import React from "react";
import { Tabs, TabItem } from "../Tabs";
import { colors } from "../../styles/theme";
export type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  role: string;
  department: string;
  specialty: string;
  registrationNo: string;
  qualification: string;
  medicalCouncil: string;
  experienceYears: string;
  /** False once the staff member has been removed/deactivated from the
   *  clinic. They stay on record (history) but are hidden from booking and
   *  login, and surface in the "Deactivated" list for reactivation. */
  active: boolean;
};

export type Clinic = {
  id: string;
  name: string;
  domain: string;
  phone: string;
  address: string;
  departments: string[];
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
  const items: TabItem[] = clinics.map((clinic) => ({
    id: clinic.id,
    label: clinic.name || "Your Clinic",
  }));

  const actions = [
    {
      label: "+ Add Clinic",
      onClick: onAddClinic,
      disabled: false,
    },
  ];

  return (
    <Tabs
      items={items}
      activeId={activeClinicId}
      onSelect={onSelectClinic}
      actions={actions}
      activeBackgroundColor={colors.primary200}
    />
  );
}
