import { API_BASE_URL } from "../apiConfig";

// Minimal client for the clinic's own profile (name / address / phone). Used to
// fill the bill receipt's letterhead and the share-message text when a Bill
// template hasn't set its own letterhead — so a fresh clinic's receipts aren't
// stamped "Your Clinic".

export type ClinicProfile = { name: string; address: string; phone: string };

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("docodile_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getClinic(): Promise<ClinicProfile | null> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/clinic`, { headers: authHeaders() });
  if (!res.ok) return null;
  const d = await res.json();
  return { name: d?.name || "", address: d?.address || "", phone: d?.phone || "" };
}

// Cache the clinic identity into localStorage once per session. The receipt
// renderer and the share text both read these keys as a fallback when the Bill
// template's letterhead fields are blank. Fetched at most once; failures leave
// the keys untouched so the caller falls back to a neutral placeholder.
let primed = false;
export async function primeClinicIdentity(): Promise<void> {
  if (primed) return;
  primed = true;
  try {
    const c = await getClinic();
    if (!c) return;
    if (c.name) localStorage.setItem("docodile_clinic_name", c.name);
    if (c.address) localStorage.setItem("docodile_clinic_address", c.address);
    if (c.phone) localStorage.setItem("docodile_clinic_phone", c.phone);
  } catch {
    /* leave keys as-is */
  }
}
