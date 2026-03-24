-- Add gender, speciality, and registration_no to app_user
ALTER TABLE app_user ADD COLUMN gender VARCHAR(20);
ALTER TABLE app_user ADD COLUMN speciality VARCHAR(255);
ALTER TABLE app_user ADD COLUMN registration_no VARCHAR(100);

-- Make password_hash nullable for staff added via BYC
ALTER TABLE app_user ALTER COLUMN password_hash DROP NOT NULL;
