-- Clinic-scoped pharmacy inventory. Each row is a batch — a clinic can have
-- multiple rows for the same medicine name (different batches / expiries).
CREATE TABLE pharmacy_stock (
    id              UUID PRIMARY KEY,
    clinic_id       UUID NOT NULL REFERENCES clinic(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT 'Tablets',
    form            TEXT NOT NULL DEFAULT 'tablet',
    invoice_no      TEXT,
    batch           TEXT,
    pack_price      NUMERIC(12, 2) NOT NULL DEFAULT 0,
    pack_mrp        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    units_per_pack  INTEGER NOT NULL DEFAULT 1,
    unit_price      NUMERIC(12, 2) NOT NULL DEFAULT 0,
    units_in_stock  INTEGER NOT NULL DEFAULT 0,
    -- Expiry stored as "YYYY-MM" — month-level granularity matches the
    -- pharma supply chain. Indexed for the "Attention" view that flags
    -- near-expiry items.
    expiry          VARCHAR(7) NOT NULL DEFAULT '',
    discount_pct    NUMERIC(5, 2) NOT NULL DEFAULT 0,
    gst_pct         NUMERIC(5, 2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pharmacy_stock_clinic_id ON pharmacy_stock(clinic_id);
CREATE INDEX idx_pharmacy_stock_clinic_expiry ON pharmacy_stock(clinic_id, expiry);
CREATE INDEX idx_pharmacy_stock_clinic_name ON pharmacy_stock(clinic_id, name);
