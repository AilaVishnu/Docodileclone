// Shared sample data for Storybook stories + MSW handlers.
// Kept in one place so every story shows the same realistic clinic data.
import type { Patient } from '../hooks/usePatients';
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
