ALTER TABLE clinic ADD COLUMN domain VARCHAR(255);

CREATE UNIQUE INDEX idx_clinic_domain ON clinic(domain);
