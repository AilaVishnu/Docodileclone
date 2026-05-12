-- Specialisation-scoped autocomplete suggestion catalog. One table backs
-- every suggestion-driven field on the page (Family History, Allergies,
-- Personal History, Past Medical History, future: medicines, diagnoses).
-- The `field` column discriminates which list a row belongs to; new
-- suggestion fields don't need a new table — just a new `field` value.
--
-- Scoped by `speciality` (sourced from clinic.speciality, normalized to
-- lowercase + trimmed). All clinics of the same specialty (e.g. all
-- Dermatology clinics) share one catalog; a Dental clinic sees a
-- separate Dental catalog. New words added by any clinic are stored
-- under that clinic's specialty and visible to every other clinic
-- with the same specialty.
CREATE TABLE suggestion (
  id          UUID PRIMARY KEY,
  speciality  VARCHAR(255) NOT NULL,
  field       VARCHAR(64) NOT NULL,
  value       TEXT NOT NULL,
  use_count   INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT now(),
  CONSTRAINT uq_suggestion_speciality_field_value UNIQUE (speciality, field, value)
);

CREATE INDEX idx_suggestion_speciality_field ON suggestion(speciality, field);
