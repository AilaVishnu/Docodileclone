// Default MSW request handlers used by every story (overridable per story via
// parameters.msw.handlers). Covers the common GETs so data-driven components
// render with realistic content instead of erroring on a dead backend.
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../apiConfig';
import { mockPatients, mockDoctors, mockArchivedPatients, mockSuggestions, mockPharmacyStock } from './mockData';

const B = API_BASE_URL;

export const handlers = [
  http.get(`${B}/api/patients`, () => HttpResponse.json(mockPatients)),

  // Clinic doctors — powers useDoctors (doctor pickers in NewPrescriptionModal etc.).
  http.get(`${B}/api/doctors`, () => HttpResponse.json(mockDoctors)),

  // Settings → Archived patients table.
  http.get(`${B}/api/patients/archived`, () => HttpResponse.json(mockArchivedPatients)),

  http.get(`${B}/api/suggestions`, ({ request }) => {
    const field = new URL(request.url).searchParams.get('field') ?? 'default';
    return HttpResponse.json(mockSuggestions(field));
  }),

  // No active consultations by default (SessionTrayButton renders null).
  http.get(`${B}/api/active-sessions`, () => HttpResponse.json([])),

  http.get(`${B}/api/tenant/pharmacy-stock`, () => HttpResponse.json(mockPharmacyStock)),

  // Domain availability check for DomainInput / clinic forms.
  http.get(`${B}/api/tenant/domain/check`, () => HttpResponse.json({ available: true })),
];
