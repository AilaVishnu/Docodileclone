-- External-system reference keys for data migration (e.g. HealthPlix).
-- patient.external_ref      = the source EMR's patient id ("T428")
-- visit.external_ref        = "<patientRef>|<visitDate>" so re-running an
--                             import upserts visits instead of duplicating.
-- Both are scoped per clinic; the unique indexes make the importer
-- idempotent — a second run UPDATEs the same rows.
ALTER TABLE patient ADD COLUMN external_ref VARCHAR(128) NULL;
ALTER TABLE visit   ADD COLUMN external_ref VARCHAR(160) NULL;

CREATE UNIQUE INDEX uq_patient_clinic_external_ref
    ON patient (clinic_id, external_ref)
    WHERE external_ref IS NOT NULL;

CREATE UNIQUE INDEX uq_visit_clinic_external_ref
    ON visit (clinic_id, external_ref)
    WHERE external_ref IS NOT NULL;
