-- Additional doctor profile fields (Doctor role only; ignored for other roles).
ALTER TABLE app_user ADD COLUMN qualification TEXT;
ALTER TABLE app_user ADD COLUMN medical_council TEXT;
ALTER TABLE app_user ADD COLUMN experience_years INTEGER;
