-- Sticky "completed at least once" marker on a visit. Stamped the first time the
-- visit is ended and never cleared on a later amend re-open (session_ended_at IS
-- cleared then). The prescription footer reads this to permanently switch from
-- "Complete visit" to "Save changes" — replacing the per-device localStorage
-- visitCompleted flag so the state follows the patient across devices.
ALTER TABLE visit
    ADD COLUMN completed_at TIMESTAMP NULL;
