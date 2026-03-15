import React from "react";
import { Tabs, TabItem } from "../Tabs";

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
  const items: TabItem[] = clinics.map((clinic) => ({
    id: clinic.id,
    label: clinic.name,
  }));

  const actions = [
    {
      label: "+ Add Clinic",
      onClick: onAddClinic,
    },
  ];

  return (
    <Tabs
      items={items}
      activeId={activeClinicId}
      onSelect={onSelectClinic}
      actions={actions}
    />
  );
}
