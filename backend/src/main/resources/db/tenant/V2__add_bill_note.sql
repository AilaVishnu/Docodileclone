-- Free-text note captured on a bill ("Add Details" in the bill editor), shown
-- again when the invoice is reopened. Nullable; existing bills have none.
-- Forward migration so already-provisioned clinic schemas gain the column too
-- (new schemas run V1 then this).
ALTER TABLE bill ADD COLUMN IF NOT EXISTS note TEXT;
