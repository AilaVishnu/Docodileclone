-- Clinic-scoped services catalog (consultations, procedures, packages). The
-- Services tab in the frontend was rendering mock data before this table
-- existed.
CREATE TABLE service (
    id UUID PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinic(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    duration_min INTEGER NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_mode VARCHAR(2) NOT NULL DEFAULT '%',
    gst NUMERIC(5, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_clinic_id ON service(clinic_id);
