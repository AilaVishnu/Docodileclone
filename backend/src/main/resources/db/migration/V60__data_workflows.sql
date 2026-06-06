-- Data deletion request workflow (Right-to-be-Forgotten / DPDP compliance).
-- States: SUBMITTED → VERIFIED → LEGAL_HOLD_CHECK → APPROVED/REJECTED → EXECUTED
CREATE TABLE deletion_request (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id     UUID        NOT NULL REFERENCES patient(id),
    clinic_id      UUID        NOT NULL REFERENCES clinic(id),
    tenant_id      UUID        NOT NULL,
    status         VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    requested_by   UUID        NOT NULL,
    requested_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_by    UUID,
    verified_at    TIMESTAMPTZ,
    reviewed_by    UUID,
    reviewed_at    TIMESTAMPTZ,
    reason         TEXT,
    rejection_note TEXT,
    executed_at    TIMESTAMPTZ,
    executed_by    UUID
);

CREATE INDEX idx_deletion_request_patient  ON deletion_request(patient_id);
CREATE INDEX idx_deletion_request_clinic   ON deletion_request(clinic_id);
CREATE INDEX idx_deletion_request_status   ON deletion_request(status);

-- Data correction request workflow (Right-to-Rectification / DPDP compliance).
-- States: SUBMITTED → REVIEWED → APPLIED/REJECTED
CREATE TABLE correction_request (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID        NOT NULL REFERENCES patient(id),
    clinic_id       UUID        NOT NULL REFERENCES clinic(id),
    tenant_id       UUID        NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    field_name      VARCHAR(100) NOT NULL,
    old_value       TEXT,
    new_value       TEXT        NOT NULL,
    requested_by    UUID        NOT NULL,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_by     UUID,
    reviewed_at     TIMESTAMPTZ,
    rejection_note  TEXT,
    applied_at      TIMESTAMPTZ,
    applied_by      UUID
);

CREATE INDEX idx_correction_request_patient ON correction_request(patient_id);
CREATE INDEX idx_correction_request_status  ON correction_request(status);
