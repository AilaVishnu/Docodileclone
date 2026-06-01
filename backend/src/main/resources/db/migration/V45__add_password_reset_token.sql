CREATE TABLE password_reset_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_prt_token_hash ON password_reset_token(token_hash);
CREATE INDEX idx_prt_user_id ON password_reset_token(user_id);

ALTER TABLE app_user ADD COLUMN IF NOT EXISTS account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';
UPDATE app_user SET account_status = 'PENDING_ACTIVATION' WHERE password_hash IS NULL;
