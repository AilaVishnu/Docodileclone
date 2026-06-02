ALTER TABLE tenant
  ADD COLUMN admin_user_id UUID REFERENCES app_user(id);

UPDATE tenant t
SET admin_user_id = (
  SELECT u.id
  FROM app_user u
  WHERE u.tenant_id = t.id
    AND u.role = 'ADMIN'
  ORDER BY u.created_at
  LIMIT 1
);
