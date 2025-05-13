-- Add status column to forms table
ALTER TABLE forms ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Update existing forms to have 'published' status if they were previously published
UPDATE forms SET status = 'published' WHERE is_published = true;

-- Drop the old is_published column since we're replacing it with status
ALTER TABLE forms DROP COLUMN is_published; 