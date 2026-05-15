-- Cached per-patient AI summary so we don't re-call OpenAI on every load.
-- Keyed by patient_id (one summary per patient); regenerated when a new
-- visit lands (signature mismatch on visits_hash).
CREATE TABLE patient_ai_summary (
    patient_id   UUID PRIMARY KEY REFERENCES patient(id) ON DELETE CASCADE,
    clinic_id    UUID NOT NULL REFERENCES clinic(id) ON DELETE CASCADE,
    content      JSONB NOT NULL DEFAULT '{}'::jsonb,
    visits_hash  TEXT NOT NULL DEFAULT '',
    updated_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_ai_summary_clinic_id ON patient_ai_summary(clinic_id);
