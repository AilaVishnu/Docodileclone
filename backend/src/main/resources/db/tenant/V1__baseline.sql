-- Per-tenant schema baseline.
-- Applies inside whatever schema Flyway points at (one schema per clinic).
-- NO clinic_id / tenant_id columns — the schema IS the tenant boundary.
-- NO cross-schema references; no references to public. or platform.
-- Squashed from V1..V61 of the monolithic migration history.
--
-- Deliberate consolidations (deviations from raw migration output):
--   • tenant / clinic / clinic_staff excluded (control-plane only)
--   • revoked_token dropped — revocation = user_session.revoked_at IS NOT NULL
--   • deletion_request + correction_request merged into data_subject_request
--   • created_by / updated_by / deleted_by dropped from all tables
--   • patient.archived / patient.archived_at dropped (superseded by deleted_at)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- app_user
-- (tenant_id dropped; email unique per schema = per clinic)
-- Security columns from V57 (lockout) + V61 (TOTP MFA) included.
-- Provenance columns created_by/updated_by excluded (rule 6).
-- ============================================================
CREATE TABLE app_user (
    id                      UUID PRIMARY KEY,
    name                    VARCHAR(255),
    email                   VARCHAR(255) NOT NULL UNIQUE,
    phone                   VARCHAR(50),
    password_hash           VARCHAR(255),
    role                    VARCHAR(50) NOT NULL,
    active                  BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT now(),
    gender                  VARCHAR(20),
    registration_no         VARCHAR(100),
    custom_role             VARCHAR(100),
    department              TEXT,
    specialty               TEXT,
    qualification           TEXT,
    medical_council         TEXT,
    experience_years        INTEGER,
    account_status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    updated_at              TIMESTAMPTZ,
    failed_login_attempts   INT NOT NULL DEFAULT 0,
    locked_until            TIMESTAMPTZ,
    totp_secret             VARCHAR(100),
    mfa_enabled             BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_backup_codes        TEXT
);

-- ============================================================
-- patient
-- (clinic_id dropped; phone lookup index re-scoped to schema)
-- archived/archived_at dropped (rule 7) — deleted_at is canonical.
-- Provenance columns created_by/updated_by/deleted_by excluded (rule 6).
-- ============================================================
CREATE TABLE patient (
    id           UUID PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    phone        VARCHAR(50),
    gender       VARCHAR(20),
    dob          DATE,
    address      VARCHAR(255),
    created_at   TIMESTAMP DEFAULT now(),
    email        VARCHAR(255),
    age          INTEGER,
    external_ref VARCHAR(128),
    display_no   INTEGER,
    deleted_at   TIMESTAMPTZ,
    updated_at   TIMESTAMPTZ,
    -- Running advance/deposit balance — credit held against future bills.
    -- Every movement is recorded in patient_deposit_ledger. Never negative.
    deposit      NUMERIC(12,2)
);

-- Fast phone lookup (non-unique — same phone allowed for family members)
CREATE INDEX ix_patient_normalized_phone
    ON patient (RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '\D', '', 'g'), 10))
    WHERE phone IS NOT NULL
      AND LENGTH(REGEXP_REPLACE(COALESCE(phone, ''), '\D', '', 'g')) > 0;

-- Unique display number per patient in this tenant
CREATE UNIQUE INDEX uq_patient_display_no
    ON patient (display_no)
    WHERE display_no IS NOT NULL;

-- Idempotent import: unique external_ref per tenant
CREATE UNIQUE INDEX uq_patient_external_ref
    ON patient (external_ref)
    WHERE external_ref IS NOT NULL;

CREATE INDEX idx_patient_deleted_at ON patient (deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================
-- appointment
-- (clinic_id dropped; patient-day index re-scoped to schema)
-- Provenance columns created_by/updated_by/deleted_by excluded (rule 6).
-- ============================================================
CREATE TABLE appointment (
    id               UUID PRIMARY KEY,
    patient_id       UUID NOT NULL REFERENCES patient(id),
    doctor_id        UUID NOT NULL REFERENCES app_user(id),
    scheduled_time   TIMESTAMP,
    status           VARCHAR(50),
    type             VARCHAR(50),
    fee              NUMERIC,
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT now(),
    is_walkin        BOOLEAN DEFAULT FALSE,
    pay_status       VARCHAR(50),
    service          VARCHAR(255),
    payment_method   VARCHAR(50),
    pharmacy_amount  NUMERIC(12, 2),
    discount_amount  NUMERIC(12, 2),
    deleted_at       TIMESTAMPTZ,
    updated_at       TIMESTAMPTZ
);

CREATE INDEX idx_appointment_patient_id ON appointment (patient_id);
CREATE INDEX idx_appointment_doctor_id  ON appointment (doctor_id);

-- Non-unique: multiple appointments per patient per day are allowed (V44)
CREATE INDEX ix_appointment_patient_day
    ON appointment (patient_id, (scheduled_time::date))
    WHERE scheduled_time IS NOT NULL;

CREATE INDEX idx_appointment_deleted_at ON appointment (deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================
-- visit
-- (clinic_id dropped; indexes re-scoped)
-- Provenance columns created_by/updated_by/deleted_by excluded (rule 6).
-- ============================================================
CREATE TABLE visit (
    id                       UUID PRIMARY KEY,
    patient_id               UUID NOT NULL REFERENCES patient(id),
    created_by_doctor_id     UUID REFERENCES app_user(id),
    visit_date               DATE NOT NULL,

    -- Vitals
    bp_systolic              TEXT,
    bp_diastolic             TEXT,
    bp_unit                  VARCHAR(8),
    bmi                      TEXT,
    bmi_unit                 VARCHAR(8),
    height                   TEXT,
    height_unit              VARCHAR(8),
    weight                   TEXT,
    weight_unit              VARCHAR(8),
    temperature              TEXT,
    temperature_unit         VARCHAR(8),
    pulse                    TEXT,
    pulse_unit               VARCHAR(8),
    waist                    TEXT,
    waist_unit               VARCHAR(8),
    hip                      TEXT,
    hip_unit                 VARCHAR(8),
    spo2                     TEXT,
    spo2_unit                VARCHAR(8),

    -- History
    family_history           TEXT,
    allergies                TEXT,
    personal_history         TEXT,
    past_medical_history     TEXT,

    -- Clinical
    complaints               TEXT,
    diagnosis                TEXT,
    notes_for_patient        TEXT,
    private_notes            TEXT,
    tests                    TEXT,

    -- Referral + review
    refer_doctor_id          UUID REFERENCES app_user(id),
    review_date              DATE,
    review_days              INTEGER,
    review_notes             TEXT,

    created_at               TIMESTAMP DEFAULT now(),
    updated_at               TIMESTAMP DEFAULT now(),

    -- Session timing
    session_started_at       TIMESTAMPTZ,
    session_ended_at         TIMESTAMPTZ,
    session_duration_sec     INTEGER,

    -- Import idempotency key
    external_ref             VARCHAR(160),

    -- Link to the appointment that opened this visit
    appointment_id           UUID REFERENCES appointment(id) ON DELETE SET NULL,

    deleted_at               TIMESTAMPTZ,

    -- Sticky "completed at least once" marker: stamped when session_ended_at is
    -- first set, never cleared on a later amend re-open.
    completed_at             TIMESTAMP
);

CREATE INDEX idx_visit_patient_date
    ON visit (patient_id, visit_date DESC);

CREATE UNIQUE INDEX uq_visit_external_ref
    ON visit (external_ref)
    WHERE external_ref IS NOT NULL;

CREATE INDEX ix_visit_appointment
    ON visit (appointment_id)
    WHERE appointment_id IS NOT NULL;

CREATE INDEX idx_visit_deleted_at ON visit (deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================
-- rx_row  (no clinic dimension; child of visit)
-- clinic_id added in V56 is stripped (rule 2).
-- Provenance columns created_by/updated_by/deleted_by excluded (rule 6).
-- ============================================================
CREATE TABLE rx_row (
    id                  UUID PRIMARY KEY,
    visit_id            UUID NOT NULL REFERENCES visit(id) ON DELETE CASCADE,
    position            SMALLINT NOT NULL,
    medicine            TEXT,
    medicine_note       TEXT,
    dosage              TEXT,
    when_to_take        TEXT,
    frequency           TEXT,
    duration            TEXT,
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT now(),
    frequency_interval  TEXT,
    deleted_at          TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_rx_row_visit_id ON rx_row (visit_id);

-- ============================================================
-- rx_template  (clinic_id dropped; unique per schema by kind+name)
-- ============================================================
CREATE TABLE rx_template (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(160) NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    kind       VARCHAR(64) NOT NULL
);

CREATE UNIQUE INDEX uq_rx_template_kind_name ON rx_template (kind, lower(name));

-- ============================================================
-- service  (clinic_id dropped)
-- ============================================================
CREATE TABLE service (
    id            UUID PRIMARY KEY,
    name          TEXT NOT NULL,
    code          TEXT NOT NULL,
    price         NUMERIC(12, 2) NOT NULL DEFAULT 0,
    duration_min  INTEGER NOT NULL DEFAULT 0,
    discount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_mode VARCHAR(2) NOT NULL DEFAULT '%',
    gst           NUMERIC(5, 2) NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- print_template  (clinic_id dropped; one default per tenant schema)
-- Provenance columns created_by/updated_by excluded (rule 6).
-- ============================================================
CREATE TABLE print_template (
    id         UUID PRIMARY KEY,
    name       TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    config     JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- At most one default template per tenant schema
CREATE UNIQUE INDEX idx_print_template_one_default
    ON print_template (is_default)
    WHERE is_default;

-- ============================================================
-- clinic_schedule  (was keyed by clinic_id PK; now single-row table)
-- The original PRIMARY KEY (clinic_id) physically enforced one row per clinic;
-- preserve that invariant per-tenant with a singleton unique index.
-- ============================================================
CREATE TABLE clinic_schedule (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule   JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_clinic_schedule_singleton ON clinic_schedule ((true));

-- ============================================================
-- chat_messages  (clinic_id dropped; indexes re-scoped)
-- ============================================================
CREATE TABLE chat_messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id    UUID NOT NULL,
    sender_name  VARCHAR(255) NOT NULL,
    sender_role  VARCHAR(50),
    recipient_id UUID,
    content      TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_group ON chat_messages (created_at DESC)
    WHERE recipient_id IS NULL;

CREATE INDEX idx_chat_dm ON chat_messages (sender_id, recipient_id, created_at DESC)
    WHERE recipient_id IS NOT NULL;

-- ============================================================
-- chat_last_seen  (no clinic dimension; user-scoped only)
-- ============================================================
CREATE TABLE chat_last_seen (
    user_id          UUID NOT NULL,
    conversation_key VARCHAR(255) NOT NULL,
    seen_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, conversation_key)
);

-- ============================================================
-- patient_files  (clinic_id dropped)
-- patient_id intentionally has NO FK to patient(id), matching source migration
-- V27 (the data-import path may insert files in a batch ordering-independent of
-- patient rows; do not tighten this without revisiting that flow).
-- Provenance columns created_by/updated_by/deleted_by excluded (rule 6).
-- ============================================================
CREATE TABLE patient_files (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id         UUID NOT NULL,
    uploaded_by        UUID,
    name               VARCHAR(500) NOT NULL,
    category           VARCHAR(255),
    investigation_date DATE,
    mime_type          VARCHAR(255),
    notes              TEXT,
    file_data          BYTEA NOT NULL,
    file_size          BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMPTZ,
    updated_at         TIMESTAMPTZ
);

CREATE INDEX idx_patient_files_patient ON patient_files (patient_id, created_at DESC);

-- ============================================================
-- patient_ai_summary  (clinic_id dropped; keyed by patient)
-- ============================================================
CREATE TABLE patient_ai_summary (
    patient_id   UUID PRIMARY KEY REFERENCES patient(id) ON DELETE CASCADE,
    content      JSONB NOT NULL DEFAULT '{}'::jsonb,
    visits_hash  TEXT NOT NULL DEFAULT '',
    updated_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- pharmacy_stock  (clinic_id dropped)
-- Provenance columns created_by/updated_by excluded (rule 6).
-- ============================================================
CREATE TABLE pharmacy_stock (
    id             UUID PRIMARY KEY,
    name           TEXT NOT NULL,
    category       TEXT NOT NULL DEFAULT 'Tablets',
    form           TEXT NOT NULL DEFAULT 'tablet',
    invoice_no     TEXT,
    batch          TEXT,
    pack_price     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    pack_mrp       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    units_per_pack INTEGER NOT NULL DEFAULT 1,
    unit_price     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    units_in_stock INTEGER NOT NULL DEFAULT 0,
    expiry         VARCHAR(7) NOT NULL DEFAULT '',
    discount_pct   NUMERIC(5, 2) NOT NULL DEFAULT 0,
    gst_pct        NUMERIC(5, 2) NOT NULL DEFAULT 0,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pharmacy_stock_expiry ON pharmacy_stock (expiry);
CREATE INDEX idx_pharmacy_stock_name   ON pharmacy_stock (name);

-- ============================================================
-- migration_run  (clinic_id dropped; implicit from tenant schema)
-- ============================================================
CREATE TABLE migration_run (
    id             UUID PRIMARY KEY,
    platform       VARCHAR(64) NOT NULL,
    patients       INTEGER NOT NULL DEFAULT 0,
    visits         INTEGER NOT NULL DEFAULT 0,
    prescriptions  INTEGER NOT NULL DEFAULT 0,
    medicines      INTEGER NOT NULL DEFAULT 0,
    investigations INTEGER NOT NULL DEFAULT 0,
    skipped        INTEGER NOT NULL DEFAULT 0,
    created_at     TIMESTAMP NOT NULL
);

CREATE INDEX ix_migration_run_created ON migration_run (created_at DESC);

-- ============================================================
-- password_reset_token  (no clinic dimension; user-scoped only)
-- ============================================================
CREATE TABLE password_reset_token (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at    TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_prt_token_hash ON password_reset_token (token_hash);
CREATE INDEX idx_prt_user_id    ON password_reset_token (user_id);

-- ============================================================
-- audit_log  (tenant_id + clinic_id dropped; actor_id kept)
-- Append-only audit trail. No DELETE or UPDATE at the application layer.
-- ============================================================
CREATE TABLE audit_log (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   UUID,
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    outcome     VARCHAR(50)  NOT NULL DEFAULT 'SUCCESS',
    metadata    TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_actor_id   ON audit_log (actor_id);
CREATE INDEX idx_audit_log_action     ON audit_log (action);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at);

-- ============================================================
-- user_session  (revoked_token dropped; revocation = revoked_at IS NOT NULL)
-- ============================================================
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

CREATE INDEX idx_user_session_user_id ON user_session (user_id);
CREATE INDEX idx_user_session_jti     ON user_session (jti);

-- ============================================================
-- patient_consent  (clinic_id dropped; patient FK kept)
-- ============================================================
CREATE TABLE patient_consent (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id   UUID        NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    purpose      VARCHAR(200) NOT NULL,
    version      VARCHAR(50)  NOT NULL,
    granted_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    granted_by   UUID,
    ip_address   VARCHAR(45),
    withdrawn_at TIMESTAMPTZ,
    withdrawn_by UUID
);

CREATE INDEX idx_patient_consent_patient ON patient_consent (patient_id);

-- ============================================================
-- data_subject_request  (merges deletion_request + correction_request)
-- clinic_id + tenant_id dropped (rule 2). type discriminator: DELETION | CORRECTION.
-- ============================================================
CREATE TABLE data_subject_request (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID        NOT NULL REFERENCES patient(id),
    type            VARCHAR(20) NOT NULL,            -- DELETION | CORRECTION
    status          VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    requested_by    UUID        NOT NULL,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_by     UUID,
    reviewed_at     TIMESTAMPTZ,
    rejection_note  TEXT,
    completed_at    TIMESTAMPTZ,                     -- executed_at (deletion) / applied_at (correction)
    completed_by    UUID,                            -- executed_by / applied_by
    -- deletion-specific (nullable):
    verified_by     UUID,
    verified_at     TIMESTAMPTZ,
    reason          TEXT,
    -- correction-specific (nullable):
    field_name      VARCHAR(100),
    old_value       TEXT,
    new_value       TEXT
);

CREATE INDEX idx_dsr_patient ON data_subject_request (patient_id);
CREATE INDEX idx_dsr_status  ON data_subject_request (status);
CREATE INDEX idx_dsr_type    ON data_subject_request (type);

-- ============================================================
-- suggestion  (catalog; no clinic/tenant columns — shared by speciality)
-- ============================================================
CREATE TABLE suggestion (
    id         UUID PRIMARY KEY,
    speciality VARCHAR(255) NOT NULL,
    field      VARCHAR(64) NOT NULL,
    value      TEXT NOT NULL,
    use_count  INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    CONSTRAINT uq_suggestion_speciality_field_value UNIQUE (speciality, field, value)
);

CREATE INDEX idx_suggestion_speciality_field ON suggestion (speciality, field);

-- ============================================================
-- clinic_settings  (single-row per-tenant clinic profile)
-- ============================================================
CREATE TABLE clinic_settings (
    id              UUID PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    speciality      VARCHAR(128),
    address         TEXT,
    logo_url        TEXT,
    registration_no VARCHAR(128),
    working_hours   JSONB,
    letterhead      JSONB,
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- Dermatology reference catalog seeds
-- Seeded from V14-V20; clinic-agnostic (no clinic_id column).
-- ON CONFLICT DO NOTHING makes the migration idempotent.
-- ============================================================

-- V16: allergies (16 rows)
INSERT INTO suggestion (id, speciality, field, value, use_count, created_at) VALUES
  (gen_random_uuid(), 'dermatology', 'allergies', 'NKDA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Metformin Intolerance', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Bronchial Asthma', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Milk', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Eggs', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Fish', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Crustacean shellfish', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Tree nuts', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Peanuts', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Wheat', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Soybeans', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Pollen', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Lactose', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'Not Known', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'ATOPY HISTORY +', 0, now()),
  (gen_random_uuid(), 'dermatology', 'allergies', 'PHOTOSENSITIVITY', 0, now())
ON CONFLICT ON CONSTRAINT uq_suggestion_speciality_field_value DO NOTHING;

-- V15: complaints (100 rows)
INSERT INTO suggestion (id, speciality, field, value, use_count, created_at) VALUES
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESIONS OVER FACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'HAIRFALL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESIONS OVER TRUNK', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHING ALL OVER BODY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY RASH OVER THE GROIN', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'BLACK SPOTS OVERFACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY RASH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'HAIR THINNING', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY LESIONS OVER LEGS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'DANDRUFF', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'DARK SPOTS OVER FACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PUS DISCHARGE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'CAME FOR SKIN CARE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PIMPLES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'WHITE SPOTS OVER FACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESIONS OVER HANDS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SCALING', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'BLACK SPOTS OVER THE FACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ACNE VULGARIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY RASH ALL OVER THE BODY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESIONS OVER ARMS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHING OVER SCALP', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'REDNESS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SCALING AND ITCHING', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'BLACK SPOTS OVER FACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHING LEG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'HAIR FALL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'EXCESSIVE SWEATING', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'CASE REVIEWED. IMPROVEMENT NOTED.', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'NO H/O FEVER', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SWELLING', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'OVER THE NECK SINCE 18 YEARS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PIGMENTATION OVER FACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'REDNESS OVER FACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESI0ON OVER GENITALIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESIONS OVER CHEST REGION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHING OVER THE SCROTUM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'FISSURES OVER THE LIPS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY OOZY LESIONS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PIMPLES OVER FACE AND TRUNK', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PIGMENTATION OVER THE CHEEKS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESIONS OVER TRUNK AND ARMS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'HAIRLOSS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SMALL HYPERPIGMENTED LESIONS OVER NECK', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RED RAISED LESIONS OVER KNEES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PIGMENTATION AROUND NOSE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'DARK CIRCLES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'H/O USAGE OF SKINSHINE CREAM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'H/O USAGE OF SKINSHINE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'DRYNESS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SCALY LESIONS OVER THE BODY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SINUS OVER THE LEFT CHEEK', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESIONS OVER THE NOSE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHING AND SCALING OVER THE SCALP AND BEARD AREA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESIONS OVER LATERAL ASPECT OF ARMS,LEGS AND BUTTOCKS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'RAISED LESIONS OVER RT BREAST AND CHEST', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'KCO BREAST CA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY RAISED LESIONS OVER THE SCROTUM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'VIOLACEOUS HUE PRESENT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PAINFUL RED RAISED LESION OVER RT AXILLA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SKIN TAG OVER GROIN', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'KCO PCOD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PAINFUL FISSURES OVER THE LIPS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY SCALY LESIONS OVER THE FLEXURES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'FISSURING OVER THE FEET', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SKIN TAGS OVER NECK', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY RASH OVER THE ARMS AND LEGS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SKIN PEELING OVER THE FACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCY RASH ALL OVER THE BODY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'SIMILAR COMPLAINTS IN THE FAMILY IN TWO OTHER KIDS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'HISTORY OF ATOPY PRESENT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHING', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'DRY SKIN', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'EXCESSIVE HAIR GROWTH OVER CHIN', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'DARK PATCHES OVER LEGS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'HAIR LOSS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY RASH OVER THE PALMS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY RASH OVER THE LEGS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PATCHY HAIR LOSS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'NECK DARKNESS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'PAINFUL LESIONS OVER FEET', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ITCHY RASH OVER BUTTOCKS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'DARKENING OF SKIN OVER FACE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'OVER PALMS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'ELBOWS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'OVER ARMS AND LEGS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'DRYNESS OF SKIN ALL OVER THE BODY SINCE 2 YEARS OF AGE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'C/O FLUID FILLED LESIONS OVER LEGSC/O ASYMPTOMATIC WHITE PATCHES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'C/O DECREASED SENSATIONS OVER BOTH LEGS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'C/O TINGLING SENSATION OVER BOTH HANDS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'NO H/O BLEEDING FROM NOSE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'H/O SLIPPAGE OF FOOTWEAR+', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'NO H/O HOARSENESS OF VOICE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'FAMILY H/O +. HANSENS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'FAMILY H/O + HANSENS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'O/E-', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'C/O FLUID FILLED LESIONS OVER LEGS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'C/O ASYMPTOMATIC WHITE PATCHES OVER TRUNK', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'O/E-ILL DEFINED', 0, now()),
  (gen_random_uuid(), 'dermatology', 'complaints', 'HYPOPIGMENTED PATCHES & MACULES NOTED OVER TRUNK & B/L LL & UL', 0, now())
ON CONFLICT ON CONSTRAINT uq_suggestion_speciality_field_value DO NOTHING;

-- V14: diagnosis (100 rows)
INSERT INTO suggestion (id, speciality, field, value, use_count, created_at) VALUES
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ACNE VULGARIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'TELOGEN EFFLUVIUM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PITYRIASIS CAPITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ALLERGIC CONTACT DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'TINEA CORPORIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'MELASMA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SCABIES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ACANTHOSIS NIGRICANS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'TINEA CRURIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PMLE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PRURIGO SIMPLEX', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'AGA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'POST INFLAMMATORY HYPERPIGMENTATION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'TINEA INCOGNITO', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'DPNS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ACNEIFORM ERUPTION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ACUTE URTICARIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'GRADE 2', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PERIORBITAL MELANOSES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'TRUNCAL ACNE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SEBORRHEIC DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ALOPECIA AREATA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'DPN', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'RIEHLS MELANOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'TSDF', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'HERPES ZOSTER', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PITYRIASIS ALBA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'KERATOSIS PILARIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'FACIAL MELANOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PITYRIASIS FOLLICULITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'CHRONIC URTICARIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SEBORRHEIC CAPITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PITYRIASIS VERSICOLOR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'FISSURE FEET', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'HIRSUTISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PERIORAL MELANOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'CHRONIC PLAQUE PSORIASIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'STASIS DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'FEMALE PATTERN HAIRLOSS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PIH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PEDICULOSIS CAPITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'MACULAR AMYLOIDOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'GRADE 3', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ATROPHIC ACNE SCARS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ANDROGENETIC ALOPECIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'XEROSIS CUTIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PITYRIASIS ROSEA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'TO HAIR DYE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'EYELID ECZEMA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'INTERTRIGO', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'HAND ECZEMA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'STASIS ECZEMA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'TO DETERGENT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'IRRITANT CONTACT DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PREMATURE CANITIES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'CORN', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'LICHEN PLANUS PIGMENTOSUS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'FRICTIONAL MELANOSES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'NUMMULAR ECZEMA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'CALLOSITY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'MILIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ONYCHOMYCOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SCALP FOLLICULITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SENILE XEROSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'LICHEN PLANUS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'FOLLICULITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PAPULAR URTICARIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ACD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ATOPIC DIATHESIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SEBOPSORIASIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'EARLY AGA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SEBACEOUS CYST', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ACNE EXCORIEE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'BINDI DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ATOPIC DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', '? SWEAT DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'VERRUCA VULGARIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PALMOPLANTAR PSORIASIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'POST ACNE ATROPHIC SCARS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SCROTAL DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'CANDIDAL BALANOPOSTHITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PRURIGO NODULARIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PLANTAR WART', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SCALP PSORIASIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'PALMAR PSORIASIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ATROPHIC SCARS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'RETINOID DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'DANDRUFF', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'LIP LICKERS DERMATITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'CHRONIC LICHENIFIED ECZEMA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'ABSCESS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'INSECT BITE REACTION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'VARICELLA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'SECONDARY BACTERIAL INFECTION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'KELOID', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'GRADE1', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'DERMOGRAPHISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'POMPHOLYX', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'CHRONIC SPONTANEOUS URTICARIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'diagnosis', 'LSC', 0, now())
ON CONFLICT ON CONSTRAINT uq_suggestion_speciality_field_value DO NOTHING;

-- V18: family_history (117 rows)
INSERT INTO suggestion (id, speciality, field, value, use_count, created_at) VALUES
  (gen_random_uuid(), 'dermatology', 'family_history', 'ACNE VULGARIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ACROMEGALY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ACUTE GASTRITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'AID TYPE 1', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'AID TYPE 2', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ALLERGIC BRONCHITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ANAEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'APD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CA THYROID', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CAD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CAH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CENTRAL HYPOTHYROIDISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CHRONIC ANOVULATION WITHOUT HYPERANDROGENISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CKD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CKD - STAGE 1', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CKD - STAGE 2', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CKD - STAGE 3', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CKD - STAGE 4', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CKD - STAGE 5', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'COMBINED HYPERLIPIDEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CONGENITAL HYPOTHYROIDIM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CONSTITUTIONAL DELAYED PUBERT AND GROWTH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'CVD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DENGUE FEVER', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DEPRESSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DIABETES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DIABETES INSIPIDUS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DIABETES MELLITUS TYPE 1', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DIABETES MELLITUS TYPE 2', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DIABETIC FOOT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DIABETIC RETINOPATHY - BACKGROUND', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DIABETIC RETINOPATHY - PROLIFERATIVE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'DYSLIPIDEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'EMPTY SELLA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ESSENTIAL HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'EUTHYROID MNG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'FUNGAL INFECTION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'GDM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'GESTATIONAL DIABETES MELLITUS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'GESTATIONAL THYROTOXICOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'GH DEFICIENCY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'GRAVES DIAGNOSED IN PREGNANCY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'GRAVES ORBITOPATHY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPERGLYCEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPERGLYCERIDEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPERLIPIDEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPERLIPOPROTEINEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPO-HYPO FEMALE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPO-HYPO MALE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPOGLYCEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPOTHYROIDISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'HYPOTHYROIDISM DIAGNOSED IN PREGNANCY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'IDIOPATHIC HIRSUTISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'INCIDENTAL ADRENAL TUMOR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'IODINE INDUCED THYROTOXICOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ISCHEMIC HEART DISEASE - MYCOARDIAL INFARCTION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ISCHEMIC HEART DISEASE - STABLE ANGINA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ISCHEMIC HEART DISEASE - UNSTABLE ANGINA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ISOLATED SYSTOLIC HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'ISS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'JUVENILE DIABETES MELLITUS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'LOW UPTAKE IMMUNE THYROTOXICOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'LRTI', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'MALIGNANT HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'MICROALBUMINURIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'MNG WITH TRACHEAL COMPRESSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'NEPHROPATHY SATGE 4', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'NEPHROPATHY STAGE 1', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'NEPHROPATHY STAGE 2', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'NEPHROPATHY STAGE 3', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'NEUROPATHY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'OBESITY – BARIATRIC SURGERY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'OBESITY – METABOLICALLY HEALTHY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'OBESITY – METABOLICALLY UNHEALTHY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PANHYPOPITUITARISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PCOS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PERIPHERAL NEUROPATHY - PAINFUL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PERIPHERAL NEUROPATHY - PAINLESS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PHOBIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'POST PARTUM THYROIDITIS WITH HYPOTHYROIDISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'POST PARTUM THYROIDITIS WITH THYROTOXICOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PRE DIABETES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PRECOCIOUS PUBERTY CENTRAL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PRECOCIOUS PUBERTY PERIPHERAL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PREMATURE MENOPAUSE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PRIMARY OVARIAN FAILURE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PRIMARY TESTICULAR FAILURE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PSYCHOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'PVD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'RESISTANT HYPETENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'RETINOPATHY BG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'RETINOPATHY PDR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'SCHIZOPHRENIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'SECONDARY DM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'SECONDARY HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'SIADH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'SIMPLE GOITER', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'SINUSITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'SOLITARY THYROID NODULE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'SUBCLINICAL HYPOTHYROIDISM WITH NEGATIVE ANTIBODIES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'SUBCLINICAL HYPOTHYROIDISM WITH POSITIVE ANTIBODIES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'THYROID AGENESIS/ECTOPIC THYROID', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'TOXIC MNG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'URTI', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'UTI', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'VERTIGO', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'VIRAL FEVER', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'WARTS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'Coronary Angioplasty', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'Stent Placement', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'Heart bypass surgery', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'Appendectomy', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'Hysterectomy', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'Cholecystectomy', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'Cataract Surgery', 0, now()),
  (gen_random_uuid(), 'dermatology', 'family_history', 'FAMILY H/O VITILIGO', 0, now())
ON CONFLICT ON CONSTRAINT uq_suggestion_speciality_field_value DO NOTHING;

-- V19: past_medical_history (117 rows)
INSERT INTO suggestion (id, speciality, field, value, use_count, created_at) VALUES
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ACNE VULGARIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ACROMEGALY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ACUTE GASTRITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'AID TYPE 1', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'AID TYPE 2', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ALLERGIC BRONCHITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ANAEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'APD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CA THYROID', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CAD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CAH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CENTRAL HYPOTHYROIDISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CHRONIC ANOVULATION WITHOUT HYPERANDROGENISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CKD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CKD - STAGE 1', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CKD - STAGE 2', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CKD - STAGE 3', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CKD - STAGE 4', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CKD - STAGE 5', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'COMBINED HYPERLIPIDEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CONGENITAL HYPOTHYROIDIM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CONSTITUTIONAL DELAYED PUBERT AND GROWTH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'CVD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DENGUE FEVER', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DEPRESSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DIABETES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DIABETES INSIPIDUS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DIABETES MELLITUS TYPE 1', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DIABETES MELLITUS TYPE 2', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DIABETIC FOOT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DIABETIC RETINOPATHY - BACKGROUND', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DIABETIC RETINOPATHY - PROLIFERATIVE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'DYSLIPIDEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'EMPTY SELLA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ESSENTIAL HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'EUTHYROID MNG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'FUNGAL INFECTION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'GDM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'GESTATIONAL DIABETES MELLITUS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'GESTATIONAL THYROTOXICOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'GH DEFICIENCY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'GRAVES DIAGNOSED IN PREGNANCY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'GRAVES ORBITOPATHY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPERGLYCEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPERGLYCERIDEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPERLIPIDEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPERLIPOPROTEINEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPO-HYPO FEMALE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPO-HYPO MALE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPOGLYCEMIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPOTHYROIDISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'HYPOTHYROIDISM DIAGNOSED IN PREGNANCY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'IDIOPATHIC HIRSUTISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'INCIDENTAL ADRENAL TUMOR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'IODINE INDUCED THYROTOXICOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ISCHEMIC HEART DISEASE - MYCOARDIAL INFARCTION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ISCHEMIC HEART DISEASE - STABLE ANGINA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ISCHEMIC HEART DISEASE - UNSTABLE ANGINA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ISOLATED SYSTOLIC HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'ISS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'JUVENILE DIABETES MELLITUS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'LOW UPTAKE IMMUNE THYROTOXICOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'LRTI', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'MALIGNANT HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'MICROALBUMINURIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'MNG WITH TRACHEAL COMPRESSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'NEPHROPATHY SATGE 4', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'NEPHROPATHY STAGE 1', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'NEPHROPATHY STAGE 2', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'NEPHROPATHY STAGE 3', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'NEUROPATHY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'OBESITY – BARIATRIC SURGERY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'OBESITY – METABOLICALLY HEALTHY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'OBESITY – METABOLICALLY UNHEALTHY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PANHYPOPITUITARISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PCOS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PERIPHERAL NEUROPATHY - PAINFUL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PERIPHERAL NEUROPATHY - PAINLESS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PHOBIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'POST PARTUM THYROIDITIS WITH HYPOTHYROIDISM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'POST PARTUM THYROIDITIS WITH THYROTOXICOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PRE DIABETES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PRECOCIOUS PUBERTY CENTRAL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PRECOCIOUS PUBERTY PERIPHERAL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PREMATURE MENOPAUSE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PRIMARY OVARIAN FAILURE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PRIMARY TESTICULAR FAILURE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PSYCHOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'PVD', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'RESISTANT HYPETENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'RETINOPATHY BG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'RETINOPATHY PDR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'SCHIZOPHRENIA', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'SECONDARY DM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'SECONDARY HYPERTENSION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'SIADH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'SIMPLE GOITER', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'SINUSITIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'SOLITARY THYROID NODULE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'SUBCLINICAL HYPOTHYROIDISM WITH NEGATIVE ANTIBODIES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'SUBCLINICAL HYPOTHYROIDISM WITH POSITIVE ANTIBODIES', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'THYROID AGENESIS/ECTOPIC THYROID', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'TOXIC MNG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'URTI', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'UTI', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'VERTIGO', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'VIRAL FEVER', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'WARTS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'Coronary Angioplasty', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'Stent Placement', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'Heart bypass surgery', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'Appendectomy', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'Hysterectomy', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'Cholecystectomy', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'Cataract Surgery', 0, now()),
  (gen_random_uuid(), 'dermatology', 'past_medical_history', 'FAMILY H/O VITILIGO', 0, now())
ON CONFLICT ON CONSTRAINT uq_suggestion_speciality_field_value DO NOTHING;

-- V17: personal_history (36 rows)
INSERT INTO suggestion (id, speciality, field, value, use_count, created_at) VALUES
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Smoking', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Smoking (1-5 in a day)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Smoking (5-10 in a day)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Smoking (More than 10 in a day)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Smoking (Occasionally)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Smoking (Quit)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Drinking (Occasionally)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Drinking (Moderate)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Drinking (Heavy)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Drinking (Quit)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Tobacco Chewer', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Tobacco (Quit)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Sedentary lifestyle', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Moderate lifestyle', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Active lifestyle', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Good Diet', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Average Diet', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Poor Diet', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Disturbed Sleep', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Adequate Sleep', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Peaceful Sleep', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Insomnia', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Somnambulism', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Unmarried', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Married', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Divorced', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Widowed', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Consanguineous marriage', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Non-consanguineous marriage', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Children Yes', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Children No', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Regular menses', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Irregular menses', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'Post Menopause', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'HOE-denied', 0, now()),
  (gen_random_uuid(), 'dermatology', 'personal_history', 'NOT BREASTFEEDING', 0, now())
ON CONFLICT ON CONSTRAINT uq_suggestion_speciality_field_value DO NOTHING;

-- V20: tests (98 rows)
INSERT INTO suggestion (id, speciality, field, value, use_count, created_at) VALUES
  (gen_random_uuid(), 'dermatology', 'tests', 'THYROID PROFILE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CBP', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'B12 LEVELS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'VITAMIN D3 LEVELS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HIV', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HBSAG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'RBS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'BT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'LFT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'FERRITIN', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'RFT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'LIPID PROFILE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CBP THYROID LEVELS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG COLOUR DOPPLER-VENOUS OF BOTH LL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'MANTOUX TEST', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'FLP', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'FBS PPBS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HBA1C', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CUE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'FSH LH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SR TESTOSTERONE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SR PRL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HIV-NR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HBSAG-NEGATIVE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CT BT WNL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HCV', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG KUB & PELVIS TO R/O PCOM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SERUM IGE LEVELS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'ESR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'VITAMIN B12 LEVELS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'DHEAS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'AEC', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'TFT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'FASTING LIPID PROFILE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'TOTAL BLOOD COUNT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'VDRL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HOMA-IR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SR IGE LEVELS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HIV1 AND HIV 2. HBSAG. HCV. VDRL (TITRES)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'WNL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'PROLACTIN', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'FREE TESTOSTERONE AND TOTAL TESTOSTERONE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SR CORTISOL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'QUANTIFERON TB GOLD TEST', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG OF THE LESION OVER RT. SIDE OF THE NECK', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SLIT SKIN SMEAR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG OF THE LESION OVER SCALP', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'KOH MOUNT FOR RT TOE NAIL CLIPPINGS TO R/O ONYCHOMYCOSIS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CRP', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'TESTS-NORMAL RBS AND FLP HIGH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CBP-N', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'LFT-N', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'RFT-N', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CUE-N', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'FLP-N', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'TFT-N', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SUGAR RANDOM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG OF LEFT CHEEK', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG COLOUR DOPPLER-VENOUS OF LEFT LL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG PELVIS/KUB TO R/O', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'ANA TITRE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'ASO TITRE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG OF THE LESION OVER LEFT RETROAURICULAR REGION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'UPT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', '- WNL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'ECG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'TO R/O HANSENS DISEASE ( FAMILY H/O + 10 YEARS AGO )', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SKIN BIOPSY', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'PT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'PROTHROMBIN TIME', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'PARTIAL THROMBOPLASTIN TIME', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SERUM LDH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'PERIPHERAL BLOOD SMEAR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'INJ.AVIL/HYDROCORT IV STAT I/C/O BREATHLESSNESS/LIP SWELLING', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HSV IGG IGM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'DEFICIENT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'FH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'LSH', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'PLAN FOR EXCISION', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CHEST XRAY(PA VIEW)', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'ANA PROFILE', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SERUM VITAMIN D3', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'NR', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'PLAN FOR ILS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'MNRF', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG OF THE LESION OVER LEFT LATERAL CANTHUS', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'SHBG', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'HSV 2 IGG IGM', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'USG OF THE LESION OVER RT BREAST TO R/O SINUS TRACT', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'CBP LFT RFT RBS FLP -NORMAL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'NORMAL', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'RBS-N', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'Blood Count', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'Complete Foot Examination', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'Fundus Camera', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'Liver Fitness Test', 0, now()),
  (gen_random_uuid(), 'dermatology', 'tests', 'Retinal Examination', 0, now())
ON CONFLICT ON CONSTRAINT uq_suggestion_speciality_field_value DO NOTHING;

-- ============================================================
-- patient_deposit_ledger  (clinic_id dropped; schema-scoped)
-- Auditable trail of every DEPOSIT, REFUND and BILL_DEDUCTION movement.
-- The running net balance lives on patient.deposit (fast read); every
-- movement is written here so the history is auditable. The net never
-- goes below zero.
-- ============================================================
CREATE TABLE patient_deposit_ledger (
    id             UUID PRIMARY KEY,
    patient_id     UUID NOT NULL REFERENCES patient(id),
    -- Set only for BILL_DEDUCTION rows: which appointment drew the deposit.
    appointment_id UUID REFERENCES appointment(id),
    type           VARCHAR(32) NOT NULL,     -- DEPOSIT | REFUND | BILL_DEDUCTION
    amount         NUMERIC(12,2) NOT NULL,   -- always positive; type gives direction
    mode           VARCHAR(64),              -- payment mode for DEPOSIT / REFUND
    details        TEXT,                     -- free-text note from the deposit drawer
    balance_after  NUMERIC(12,2) NOT NULL,   -- running net after this movement
    created_at     TIMESTAMP NOT NULL
);

CREATE INDEX idx_deposit_ledger_patient
    ON patient_deposit_ledger (patient_id, created_at DESC);

-- ============================================================
-- bill  (clinic_id dropped; seq is per-schema, unique per schema)
-- Each Charge & Bill snapshots one invoice here. SUPPLEMENTS the existing
-- appointment-level billing (fee/pharmacy_amount/pay_status) — this table
-- is the invoice history record, not the live revenue figure. `seq` is a
-- per-schema running number that formats invoice_no (INV_0001 …); `items`
-- is a JSON snapshot of the line items so a bill can be reprinted.
-- ============================================================
CREATE TABLE bill (
    id              UUID PRIMARY KEY,
    patient_id      UUID NOT NULL REFERENCES patient(id),
    appointment_id  UUID REFERENCES appointment(id),
    invoice_no      VARCHAR(32) NOT NULL,
    seq             INTEGER NOT NULL,
    bill_date       DATE NOT NULL,
    billed          NUMERIC(12,2) NOT NULL,
    paid            NUMERIC(12,2) NOT NULL,
    due             NUMERIC(12,2) NOT NULL,
    refund          NUMERIC(12,2) NOT NULL,
    deposit_applied NUMERIC(12,2),
    pay_status      VARCHAR(32),
    payment_method  VARCHAR(64),
    items           TEXT,
    created_at      TIMESTAMP NOT NULL
);

CREATE INDEX idx_bill_patient_date
    ON bill (patient_id, bill_date DESC, seq DESC);

-- Per-schema unique: two invoices in a schema can never share a seq number
-- (concurrent creates lose the race with a constraint error, not a duplicate).
CREATE UNIQUE INDEX uq_bill_seq ON bill (seq);
