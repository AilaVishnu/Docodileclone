-- Allow multiple appointments per patient per day.
--
-- The booking flow now detects an existing same-day appointment and asks
-- the user to confirm before adding another. So duplicates are
-- intentional (morning + afternoon visit, second opinion later the same
-- day, etc.) — not the accidental ones V25 was guarding against.
--
-- Drop the partial UNIQUE index and replace it with a plain index over
-- the same expression so same-day lookups (the service's pre-check, queue
-- queries) stay fast.

DROP INDEX IF EXISTS ux_appointment_clinic_patient_day;

CREATE INDEX IF NOT EXISTS ix_appointment_clinic_patient_day
  ON appointment (clinic_id, patient_id, (scheduled_time::date))
  WHERE scheduled_time IS NOT NULL;
