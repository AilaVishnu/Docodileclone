-- Standardise soft-delete columns across all entity tables.
-- Patient already uses archived/archived_at; we add deleted_at/deleted_by
-- and migrate existing archived data. The old archived columns are left in
-- place for backward-compat; the application layer no longer writes to them.

-- ── patient ──────────────────────────────────────────────────────────────────
ALTER TABLE patient
    ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by  UUID;

-- Migrate existing archived patients: treat archived_at as deleted_at
UPDATE patient
SET deleted_at = archived_at
WHERE archived = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_patient_clinic_deleted ON patient(clinic_id, deleted_at);

-- ── visit ─────────────────────────────────────────────────────────────────────
ALTER TABLE visit
    ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by  UUID;

CREATE INDEX IF NOT EXISTS idx_visit_deleted_at ON visit(deleted_at) WHERE deleted_at IS NOT NULL;

-- ── appointment ───────────────────────────────────────────────────────────────
ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by  UUID;

CREATE INDEX IF NOT EXISTS idx_appointment_deleted_at ON appointment(deleted_at) WHERE deleted_at IS NOT NULL;

-- ── rx_row ────────────────────────────────────────────────────────────────────
ALTER TABLE rx_row
    ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by  UUID;

-- ── patient_files ─────────────────────────────────────────────────────────────
ALTER TABLE patient_files
    ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by  UUID;
