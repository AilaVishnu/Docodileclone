-- directory_entry — the Catalog directory (referral doctors / labs / suppliers /
-- contacts). One table serves all four tabs via the `category` column. The core
-- identity is flat (category, name); the rest of the entry (subtitle, phone,
-- whatsapp, email, address, tags) is an opaque JSON blob, mirroring bill_template.
-- Schema-per-tenant → no clinic_id. Forward migration so already-provisioned
-- clinic schemas gain the table on the next boot.
CREATE TABLE IF NOT EXISTS directory_entry (
    id         UUID PRIMARY KEY,
    category   TEXT NOT NULL,
    name       TEXT NOT NULL,
    config     JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_directory_entry_category ON directory_entry (category);
