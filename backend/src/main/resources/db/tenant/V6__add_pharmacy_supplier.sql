-- supplier — the supplier a stock item was procured from (chosen from the
-- Catalog "Suppliers" directory when adding stock). Denormalized name; nullable
-- so existing rows and stock without a recorded supplier are unaffected.
ALTER TABLE pharmacy_stock ADD COLUMN IF NOT EXISTS supplier TEXT;
