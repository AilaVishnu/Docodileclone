-- Link a visit to the appointment it was opened from.
--
-- V44 lets a patient have several appointments on one day. Visits were
-- keyed only by date, so the second appointment's pad reused the first
-- appointment's visit. Tagging a visit with its appointment lets each
-- appointment own a distinct visit (its own session, prescription, etc.).
--
-- Nullable: migrated/legacy visits and visits created outside an
-- appointment (e.g. "Create visit" on a walk-in) have no appointment.
-- ON DELETE SET NULL so removing an appointment doesn't delete its visit.

ALTER TABLE visit ADD COLUMN appointment_id UUID;

ALTER TABLE visit
  ADD CONSTRAINT visit_appointment_id_fkey
  FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE SET NULL;

CREATE INDEX ix_visit_appointment ON visit (appointment_id) WHERE appointment_id IS NOT NULL;
