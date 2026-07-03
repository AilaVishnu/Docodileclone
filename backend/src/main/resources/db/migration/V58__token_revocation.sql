-- Revoked JWT IDs. Entries expire naturally after the token's expiry time
-- and can be periodically purged. The JwtAuthenticationFilter checks this
-- table after validating the token signature — if the jti is present, the
-- token is rejected even though it is cryptographically valid.
CREATE TABLE revoked_token (
    jti         UUID        PRIMARY KEY,
    user_id     UUID        NOT NULL,
    revoked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_revoked_token_user_id    ON revoked_token(user_id);
CREATE INDEX idx_revoked_token_expires_at ON revoked_token(expires_at);

-- User session tracking — one row per issued token, regardless of revocation.
CREATE TABLE user_session (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL,
    jti          UUID        NOT NULL UNIQUE,
    ip_address   VARCHAR(45),
    user_agent   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at   TIMESTAMPTZ NOT NULL,
    revoked_at   TIMESTAMPTZ
);

CREATE INDEX idx_user_session_user_id ON user_session(user_id);
CREATE INDEX idx_user_session_jti     ON user_session(jti);
