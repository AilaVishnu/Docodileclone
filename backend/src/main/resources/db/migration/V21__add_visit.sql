-- Visit table — one row per prescription / clinical encounter. Stores all
-- the form fields captured by the Prescription page (vitals + units, four
-- history categories, complaints, diagnosis, notes, tests, refer-to,
-- next-review). Vitals are explicit columns rather than JSONB so they're
-- queryable for charts/reports later. Each unit-toggleable vital has a
-- sibling _unit column so we round-trip the user's chosen unit.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE visit (
  id                       UUID PRIMARY KEY,
  clinic_id                UUID NOT NULL REFERENCES clinic(id),
  patient_id               UUID NOT NULL REFERENCES patient(id),
  created_by_doctor_id     UUID REFERENCES app_user(id),
  visit_date               DATE NOT NULL,

  -- Vitals (TEXT to preserve exact display, e.g. "120" vs "120.0")
  bp_systolic              TEXT,
  bp_diastolic             TEXT,
  bp_unit                  VARCHAR(8),
  bmi                      TEXT,
  bmi_unit                 VARCHAR(8),
  height                   TEXT,
  height_unit              VARCHAR(8),
  weight                   TEXT,
  weight_unit              VARCHAR(8),
  temperature              TEXT,
  temperature_unit         VARCHAR(8),
  pulse                    TEXT,
  pulse_unit               VARCHAR(8),
  waist                    TEXT,
  waist_unit               VARCHAR(8),
  hip                      TEXT,
  hip_unit                 VARCHAR(8),
  spo2                     TEXT,
  spo2_unit                VARCHAR(8),

  -- History (the four Autocomplete fields)
  family_history           TEXT,
  allergies                TEXT,
  personal_history         TEXT,
  past_medical_history     TEXT,

  -- Free-text + Autocomplete fields
  complaints               TEXT,
  diagnosis                TEXT,
  notes_for_patient        TEXT,
  private_notes            TEXT,
  tests                    TEXT,

  -- Referral + next review
  refer_doctor_id          UUID REFERENCES app_user(id),
  review_date              DATE,
  review_days              INTEGER,
  review_notes             TEXT,

  created_at               TIMESTAMP DEFAULT now(),
  updated_at               TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_visit_clinic_patient_date
  ON visit(clinic_id, patient_id, visit_date DESC);
CREATE INDEX idx_visit_clinic_id ON visit(clinic_id);
