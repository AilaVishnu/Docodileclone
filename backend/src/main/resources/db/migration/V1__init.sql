CREATE TABLE clinic (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE app_user (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinic(id),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE patient (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinic(id),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  gender VARCHAR(20),
  dob DATE,
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE appointment (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinic(id),
  patient_id UUID NOT NULL REFERENCES patient(id),
  doctor_id UUID NOT NULL REFERENCES app_user(id),
  scheduled_time TIMESTAMP,
  status VARCHAR(50),
  type VARCHAR(50),
  fee DECIMAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_app_user_clinic_id ON app_user(clinic_id);
CREATE INDEX idx_patient_clinic_id ON patient(clinic_id);
CREATE INDEX idx_appointment_clinic_id ON appointment(clinic_id);
CREATE INDEX idx_appointment_patient_id ON appointment(patient_id);
CREATE INDEX idx_appointment_doctor_id ON appointment(doctor_id);
