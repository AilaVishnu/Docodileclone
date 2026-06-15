-- Add created_by, updated_at, updated_by metadata columns to all entity
-- tables that are missing them. All columns are nullable so existing rows
-- remain valid; new rows should always populate them via JPA auditing.

-- ── app_user ──────────────────────────────────────────────────────────────────
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by  UUID,
    ADD COLUMN IF NOT EXISTS updated_by  UUID;

-- ── clinic ────────────────────────────────────────────────────────────────────
ALTER TABLE clinic
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by  UUID,
    ADD COLUMN IF NOT EXISTS updated_by  UUID;

-- ── patient ───────────────────────────────────────────────────────────────────
ALTER TABLE patient
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by  UUID,
    ADD COLUMN IF NOT EXISTS updated_by  UUID;

-- ── visit ─────────────────────────────────────────────────────────────────────
-- visit already has created_at and updated_at; add created_by / updated_by
ALTER TABLE visit
    ADD COLUMN IF NOT EXISTS created_by  UUID,
    ADD COLUMN IF NOT EXISTS updated_by  UUID;

-- ── appointment ───────────────────────────────────────────────────────────────
ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by  UUID,
    ADD COLUMN IF NOT EXISTS updated_by  UUID;

-- ── rx_row ────────────────────────────────────────────────────────────────────
ALTER TABLE rx_row
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by  UUID,
    ADD COLUMN IF NOT EXISTS updated_by  UUID,
    ADD COLUMN IF NOT EXISTS clinic_id   UUID;

-- ── patient_files ─────────────────────────────────────────────────────────────
ALTER TABLE patient_files
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_by  UUID,
    ADD COLUMN IF NOT EXISTS created_by  UUID;

-- ── pharmacy_stock ────────────────────────────────────────────────────────────
ALTER TABLE pharmacy_stock
    ADD COLUMN IF NOT EXISTS created_by  UUID,
    ADD COLUMN IF NOT EXISTS updated_by  UUID;

-- ── print_template ────────────────────────────────────────────────────────────
ALTER TABLE print_template
    ADD COLUMN IF NOT EXISTS created_by  UUID,
    ADD COLUMN IF NOT EXISTS updated_by  UUID;
