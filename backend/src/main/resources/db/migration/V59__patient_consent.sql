-- Patient consent records. Immutable log of consent grants and withdrawals.
-- Withdrawals add a new row with withdrawn_at set rather than mutating the
-- original grant row, so the full consent history is preserved.
CREATE TABLE patient_consent (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id     UUID        NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    clinic_id      UUID        NOT NULL REFERENCES clinic(id),
    purpose        VARCHAR(200) NOT NULL,
    version        VARCHAR(50) NOT NULL,
    granted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    granted_by     UUID,
    ip_address     VARCHAR(45),
    withdrawn_at   TIMESTAMPTZ,
    withdrawn_by   UUID
);

CREATE INDEX idx_patient_consent_patient ON patient_consent(patient_id);
CREATE INDEX idx_patient_consent_clinic  ON patient_consent(clinic_id);
