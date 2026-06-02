import { API_BASE_URL } from "../apiConfig";

// Per-section, clinic-shared prescription templates. `kind` scopes a template
// to a single card (complaints / diagnosis / tests / notes_for_patient /
// private_notes / rx). `content` is an opaque JSON string the page parses.

export type RxTemplateDTO = { name: string; content: string; kind: string };

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("docodile_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

const handle = async <T>(res: Response): Promise<T> => {
  if (res.ok) return res.json() as Promise<T>;
  const body = await res.json().catch(() => null);
  throw new Error((body && (body.error || body.message)) || `HTTP ${res.status}`);
};

export const listRxTemplates = (kind: string): Promise<RxTemplateDTO[]> =>
  fetch(`${API_BASE_URL}/api/tenant/rx-templates?kind=${encodeURIComponent(kind)}`, {
    headers: authHeaders(),
  }).then((r) => handle<RxTemplateDTO[]>(r));

export const saveRxTemplate = (name: string, content: string, kind: string): Promise<RxTemplateDTO> =>
  fetch(`${API_BASE_URL}/api/tenant/rx-templates`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, content, kind }),
  }).then((r) => handle<RxTemplateDTO>(r));

export const deleteRxTemplate = (name: string, kind: string): Promise<void> =>
  fetch(
    `${API_BASE_URL}/api/tenant/rx-templates?name=${encodeURIComponent(name)}&kind=${encodeURIComponent(kind)}`,
    { method: "DELETE", headers: authHeaders() },
  ).then((r) => {
    if (!r.ok && r.status !== 204) throw new Error(`HTTP ${r.status}`);
  });
