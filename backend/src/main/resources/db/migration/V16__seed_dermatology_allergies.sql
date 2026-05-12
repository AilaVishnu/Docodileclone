-- Seed dermatology allergy suggestions. Field = 'allergies', specialty
-- = 'dermatology' (matches the lowercase + trimmed normalization done by
-- SuggestionService.resolveSpecialities). Idempotent via ON CONFLICT.
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
ON CONFLICT (speciality, field, value) DO NOTHING;
