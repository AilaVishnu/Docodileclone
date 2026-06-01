-- Per-section templates: a template now belongs to a specific section
-- (complaints, diagnosis, tests, notes_for_patient, private_notes, rx) so
-- that saving from one card only appears under that card's Load list.
-- Existing rows are backfilled as 'rx' (the original whole-prescription
-- intent) — operators can re-save under specific sections as needed.

ALTER TABLE rx_template
    ADD COLUMN kind VARCHAR(64) NOT NULL DEFAULT 'rx';

ALTER TABLE rx_template
    ALTER COLUMN kind DROP DEFAULT;

DROP INDEX IF EXISTS uq_rx_template_clinic_name;

CREATE UNIQUE INDEX uq_rx_template_clinic_kind_name
    ON rx_template (clinic_id, kind, lower(name));
