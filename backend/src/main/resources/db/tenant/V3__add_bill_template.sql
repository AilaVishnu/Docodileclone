-- bill_template — clinic-configurable layout for the "Bill cum Receipt" printout,
-- the billing counterpart to print_template. One default per tenant schema
-- (clinic_id dropped; isolation is by schema). Forward migration so
-- already-provisioned clinic schemas gain the table too (the boot migration
-- runner applies db/tenant to every active schema).
CREATE TABLE IF NOT EXISTS bill_template (
    id         UUID PRIMARY KEY,
    name       TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    config     JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- At most one default template per tenant schema.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bill_template_one_default
    ON bill_template (is_default)
    WHERE is_default;
