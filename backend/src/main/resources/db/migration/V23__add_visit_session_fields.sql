-- Adds per-visit session timing so the Prescription page can persist
-- when the doctor started/ended the consultation timer and the final
-- elapsed seconds. Backed up by SessionBar's wall-clock timer state on
-- the frontend; these columns are written when handleSessionEnd fires
-- on the prescription form.

ALTER TABLE visit
    ADD COLUMN session_started_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN session_ended_at   TIMESTAMP WITH TIME ZONE,
    ADD COLUMN session_duration_sec INTEGER;
