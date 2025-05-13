-- Add short_url column to forms table
ALTER TABLE forms ADD COLUMN short_url TEXT UNIQUE;

-- Create index for faster lookups by short_url
CREATE INDEX idx_forms_short_url ON forms(short_url); 