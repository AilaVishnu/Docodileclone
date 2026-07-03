-- Enforce the "one phone, one patient" rule per clinic.
--
-- History: Patient rows were keyed loosely on the user-typed phone string,
-- so booking the same person as "+91 99999 99999" once and "9999999999"
-- later (or any other formatting variant) silently created separate
-- Patient rows. Some phones ended up with 6 duplicate rows. This
-- migration:
--   1. Picks one canonical Patient per (clinic_id, normalized phone) —
--      the oldest by created_at, ties broken by id for determinism.
--   2. Re-points every appointment / visit at that canonical patient.
--   3. Deletes the now-orphaned duplicate Patient rows.
--   4. Adds a partial functional unique index on (clinic_id, last 10
--      digits of phone) so any future booking that tries to create a
--      second Patient with the same number is rejected by the DB.
--
-- Phone is normalized to its last 10 digits — strips formatting like
-- "+91", spaces, hyphens. Rows with no usable phone (NULL or empty
-- after stripping) are left alone and excluded from the unique index
-- (anonymous walk-ins shouldn't collide with each other).

-- 1 / 2 — re-point appointments at the canonical patient.
UPDATE appointment a
SET patient_id = canon.canonical_id
FROM (
  SELECT
    p.id,
    FIRST_VALUE(p.id) OVER (
      PARTITION BY p.clinic_id, RIGHT(REGEXP_REPLACE(COALESCE(p.phone, ''), '\D', '', 'g'), 10)
      ORDER BY p.created_at NULLS LAST, p.id
    ) AS canonical_id
  FROM patient p
  WHERE p.phone IS NOT NULL
    AND LENGTH(REGEXP_REPLACE(COALESCE(p.phone, ''), '\D', '', 'g')) > 0
) canon
WHERE a.patient_id = canon.id
  AND canon.id <> canon.canonical_id;

-- 1 / 2 — same re-point for visits.
UPDATE visit v
SET patient_id = canon.canonical_id
FROM (
  SELECT
    p.id,
    FIRST_VALUE(p.id) OVER (
      PARTITION BY p.clinic_id, RIGHT(REGEXP_REPLACE(COALESCE(p.phone, ''), '\D', '', 'g'), 10)
      ORDER BY p.created_at NULLS LAST, p.id
    ) AS canonical_id
  FROM patient p
  WHERE p.phone IS NOT NULL
    AND LENGTH(REGEXP_REPLACE(COALESCE(p.phone, ''), '\D', '', 'g')) > 0
) canon
WHERE v.patient_id = canon.id
  AND canon.id <> canon.canonical_id;

-- 3 — drop orphan patient rows now that nothing references them.
DELETE FROM patient
WHERE id IN (
  SELECT id FROM (
    SELECT
      p.id,
      FIRST_VALUE(p.id) OVER (
        PARTITION BY p.clinic_id, RIGHT(REGEXP_REPLACE(COALESCE(p.phone, ''), '\D', '', 'g'), 10)
        ORDER BY p.created_at NULLS LAST, p.id
      ) AS canonical_id
    FROM patient p
    WHERE p.phone IS NOT NULL
      AND LENGTH(REGEXP_REPLACE(COALESCE(p.phone, ''), '\D', '', 'g')) > 0
  ) ranked
  WHERE id <> canonical_id
);

-- 4 — physical guard: one Patient row per (clinic, normalized phone).
CREATE UNIQUE INDEX IF NOT EXISTS ux_patient_clinic_normalized_phone
  ON patient (clinic_id, RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '\D', '', 'g'), 10))
  WHERE phone IS NOT NULL
    AND LENGTH(REGEXP_REPLACE(COALESCE(phone, ''), '\D', '', 'g')) > 0;
