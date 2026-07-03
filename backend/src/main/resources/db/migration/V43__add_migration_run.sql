-- Records each completed data migration so the Import data screen can
-- show a clinic their most recent import — platform, counts and when.

CREATE TABLE migration_run (
    id              UUID PRIMARY KEY,
    clinic_id       UUID NOT NULL REFERENCES clinic(id),
    platform        VARCHAR(64) NOT NULL,
    patients        INTEGER NOT NULL DEFAULT 0,
    visits          INTEGER NOT NULL DEFAULT 0,
    prescriptions   INTEGER NOT NULL DEFAULT 0,
    medicines       INTEGER NOT NULL DEFAULT 0,
    investigations  INTEGER NOT NULL DEFAULT 0,
    skipped         INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL
);

-- Fetch "the latest run for this clinic" cheaply.
CREATE INDEX ix_migration_run_clinic_created
    ON migration_run (clinic_id, created_at DESC);
