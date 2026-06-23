-- Bills / invoices. Each Charge & Bill snapshots one invoice here so a patient
-- can accumulate several bills (INV_0001, INV_0002 …) and the desk can review
-- their history. SUPPLEMENTS the existing appointment-level billing (which still
-- drives the queue Pay pill, finance and the deposit auto-cover) — this table is
-- the history record, not the source of truth for revenue. `seq` is the
-- per-clinic running number that formats invoice_no; `items` is the line-item
-- snapshot (JSON) so a bill can be re-opened/printed.
CREATE TABLE bill (
    id              UUID PRIMARY KEY,
    clinic_id       UUID NOT NULL REFERENCES clinic(id),
    patient_id      UUID NOT NULL REFERENCES patient(id),
    appointment_id  UUID NULL REFERENCES appointment(id),
    invoice_no      VARCHAR(32) NOT NULL,
    seq             INTEGER NOT NULL,
    bill_date       DATE NOT NULL,
    billed          NUMERIC(12, 2) NOT NULL,
    paid            NUMERIC(12, 2) NOT NULL,
    due             NUMERIC(12, 2) NOT NULL,
    refund          NUMERIC(12, 2) NOT NULL,
    deposit_applied NUMERIC(12, 2) NULL,
    pay_status      VARCHAR(32) NULL,
    payment_method  VARCHAR(64) NULL,
    items           TEXT NULL,
    created_at      TIMESTAMP NOT NULL
);

CREATE INDEX idx_bill_patient_date ON bill (patient_id, bill_date DESC, seq DESC);
-- Unique so two invoices in a clinic can never share a number (a concurrent
-- create loses the race with a constraint error rather than a silent duplicate).
CREATE UNIQUE INDEX uq_bill_clinic_seq ON bill (clinic_id, seq);
