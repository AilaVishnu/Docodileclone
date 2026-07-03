CREATE TABLE patient_files (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id         UUID         NOT NULL,
    clinic_id          UUID         NOT NULL,
    uploaded_by        UUID,
    name               VARCHAR(500) NOT NULL,
    category           VARCHAR(255),
    investigation_date DATE,
    mime_type          VARCHAR(255),
    notes              TEXT,
    file_data          BYTEA        NOT NULL,
    file_size          BIGINT,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_patient_files_patient ON patient_files (clinic_id, patient_id, created_at DESC);
