-- TOTP (Time-based One-Time Password) MFA fields on app_user.
-- totp_secret: Base32-encoded shared secret (stored encrypted at rest in future; AES-256 field-level encryption is a separate sprint).
-- mfa_enabled: Whether the user has completed TOTP enrollment.
-- Backup codes are stored as a JSON array of BCrypt hashes in mfa_backup_codes.
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS totp_secret      VARCHAR(100),
    ADD COLUMN IF NOT EXISTS mfa_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS mfa_backup_codes TEXT;
