-- Patient advance / deposit. A running credit the desk collects up front and
-- draws against future bills. The NET balance lives on the patient (fast read +
-- the bill seeds from it); every movement — DEPOSIT, REFUND, and the automatic
-- BILL_DEDUCTION when a bill consumes it — is also written to the ledger so the
-- patient's deposit history is auditable. The net never goes below zero.
ALTER TABLE patient
    ADD COLUMN deposit NUMERIC(12, 2) NULL;

CREATE TABLE patient_deposit_ledger (
    id             UUID PRIMARY KEY,
    patient_id     UUID NOT NULL REFERENCES patient(id),
    clinic_id      UUID NOT NULL REFERENCES clinic(id),
    -- Set only for BILL_DEDUCTION rows: which bill drew the deposit down.
    appointment_id UUID NULL REFERENCES appointment(id),
    type           VARCHAR(32) NOT NULL,    -- DEPOSIT | REFUND | BILL_DEDUCTION
    amount         NUMERIC(12, 2) NOT NULL, -- always positive; `type` gives direction
    mode           VARCHAR(64) NULL,        -- payment mode for DEPOSIT / REFUND
    details        TEXT NULL,               -- free-text note from the drawer
    balance_after  NUMERIC(12, 2) NOT NULL, -- running net after this movement
    created_at     TIMESTAMP NOT NULL
);

CREATE INDEX idx_deposit_ledger_patient ON patient_deposit_ledger (patient_id, created_at DESC);
