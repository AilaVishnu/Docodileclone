-- Rupee discount applied to the consultation+pharmacy bill at payment
-- time. Lets the receptionist record waivers, courtesy discounts, etc.
-- The fee column stays as the original booking amount; finance computes
-- collected revenue as (fee + pharmacy_amount - discount_amount) for
-- PAID rows and treats WAIVED rows as zero collection.
ALTER TABLE appointment
    ADD COLUMN discount_amount NUMERIC(12, 2) NULL;
