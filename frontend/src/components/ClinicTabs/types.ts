// Shared clinic/staff domain types. These previously lived on the ClinicTabs
// component (now removed as dead code — it was never rendered); they're kept
// here so the existing `import { Clinic, Staff } from ".../ClinicTabs"` paths
// stay valid via the folder's index re-export.

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
  accountStatus?: "ACTIVE" | "PENDING_ACTIVATION";
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
