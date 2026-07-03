-- Enforce the "one appointment per patient per day per clinic" rule.
--
-- Previously the only guard was a soft client-side check in BookAppointment.tsx
-- (fetch the day's appointments, look for the same phone). Anything that
-- bypassed the form — direct API calls, race conditions on simultaneous
-- bookings, or older code paths — could create same-day duplicates.
--
-- This migration:
--   1. Picks one canonical appointment per (clinic_id, patient_id,
--      scheduled_date) — the one created LATEST (most recent intent),
--      with id as a deterministic tiebreaker.
--   2. Deletes the older duplicates.
--   3. Adds a partial unique index so the DB itself rejects any future
--      same-day duplicate. The service layer also throws a 409 before
--      reaching this index, so the friendly error message comes first.
--
-- No table references appointment(id) right now, so deleting older
-- duplicate appointments has no cascade impact.

-- 1 / 2 — drop older same-day appointments per patient + clinic.
DELETE FROM appointment
WHERE id IN (
  SELECT id FROM (
    SELECT
      a.id,
      ROW_NUMBER() OVER (
        PARTITION BY a.clinic_id, a.patient_id, a.scheduled_time::date
        ORDER BY a.created_at DESC NULLS LAST, a.id DESC
      ) AS rn
    FROM appointment a
    WHERE a.scheduled_time IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- 3 — physical guard: at most one appointment per (clinic, patient, day).
-- Walk-ins and rows with no scheduled_time are excluded so they don't
-- collide; the partial WHERE keeps the index narrow.
CREATE UNIQUE INDEX IF NOT EXISTS ux_appointment_clinic_patient_day
  ON appointment (clinic_id, patient_id, (scheduled_time::date))
  WHERE scheduled_time IS NOT NULL;
