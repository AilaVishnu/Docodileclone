-- Tracks how much the dispensary collected for medicines on a given
-- appointment, separate from the consultation `fee`. Lets the Finance
-- dashboard surface pharmacy revenue independently and accumulate over
-- multiple bills on the same visit (column is overwritten with the
-- latest total — clinics issue one consolidated bill per visit).
ALTER TABLE appointment
    ADD COLUMN pharmacy_amount NUMERIC(12, 2) NULL;
