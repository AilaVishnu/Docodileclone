CREATE TABLE tenant (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE clinic ADD COLUMN tenant_id UUID;

INSERT INTO tenant (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant')
ON CONFLICT (id) DO NOTHING;

UPDATE clinic
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

ALTER TABLE clinic
  ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE clinic
  ADD CONSTRAINT fk_clinic_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenant(id);

ALTER TABLE app_user ADD COLUMN tenant_id UUID;

UPDATE app_user
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

ALTER TABLE app_user
  ADD CONSTRAINT fk_app_user_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenant(id);

CREATE TABLE clinic_staff (
  clinic_id UUID NOT NULL REFERENCES clinic(id),
  staff_id UUID NOT NULL REFERENCES app_user(id),
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (clinic_id, staff_id)
);

INSERT INTO clinic_staff (clinic_id, staff_id)
SELECT clinic_id, id
FROM app_user
WHERE clinic_id IS NOT NULL AND role <> 'ADMIN'
ON CONFLICT DO NOTHING;

ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_clinic_id_fkey;
ALTER TABLE app_user DROP COLUMN clinic_id;
