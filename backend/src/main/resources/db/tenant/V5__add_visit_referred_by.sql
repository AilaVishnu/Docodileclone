-- referred_by — the referral doctor (from the Catalog directory) who referred
-- the patient in, captured on the visit and printed as "Ref. by". Denormalized
-- name (the referral directory is separate); the existing refer_doctor_id
-- (a staff FK) is left in place for backward compatibility. Nullable.
ALTER TABLE visit ADD COLUMN IF NOT EXISTS referred_by TEXT;
