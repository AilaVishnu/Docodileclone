CREATE TABLE chat_messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id    UUID        NOT NULL,
    sender_id    UUID        NOT NULL,
    sender_name  VARCHAR(255) NOT NULL,
    sender_role  VARCHAR(50),
    recipient_id UUID,
    content      TEXT        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_group ON chat_messages (clinic_id, created_at DESC)
    WHERE recipient_id IS NULL;

CREATE INDEX idx_chat_dm ON chat_messages (clinic_id, sender_id, recipient_id, created_at DESC)
    WHERE recipient_id IS NOT NULL;

CREATE TABLE chat_last_seen (
    user_id          UUID         NOT NULL,
    conversation_key VARCHAR(255) NOT NULL,
    seen_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, conversation_key)
);
