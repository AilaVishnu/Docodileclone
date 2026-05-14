-- Backfill created_by_doctor_id for existing visits that were created
-- before the field was wired into the save flow. Match each visit to the
-- appointment that shares the same patient + date and copy the doctor.
UPDATE visit v
SET created_by_doctor_id = a.doctor_id
FROM appointment a
WHERE v.created_by_doctor_id IS NULL
  AND v.patient_id = a.patient_id
  AND v.visit_date = DATE(a.scheduled_time);
