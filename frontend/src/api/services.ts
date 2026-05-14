import { API_BASE_URL } from "../apiConfig";

// REST client for the clinic-scoped services catalog. Same bearer-token
// pattern as the rest of the app — token is read from localStorage per call.

export type ServiceDTO = {
  id: string;
  name: string;
  code: string;
  price: number;
  durationMin: number;
  discount: number;
  discountMode: "%" | "₹";
  gst: number;
};

export type ServiceRequest = {
  name: string;
  code: string;
  price: number;
  durationMin: number;
  discount: number;
  discountMode: "%" | "₹";
  gst: number;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("docodile_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function readError(res: Response): Promise<string> {
  const raw = await res.text();
  try {
    return raw ? (JSON.parse(raw).error || `HTTP ${res.status}`) : `HTTP ${res.status}`;
  } catch {
    return raw || `HTTP ${res.status}`;
  }
}

export async function listServices(): Promise<ServiceDTO[]> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/services`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function createService(req: ServiceRequest): Promise<ServiceDTO> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/services`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function updateService(id: string, req: ServiceRequest): Promise<ServiceDTO> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/services/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/services/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
}
