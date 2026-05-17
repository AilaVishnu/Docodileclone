-- Soft-archive flag for patients. Archived patients are hidden from the
-- main patient picker / queue but their data (visits, prescriptions,
-- files) is preserved and viewable from a future "Archived patients"
-- list. No cascading effects — archive is purely a list-filter signal.
ALTER TABLE patient
    ADD COLUMN archived     BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN archived_at  TIMESTAMP   NULL;

-- Helpful for the common "list non-archived in this clinic" query.
CREATE INDEX idx_patient_clinic_archived ON patient (clinic_id, archived);
