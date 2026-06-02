-- Dosing interval for a prescription row (daily / weekly / fortnight / monthly
-- / stat / sos …) — distinct from `frequency`, which holds the per-day pattern
-- (e.g. 1-0-1). Filled by the "Frequency" dropdown on the prescription pad.
ALTER TABLE rx_row ADD COLUMN frequency_interval TEXT NULL;
