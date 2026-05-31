-- Relax the "one phone, one patient" rule (added in V24).
--
-- Real clinics routinely register a whole family under a single mobile
-- number, so a UNIQUE index on (clinic, normalized phone) is wrong: it
-- rejected legitimate family members and made bulk imports of real EMR
-- data fail outright. Multiple patients sharing a phone is now allowed.
--
-- The index is still useful for fast phone lookups (find-or-create on
-- booking, visit history), so it's recreated as a PLAIN (non-unique)
-- index over the same normalized expression.

DROP INDEX IF EXISTS ux_patient_clinic_normalized_phone;

CREATE INDEX IF NOT EXISTS ix_patient_clinic_normalized_phone
  ON patient (clinic_id, RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '\D', '', 'g'), 10))
  WHERE phone IS NOT NULL
    AND LENGTH(REGEXP_REPLACE(COALESCE(phone, ''), '\D', '', 'g')) > 0;
