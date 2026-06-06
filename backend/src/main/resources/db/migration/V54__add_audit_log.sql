-- Append-only audit trail. No DELETE or UPDATE is granted at the application
-- layer — rows are inserted once and never modified.
CREATE TABLE audit_log (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID,
    tenant_id   UUID,
    clinic_id   UUID,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   UUID,
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    outcome     VARCHAR(50)  NOT NULL DEFAULT 'SUCCESS',
    metadata    TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_actor_id   ON audit_log(actor_id);
CREATE INDEX idx_audit_log_tenant_id  ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_action     ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
