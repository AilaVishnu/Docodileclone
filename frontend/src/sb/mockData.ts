// Shared sample data for Storybook stories + MSW handlers.
// Kept in one place so every story shows the same realistic clinic data.
import type { Patient } from '../hooks/usePatients';
import type { Doctor } from '../hooks/useDoctors';
import type { Suggestion } from '../hooks/useSuggestions';
import type { PharmacyStockDTO } from '../api/pharmacy';

// age is persisted in MONTHS (see utils/patientLabel.ts).
export const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Ramesh Babu',
    phone: '+918885672664',
    email: 'ramesh@example.com',
    gender: 'male',
    dob: '1986-03-12',
    age: 456,
    displayNo: 12,
    lastVisitDate: '2026-05-30',
    treatingDoctorIds: ['d1'],
    treatingDepartments: ['Dermatology'],
    photoUrl: null,
  },
  {
    id: 'p2',
    name: 'Sita Lakshmi',
    phone: '+919000012345',
    email: null,
    gender: 'female',
    dob: '1994-07-02',
    age: 384,
    displayNo: 13,
    lastVisitDate: '2026-06-01',
    treatingDoctorIds: ['d2'],
    treatingDepartments: ['Pediatrics'],
    photoUrl: null,
  },
  {
    id: 'p3',
    name: 'Arjun Mehta',
    phone: '+919812345678',
    email: 'arjun@example.com',
    gender: 'male',
    dob: '2001-11-20',
    age: 294,
    displayNo: 14,
    lastVisitDate: null,
    treatingDoctorIds: [],
    treatingDepartments: [],
    photoUrl: null,
  },
];

// Archived patients (Settings → Archived patients table).
export const mockArchivedPatients = [
  { id: 'ap1', name: 'Old Patient One', phone: '+91 90000 11111', gender: 'male', archivedAt: '2026-04-02' },
  { id: 'ap2', name: 'Sunita Verma', phone: '+91 90000 22222', gender: 'female', archivedAt: '2026-03-15' },
  { id: 'ap3', name: 'Anonymous', phone: null, gender: null, archivedAt: null },
];

// Clinic services catalog (Services page table). ServiceDTO shape (durationMin).
export const mockServices = [
  { id: 's1', name: 'Consultation', code: 'GC', price: 500, durationMin: 15, discount: 0, discountMode: '%', gst: 0 },
  { id: 's2', name: 'Skin Biopsy', code: 'SB', price: 2500, durationMin: 30, discount: 10, discountMode: '%', gst: 18 },
  { id: 's3', name: 'Dressing', code: 'DR', price: 300, durationMin: 10, discount: 0, discountMode: '%', gst: 0 },
  { id: 's4', name: 'Laser Session', code: 'LS', price: 4000, durationMin: 45, discount: 500, discountMode: '₹', gst: 18 },
];

// Doctor ids match mockPatients' treatingDoctorIds (d1/d2). Used by useDoctors
// (GET /api/doctors) so doctor pickers (NewPrescriptionModal etc.) populate.
export const mockDoctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Anjali Rao', department: 'Dermatology', specialty: 'Cosmetic Dermatology', registrationNo: 'KMC-12345', qualification: 'MBBS, MD (Dermatology)', medicalCouncil: 'Karnataka Medical Council', experienceYears: 12 },
  { id: 'd2', name: 'Dr. Vikram Nair', department: 'Pediatrics', specialty: 'General Pediatrics', registrationNo: 'KMC-67890', qualification: 'MBBS, DCH', medicalCouncil: 'Karnataka Medical Council', experienceYears: 8 },
  { id: 'd3', name: 'Dr. Meera Iyer', department: 'General Medicine', specialty: null, registrationNo: null, qualification: 'MBBS', medicalCouncil: null, experienceYears: 5 },
];

const SUGGESTION_BANK: Record<string, string[]> = {
  allergies: ['Penicillin', 'Sulfa drugs', 'Dust', 'Pollen', 'Peanuts'],
  familyHistory: ['Diabetes', 'Hypertension', 'Asthma', 'Thyroid disorder'],
  diagnosis: ['Acne vulgaris', 'Eczema', 'Psoriasis', 'Tinea corporis'],
  complaints: ['Itching', 'Redness', 'Dryness', 'Rash'],
  default: ['Example one', 'Example two', 'Example three'],
};

export function mockSuggestions(field: string): Suggestion[] {
  const values = SUGGESTION_BANK[field] ?? SUGGESTION_BANK.default;
  return values.map((value, i) => ({
    id: `${field}-${i}`,
    field,
    value,
    useCount: values.length - i,
  }));
}

export const mockPharmacyStock: PharmacyStockDTO[] = [
  {
    id: 'm1',
    name: 'Amoxicillin 500mg',
    category: 'Tablets',
    form: 'tablet',
    invoiceNo: 'INV-1',
    batch: 'B1',
    packPrice: 80,
    packMrp: 100,
    unitsPerPack: 10,
    unitPrice: 10,
    unitsInStock: 240,
    expiry: '2027-01-01',
    discountPct: 0,
    gstPct: 12,
  },
  {
    id: 'm2',
    name: 'Cetirizine 10mg',
    category: 'Tablets',
    form: 'tablet',
    invoiceNo: 'INV-2',
    batch: 'B2',
    packPrice: 20,
    packMrp: 30,
    unitsPerPack: 10,
    unitPrice: 3,
    unitsInStock: 500,
    expiry: '2026-12-01',
    discountPct: 0,
    gstPct: 12,
  },
  {
    id: 'm3',
    name: 'Calamine Lotion',
    category: 'Topicals',
    form: 'cream',
    invoiceNo: 'INV-3',
    batch: 'B3',
    packPrice: 60,
    packMrp: 75,
    unitsPerPack: 1,
    unitPrice: 60,
    unitsInStock: 40,
    expiry: '2027-03-01',
    discountPct: 0,
    gstPct: 5,
  },
];
