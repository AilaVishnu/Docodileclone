const API_BASE = "http://localhost:8080/api";

// ============ Types ============

export type AppointmentStatus = "WAITING" | "IN_CONSULTATION" | "DONE" | "CANCELLED";
export type AppointmentType = "CONSULTATION" | "REVIEW";
export type PaymentStatus = "PENDING" | "PAID";
export type PaymentMode = "CASH" | "UPI" | "CARD";

export interface PatientDto {
  id: string;
  name: string;
  phone: string | null;
  gender: string | null;
  dob: string | null;
  age: number | null;
}

export interface PatientSearchResult {
  id: string;
  name: string;
  phone: string | null;
  gender: string | null;
  age: number | null;
}

export interface AppointmentDto {
  id: string;
  patient: PatientDto;
  doctorId: string;
  doctorName: string | null;
  scheduledTime: string | null;
  status: AppointmentStatus;
  type: AppointmentType;
  fee: number | null;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode | null;
  notes: string | null;
  tokenNumber: number | null;
}

export interface QueueSummary {
  waiting: number;
  inConsultation: number;
  done: number;
  total: number;
}

export interface TodayQueueResponse {
  appointments: AppointmentDto[];
  summary: QueueSummary;
}

export interface CreatePatientRequest {
  name: string;
  phone: string;
  gender?: string;
  dob?: string;
  age?: number;
}

export interface CreateAppointmentRequest {
  patientId?: string;
  newPatient?: CreatePatientRequest;
  doctorId: string;
  scheduledTime?: string;
  type: AppointmentType;
  fee?: number;
  paymentStatus?: PaymentStatus;
  paymentMode?: PaymentMode;
  notes?: string;
}

// ============ Helper Functions ============

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("docodile_token");
  const clinicId = localStorage.getItem("docodile_clinic_id");
  
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(clinicId && { "X-Clinic-ID": clinicId }),
  };
}

// ============ Patient API ============

export async function searchPatients(query: string): Promise<PatientSearchResult[]> {
  const response = await fetch(`${API_BASE}/patients/search?q=${encodeURIComponent(query)}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to search patients");
  }
  
  return response.json();
}

export async function createPatient(request: CreatePatientRequest): Promise<PatientDto> {
  const response = await fetch(`${API_BASE}/patients`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create patient");
  }
  
  return response.json();
}

// ============ Appointment API ============

export async function getTodayQueue(doctorId?: string): Promise<TodayQueueResponse> {
  const url = doctorId 
    ? `${API_BASE}/appointments/queue?doctorId=${doctorId}`
    : `${API_BASE}/appointments/queue`;
    
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch queue");
  }
  
  return response.json();
}

export async function createAppointment(request: CreateAppointmentRequest): Promise<AppointmentDto> {
  const response = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create appointment");
  }
  
  return response.json();
}

export async function updateAppointmentStatus(
  appointmentId: string, 
  status: AppointmentStatus
): Promise<AppointmentDto> {
  const response = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update appointment status");
  }
  
  return response.json();
}
