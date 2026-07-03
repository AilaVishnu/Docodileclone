CREATE SCHEMA IF NOT EXISTS platform;

CREATE TABLE platform.clinic (
    id          UUID PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    subdomain   VARCHAR(63)  NOT NULL,
    schema_name VARCHAR(63)  NOT NULL,
    status      VARCHAR(32)  NOT NULL DEFAULT 'PROVISIONING',
    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT uq_clinic_subdomain   UNIQUE (subdomain),
    CONSTRAINT uq_clinic_schema_name UNIQUE (schema_name)
);

CREATE TABLE platform.clinic_provisioning (
    id          UUID PRIMARY KEY,
    clinic_id   UUID NOT NULL REFERENCES platform.clinic(id),
    step        VARCHAR(64) NOT NULL,
    status      VARCHAR(32) NOT NULL,
    detail      TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX ix_clinic_provisioning_clinic ON platform.clinic_provisioning (clinic_id, created_at DESC);
