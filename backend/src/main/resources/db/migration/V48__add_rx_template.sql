-- Reusable prescription templates, scoped per clinic. `content` is a JSON blob
-- of the template fields (complaints, diagnosis, tests, notes, review, rx rows)
-- — the frontend serialises/parses it, so the schema stays stable as the pad's
-- fields evolve. Unique per (clinic, name) so saving the same name upserts.
CREATE TABLE rx_template (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id   UUID NOT NULL REFERENCES clinic(id) ON DELETE CASCADE,
    name        VARCHAR(160) NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_rx_template_clinic_name ON rx_template (clinic_id, lower(name));
CREATE INDEX idx_rx_template_clinic ON rx_template (clinic_id);
