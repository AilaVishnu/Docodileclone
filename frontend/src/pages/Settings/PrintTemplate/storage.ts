// ─────────────────────────────────────────────────────────────────────────────
// Backend-backed print template storage. Templates live in the `print_template`
// table (server-side, per clinic). A small in-memory cache backs the sync
// `getDefaultTemplate()` helper used inside the print handler — the editor
// calls `loadTemplates()` first, which both fetches from the API and primes
// the cache for the subsequent print action.
// ─────────────────────────────────────────────────────────────────────────────

import {
  listPrintTemplates,
  createPrintTemplate,
  updatePrintTemplate,
  deletePrintTemplate,
  PrintTemplateDTO,
} from "../../../api/printTemplates";
import { DEFAULT_TEMPLATE, PrintTemplate } from "./types";

// Forward-compatible decoder: rows persisted before a new template field
// existed come back without that key. Backfill from DEFAULT_TEMPLATE so the
// editor + renderer can rely on every field being present.
function fromDto(dto: PrintTemplateDTO): PrintTemplate {
  let cfg: any = {};
  try { cfg = JSON.parse(dto.config || "{}"); } catch { /* corrupt config → fall back to default */ }
  return {
    ...DEFAULT_TEMPLATE,
    ...cfg,
    show: { ...DEFAULT_TEMPLATE.show, ...(cfg?.show ?? {}) },
    margins: { ...DEFAULT_TEMPLATE.margins, ...(cfg?.margins ?? {}) },
    id: dto.id,
    name: dto.name,
    isDefault: dto.isDefault,
  } as PrintTemplate;
}

// Strip out the columns that live as their own DB fields so we don't double
// store name/isDefault inside the JSON blob.
function toConfigJson(t: PrintTemplate): string {
  const { id, name, isDefault, ...rest } = t;
  void id; void name; void isDefault;
  return JSON.stringify(rest);
}

// Last-seen list, primed by every successful load/create/update/delete.
// Used by the synchronous `getDefaultTemplate()` so the print handler
// doesn't need to await.
let cache: PrintTemplate[] = [];

export async function loadTemplates(): Promise<PrintTemplate[]> {
  const dtos = await listPrintTemplates();
  cache = dtos.map(fromDto);
  return cache;
}

export async function ensureSeed(): Promise<PrintTemplate[]> {
  const existing = await loadTemplates();
  if (existing.length > 0) return existing;
  // First load for this clinic — create the default template server-side so
  // there's always at least one row.
  const seed: PrintTemplate = {
    id: "",
    ...DEFAULT_TEMPLATE,
  };
  const created = await createPrintTemplate({
    name: seed.name,
    isDefault: true,
    config: toConfigJson(seed),
  });
  cache = [fromDto(created)];
  return cache;
}

export async function createTemplate(name = "New template"): Promise<PrintTemplate> {
  const seed: PrintTemplate = { id: "", ...DEFAULT_TEMPLATE, name, isDefault: cache.length === 0 };
  const created = await createPrintTemplate({
    name: seed.name,
    isDefault: seed.isDefault,
    config: toConfigJson(seed),
  });
  const tpl = fromDto(created);
  cache = [...cache, tpl];
  return tpl;
}

export async function updateTemplate(updated: PrintTemplate): Promise<void> {
  // Optimistically update the in-memory cache first, so any code reading
  // through getDefaultTemplate() sees the new settings immediately — even
  // before the API round-trip finishes. Without this, clicking Print in
  // PrescriptionPage right after editing a template could read a stale row.
  cache = cache.map((t) => (t.id === updated.id ? updated : (updated.isDefault ? { ...t, isDefault: false } : t)));
  const saved = await updatePrintTemplate(updated.id, {
    name: updated.name,
    isDefault: updated.isDefault,
    config: toConfigJson(updated),
  });
  // Reconcile with the server's normalised version (mostly the same payload).
  const replaced = fromDto(saved);
  cache = cache.map((t) => (t.id === replaced.id ? replaced : (replaced.isDefault ? { ...t, isDefault: false } : t)));
}

export async function deleteTemplate(id: string): Promise<PrintTemplate[]> {
  await deletePrintTemplate(id);
  // Re-fetch so we pick up the server-side "promote next as default" rule.
  return loadTemplates();
}

// Sync read against the cache populated by the most recent loadTemplates()
// (or any of the create/update/delete helpers). Returns null if nothing's
// been loaded yet — the caller (PrescriptionPage's print handler) shows a
// toast asking the user to open Settings → Print template first.
export function getDefaultTemplate(): PrintTemplate | null {
  if (cache.length === 0) return null;
  return cache.find((t) => t.isDefault) ?? cache[0];
}
