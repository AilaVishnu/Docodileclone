-- Clinic-configurable print template for prescription printouts. Migrated
-- from localStorage (docodile_print_templates_<clinicId>) so the same
-- template applies wherever the user logs in. The config column holds the
-- bulk of the template JSON (margins, images, toggles, fonts) — name and
-- is_default are first-class for sorting / "the default for this clinic".
CREATE TABLE print_template (
    id UUID PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinic(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_print_template_clinic_id ON print_template(clinic_id);

-- Enforce at-most-one default per clinic at the DB level so the invariant
-- the frontend assumed (single default template) can't drift.
CREATE UNIQUE INDEX idx_print_template_one_default_per_clinic
    ON print_template(clinic_id)
    WHERE is_default;
