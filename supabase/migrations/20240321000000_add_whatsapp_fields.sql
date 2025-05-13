-- Add WhatsApp fields to forms table
ALTER TABLE forms
ADD COLUMN whatsapp_number TEXT,
ADD COLUMN country_code TEXT DEFAULT '+1';

-- Update existing forms to have default values
UPDATE forms
SET country_code = '+1'
WHERE country_code IS NULL; 