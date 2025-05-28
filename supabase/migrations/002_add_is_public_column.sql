-- Add is_public column to newsletters table
ALTER TABLE newsletters ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

-- Create index for is_public column for better performance
CREATE INDEX idx_newsletters_is_public ON newsletters(is_public);
 
-- Update RLS policy to allow public access to published newsletters
CREATE POLICY "Public can view published newsletters" ON newsletters
    FOR SELECT USING (is_public = true AND status = 'published'); 