-- Human-facing patient number, unique per clinic. Replaces the frontend's
-- hash-derived "T###" code (which collided across patients).
--
-- Imported patients keep the numeric part of their HealthPlix id ("T960" →
-- 960) so the visible code matches the clinic's old records. Native patients,
-- de-duplicated rows, and any non-numeric id continue the sequence above the
-- clinic's current max. New patients (bookings / re-imports) follow the same
-- rule — see HealthPlixMigrationService / AppointmentService.
ALTER TABLE patient ADD COLUMN display_no INTEGER NULL;

-- Imported patients: numeric part of their HealthPlix id.
UPDATE patient
SET display_no = NULLIF(regexp_replace(external_ref, '[^0-9]', '', 'g'), '')::int
WHERE external_ref IS NOT NULL;

-- Resolve duplicate numbers within a clinic — keep the earliest patient,
-- clear the rest so they pick up a fresh number below.
WITH dups AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY clinic_id, display_no
               ORDER BY created_at NULLS FIRST, id
           ) AS rn
    FROM patient
    WHERE display_no IS NOT NULL
)
UPDATE patient p
SET display_no = NULL
FROM dups d
WHERE p.id = d.id AND d.rn > 1;

-- Everyone still unnumbered (native patients, de-duped rows, non-numeric ids)
-- continues the sequence above the clinic's current max.
WITH maxes AS (
    SELECT clinic_id, COALESCE(MAX(display_no), 0) AS mx
    FROM patient
    GROUP BY clinic_id
),
seq AS (
    SELECT p.id,
           m.mx + ROW_NUMBER() OVER (
               PARTITION BY p.clinic_id
               ORDER BY p.created_at NULLS FIRST, p.id
           ) AS new_no
    FROM patient p
    JOIN maxes m ON m.clinic_id = p.clinic_id
    WHERE p.display_no IS NULL
)
UPDATE patient p
SET display_no = s.new_no
FROM seq s
WHERE p.id = s.id;

CREATE UNIQUE INDEX uq_patient_clinic_display_no
    ON patient (clinic_id, display_no)
    WHERE display_no IS NOT NULL;
