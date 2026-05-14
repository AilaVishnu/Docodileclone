// ─────────────────────────────────────────────────────────────────────────────
// localStorage adapter for print templates. Per-clinic so a doctor working
// across multiple clinics has independent templates. Replace the four
// public functions with API calls when the backend lands — the rest of the
// UI doesn't care where the JSON lives.
//
// Image fields on PrintTemplate are base64 data URLs. localStorage's ~5 MB
// per-origin budget is plenty for a few PNG letterheads (typically < 500 KB
// each); if a user uploads bigger they'll hit QuotaExceededError, which is
// surfaced to them as a toast in the editor.
// ─────────────────────────────────────────────────────────────────────────────

import { DEFAULT_TEMPLATE, PrintTemplate } from "./types";

const KEY = (clinicId: string) => `docodile_print_templates_${clinicId}`;

function clinicId(): string {
  return localStorage.getItem("docodile_clinic_id") ?? "default";
}

function genId(): string {
  return `tpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadTemplates(): PrintTemplate[] {
  try {
    const raw = localStorage.getItem(KEY(clinicId()));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(migrate) : [];
  } catch {
    return [];
  }
}

// Forward-compatible migration: templates persisted before a new field was
// added come back without that key. Backfill from DEFAULT_TEMPLATE so the
// editor + renderer can rely on every field being present.
function migrate(t: any): PrintTemplate {
  return {
    ...DEFAULT_TEMPLATE,
    ...t,
    show: { ...DEFAULT_TEMPLATE.show, ...(t?.show ?? {}) },
    margins: { ...DEFAULT_TEMPLATE.margins, ...(t?.margins ?? {}) },
  } as PrintTemplate;
}

export function saveTemplates(templates: PrintTemplate[]): void {
  localStorage.setItem(KEY(clinicId()), JSON.stringify(templates));
}

export function ensureSeed(): PrintTemplate[] {
  const existing = loadTemplates();
  if (existing.length > 0) return existing;
  const seeded: PrintTemplate[] = [{ id: genId(), ...DEFAULT_TEMPLATE }];
  saveTemplates(seeded);
  return seeded;
}

export function createTemplate(name = "New template"): PrintTemplate {
  const all = loadTemplates();
  const tpl: PrintTemplate = { id: genId(), ...DEFAULT_TEMPLATE, name, isDefault: all.length === 0 };
  saveTemplates([...all, tpl]);
  return tpl;
}

export function updateTemplate(updated: PrintTemplate): void {
  const all = loadTemplates();
  let nextAll = all.map((t) => (t.id === updated.id ? updated : t));
  if (updated.isDefault) {
    // Only one default per clinic.
    nextAll = nextAll.map((t) => (t.id === updated.id ? t : { ...t, isDefault: false }));
  }
  saveTemplates(nextAll);
}

export function deleteTemplate(id: string): PrintTemplate[] {
  const all = loadTemplates().filter((t) => t.id !== id);
  // If we deleted the default, promote the first remaining template.
  if (all.length > 0 && !all.some((t) => t.isDefault)) {
    all[0].isDefault = true;
  }
  saveTemplates(all);
  return all;
}

export function getDefaultTemplate(): PrintTemplate | null {
  const all = loadTemplates();
  if (all.length === 0) return null;
  return all.find((t) => t.isDefault) ?? all[0];
}
