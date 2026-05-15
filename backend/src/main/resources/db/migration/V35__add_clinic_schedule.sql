-- One weekly availability schedule per clinic. The shape (default week +
-- date-keyed overrides + configured flag) is owned by the frontend; we
-- store it as opaque JSON. Per-clinic unique so switching active clinic
-- pulls the right schedule.
CREATE TABLE clinic_schedule (
    clinic_id  UUID PRIMARY KEY REFERENCES clinic(id) ON DELETE CASCADE,
    schedule   JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
