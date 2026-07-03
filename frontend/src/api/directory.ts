import { API_BASE_URL } from "../apiConfig";
import type { Category } from "../pages/Catalog/catalogData";

// REST client for the Catalog directory (referral doctors / labs / suppliers /
// contacts). One backend table (directory_entry) keyed by `category`; the entry
// body (subtitle/phone/whatsapp/email/address/tags) travels as an opaque JSON
// `config` blob, mirroring the print/bill-template clients.

export type DirectoryCategory = Exclude<Category, "Services">;

export type DirectoryEntryDTO = {
  id: string;
  category: string;
  name: string;
  config: string;
};

// The persistable fields of a directory entry (everything but id/category/name
// and the client-derived icon).
export type DirectoryBody = {
  name: string;
  subtitle?: string;
  phone?: string;
  whatsapp?: boolean;
  email?: string;
  address?: string;
  tags?: string[];
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

// DTO → the entry body (icon is added by the view, per category).
export function dtoToBody(dto: DirectoryEntryDTO): DirectoryBody & { id: string } {
  let c: Omit<DirectoryBody, "name"> = {};
  try { c = JSON.parse(dto.config || "{}"); } catch { /* corrupt config → empty */ }
  return {
    id: dto.id,
    name: dto.name,
    subtitle: c.subtitle ?? "",
    phone: c.phone,
    whatsapp: c.whatsapp,
    email: c.email,
    address: c.address,
    tags: c.tags,
  };
}

function toRequest(category: DirectoryCategory, body: DirectoryBody): { category: string; name: string; config: string } {
  const { name, ...rest } = body;
  return { category, name, config: JSON.stringify(rest) };
}

export async function listDirectory(category: DirectoryCategory): Promise<DirectoryEntryDTO[]> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/directory?category=${encodeURIComponent(category)}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function createDirectoryEntry(category: DirectoryCategory, body: DirectoryBody): Promise<DirectoryEntryDTO> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/directory`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(toRequest(category, body)),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function updateDirectoryEntry(id: string, category: DirectoryCategory, body: DirectoryBody): Promise<DirectoryEntryDTO> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/directory/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(toRequest(category, body)),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function deleteDirectoryEntry(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/directory/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
}
