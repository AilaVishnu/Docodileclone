import { API_BASE_URL } from "../apiConfig";
import { Med, MedCategory, MedForm } from "../pages/Pharmacy/types";

// Backend DTO shape. Numeric fields come back as numbers in JSON.
export type PharmacyStockDTO = {
  id: string;
  name: string;
  category: string;
  form: string;
  invoiceNo: string | null;
  batch: string | null;
  packPrice: number;
  packMrp: number;
  unitsPerPack: number;
  unitPrice: number;
  unitsInStock: number;
  expiry: string;
  discountPct: number;
  gstPct: number;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("docodile_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function readError(res: Response): Promise<string> {
  const raw = await res.text();
  try { return raw ? (JSON.parse(raw).error || `HTTP ${res.status}`) : `HTTP ${res.status}`; }
  catch { return raw || `HTTP ${res.status}`; }
}

const VALID_CATEGORIES: MedCategory[] = ["Acne & skin", "Cleansers & soaps", "Topicals", "Tablets", "Serums & boosters"];
const VALID_FORMS: MedForm[] = ["tablet", "syrup", "cream", "spray", "soap", "serum", "drops", "ointment"];

export function dtoToMed(d: PharmacyStockDTO): Med {
  const category: MedCategory = (VALID_CATEGORIES as string[]).includes(d.category)
    ? (d.category as MedCategory) : "Tablets";
  const form: MedForm = (VALID_FORMS as string[]).includes(d.form)
    ? (d.form as MedForm) : "tablet";
  return {
    id: d.id,
    name: d.name,
    category,
    form,
    invoiceNo: d.invoiceNo ?? "",
    batch: d.batch ?? "",
    packPrice: Number(d.packPrice),
    packMrp: Number(d.packMrp),
    unitsPerPack: d.unitsPerPack,
    unitPrice: Number(d.unitPrice),
    unitsInStock: d.unitsInStock,
    expiry: d.expiry,
    discountPct: Number(d.discountPct),
    gstPct: Number(d.gstPct),
  };
}

export type PharmacyStockRequest = Omit<PharmacyStockDTO, "id">;

export async function listPharmacyStock(): Promise<Med[]> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/pharmacy-stock`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  const dtos: PharmacyStockDTO[] = await res.json();
  return dtos.map(dtoToMed);
}

export async function bulkCreatePharmacyStock(items: PharmacyStockRequest[]): Promise<{ imported: number; skipped: number }> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/pharmacy-stock/bulk`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function createPharmacyStock(item: PharmacyStockRequest): Promise<Med> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/pharmacy-stock`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error(await readError(res));
  return dtoToMed(await res.json());
}

export async function deletePharmacyStock(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tenant/pharmacy-stock/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
}

// ── CSV parser ──────────────────────────────────────────────────────────────

const MONTH_TO_NUM: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function parseExpiry(raw: string): string {
  // Accepts "Mar-2027", "2027-03", "03/2027", "Mar 2027", etc → "2027-03"
  const cleaned = raw.trim();
  const m = cleaned.match(/^([A-Za-z]+)[-\s\/]+(\d{4})$/);
  if (m) {
    const num = MONTH_TO_NUM[m[1].slice(0, 3).toLowerCase()];
    return num ? `${m[2]}-${num}` : "";
  }
  const isoMatch = cleaned.match(/^(\d{4})[-\/](\d{1,2})$/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}`;
  const slashMatch = cleaned.match(/^(\d{1,2})[-\/](\d{4})$/);
  if (slashMatch) return `${slashMatch[2]}-${slashMatch[1].padStart(2, "0")}`;
  return "";
}

function inferForm(name: string): MedForm {
  const u = name.toUpperCase();
  if (/TABLET|\bTAB\b|CAPSULE|\bCAP\b/.test(u)) return "tablet";
  if (/SYRUP/.test(u)) return "syrup";
  if (/CREAM/.test(u)) return "cream";
  if (/SPRAY/.test(u)) return "spray";
  if (/SOAP|BAR\b/.test(u)) return "soap";
  if (/SERUM/.test(u)) return "serum";
  if (/DROP/.test(u)) return "drops";
  if (/OINT/.test(u)) return "ointment";
  if (/GEL|LOTION/.test(u)) return "cream";
  return "tablet";
}

function inferCategory(name: string, form: MedForm): MedCategory {
  const u = name.toUpperCase();
  if (form === "soap" || /WASH|CLEANS|BAR\b/.test(u)) return "Cleansers & soaps";
  if (form === "serum" || /SERUM/.test(u)) return "Serums & boosters";
  if (form === "tablet") return "Tablets";
  if (/ACNE|PIMPLE/.test(u)) return "Acne & skin";
  return "Topicals";
}

// Split a CSV line on commas, honouring quoted fields.
function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

/**
 * Parse the CSV text the user pastes. Expected header (in this order, case
 * insensitive): Med Name, Invoice No., Batch, Pack(Price), Pack(MRP),
 * Units(Per Pack), Units(Price), Units in Stock, Expiry, %(Discount), %(GST).
 *
 * Returns rows ready to POST to /bulk. Unparseable rows are skipped silently;
 * the row count vs. raw line count tells the caller how many were dropped.
 */
export function parseInventoryCsv(text: string): { rows: PharmacyStockRequest[]; rawLines: number } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { rows: [], rawLines: 0 };
  // First line may be a header; skip it if it looks like one.
  const firstCols = splitCsv(lines[0]).map((c) => c.replace(/^"|"$/g, "").toLowerCase());
  const headerLooksLikeHeader = firstCols[0]?.includes("med") && firstCols[0]?.includes("name");
  const dataLines = headerLooksLikeHeader ? lines.slice(1) : lines;

  const rows: PharmacyStockRequest[] = [];
  for (const line of dataLines) {
    const cols = splitCsv(line).map((c) => c.replace(/^"|"$/g, "").trim());
    if (cols.length < 9) continue;
    const name = cols[0];
    if (!name) continue;
    const form = inferForm(name);
    rows.push({
      name,
      category: inferCategory(name, form),
      form,
      invoiceNo: cols[1] || null,
      batch: cols[2] || null,
      packPrice: Number(cols[3]) || 0,
      packMrp: Number(cols[4]) || 0,
      unitsPerPack: parseInt(cols[5], 10) || 1,
      unitPrice: Number(cols[6]) || 0,
      unitsInStock: parseInt(cols[7], 10) || 0,
      expiry: parseExpiry(cols[8]),
      discountPct: Number(cols[9]) || 0,
      gstPct: Number(cols[10]) || 0,
    });
  }
  return { rows, rawLines: dataLines.length };
}
