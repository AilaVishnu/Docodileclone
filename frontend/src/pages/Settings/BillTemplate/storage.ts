// ─────────────────────────────────────────────────────────────────────────────
// Backend-backed bill-template storage — the billing counterpart to
// PrintTemplate/storage. Templates live in the `bill_template` table (per
// clinic). A small in-memory cache backs the sync `getDefaultBillTemplate()`
// used inside the receipt renderer; `ensureBillTemplatesLoaded()` primes it.
// ─────────────────────────────────────────────────────────────────────────────

import {
  listBillTemplates,
  createBillTemplate,
  updateBillTemplate,
  deleteBillTemplate,
  BillTemplateDTO,
} from "../../../api/billTemplates";
import { DEFAULT_BILL_TEMPLATE, BillTemplate } from "./types";

// Forward-compatible decoder: rows persisted before a new field existed come
// back without that key. Backfill from DEFAULT_BILL_TEMPLATE so the editor +
// renderer can rely on every field being present.
function fromDto(dto: BillTemplateDTO): BillTemplate {
  let cfg: any = {};
  try { cfg = JSON.parse(dto.config || "{}"); } catch { /* corrupt config → fall back to default */ }
  return {
    ...DEFAULT_BILL_TEMPLATE,
    ...cfg,
    show: { ...DEFAULT_BILL_TEMPLATE.show, ...(cfg?.show ?? {}) },
    margins: { ...DEFAULT_BILL_TEMPLATE.margins, ...(cfg?.margins ?? {}) },
    id: dto.id,
    name: dto.name,
    isDefault: dto.isDefault,
  } as BillTemplate;
}

// Strip the columns that live as their own DB fields so we don't double-store
// name/isDefault inside the JSON blob.
function toConfigJson(t: BillTemplate): string {
  const { id, name, isDefault, ...rest } = t;
  void id; void name; void isDefault;
  return JSON.stringify(rest);
}

// Last-seen list, primed by every successful load/create/update/delete.
let cache: BillTemplate[] = [];
let loadedOnce = false;

export async function loadBillTemplates(): Promise<BillTemplate[]> {
  const dtos = await listBillTemplates();
  cache = dtos.map(fromDto);
  loadedOnce = true;
  return cache;
}

export async function ensureBillSeed(): Promise<BillTemplate[]> {
  const existing = await loadBillTemplates();
  if (existing.length > 0) return existing;
  // First load for this clinic — create the default template server-side so
  // there's always at least one row.
  const seed: BillTemplate = { id: "", ...DEFAULT_BILL_TEMPLATE };
  const created = await createBillTemplate({
    name: seed.name,
    isDefault: true,
    config: toConfigJson(seed),
  });
  cache = [fromDto(created)];
  loadedOnce = true;
  return cache;
}

// Prime the cache once for the renderer (buildBillHtml). Never throws — a
// failure just leaves the cache empty and the renderer falls back to defaults.
export async function ensureBillTemplatesLoaded(): Promise<void> {
  if (loadedOnce) return;
  try { await loadBillTemplates(); } catch { loadedOnce = true; }
}

export async function createBillTemplateRow(name = "New template"): Promise<BillTemplate> {
  const seed: BillTemplate = { id: "", ...DEFAULT_BILL_TEMPLATE, name, isDefault: cache.length === 0 };
  const created = await createBillTemplate({
    name: seed.name,
    isDefault: seed.isDefault,
    config: toConfigJson(seed),
  });
  const tpl = fromDto(created);
  cache = [...cache, tpl];
  return tpl;
}

export async function updateBillTemplateRow(updated: BillTemplate): Promise<void> {
  // Optimistically update the in-memory cache first so the renderer sees the
  // new settings immediately — even before the API round-trip finishes.
  cache = cache.map((t) => (t.id === updated.id ? updated : (updated.isDefault ? { ...t, isDefault: false } : t)));
  const saved = await updateBillTemplate(updated.id, {
    name: updated.name,
    isDefault: updated.isDefault,
    config: toConfigJson(updated),
  });
  const replaced = fromDto(saved);
  cache = cache.map((t) => (t.id === replaced.id ? replaced : (replaced.isDefault ? { ...t, isDefault: false } : t)));
}

export async function deleteBillTemplateRow(id: string): Promise<BillTemplate[]> {
  await deleteBillTemplate(id);
  // Re-fetch so we pick up the server-side "promote next as default" rule.
  return loadBillTemplates();
}

// Sync read against the cache populated by the most recent load. Returns null
// if nothing's been loaded — the renderer then falls back to a built-in default.
export function getDefaultBillTemplate(): BillTemplate | null {
  if (cache.length === 0) return null;
  return cache.find((t) => t.isDefault) ?? cache[0];
}
