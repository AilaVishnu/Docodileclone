-- Track failed login attempts and account lockout state.
-- failed_login_attempts counts consecutive failures; reset to 0 on success.
-- locked_until is set to now() + 15min after 5 consecutive failures.
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until           TIMESTAMPTZ;
