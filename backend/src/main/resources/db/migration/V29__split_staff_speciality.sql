-- Staff specialty is now stored under department in two separate columns
-- instead of the pipe-encoded `speciality` string. Existing rows are split
-- on the first "|" — left side becomes department, right side becomes specialty.
ALTER TABLE app_user ADD COLUMN department TEXT;
ALTER TABLE app_user ADD COLUMN specialty TEXT;

UPDATE app_user
SET department = CASE
        WHEN speciality IS NULL THEN NULL
        WHEN position('|' IN speciality) > 0 THEN substring(speciality FROM 1 FOR position('|' IN speciality) - 1)
        ELSE speciality
    END,
    specialty = CASE
        WHEN speciality IS NULL OR position('|' IN speciality) = 0 THEN NULL
        ELSE substring(speciality FROM position('|' IN speciality) + 1)
    END;

ALTER TABLE app_user DROP COLUMN speciality;
