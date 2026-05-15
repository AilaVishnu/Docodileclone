import { API_BASE_URL } from "../apiConfig";

// REST client for the clinic's print-template catalog. Templates are large
// JSON blobs (base64 letterhead images included) so we send config as a
// pre-stringified JSON payload to avoid re-parsing on the way out.

export type PrintTemplateDTO = {
  id: string;
  name: string;
  isDefault: boolean;
  // Server-side stored as JSONB but returned as a string so the caller can
  // decode into its own typed shape without re-validating on the wire.
  config: string;
};

export type PrintTemplateRequest = {
  name: string;
  isDefault: boolean;
  config: string;
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

export async function listPrintTemplates(): Promise<PrintTemplateDTO[]> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/print-templates`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function createPrintTemplate(req: PrintTemplateRequest): Promise<PrintTemplateDTO> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/print-templates`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function updatePrintTemplate(id: string, req: PrintTemplateRequest): Promise<PrintTemplateDTO> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/print-templates/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function deletePrintTemplate(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/print-templates/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
}
