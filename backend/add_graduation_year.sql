-- Add graduation_year column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- Create index for graduation year
CREATE INDEX IF NOT EXISTS idx_users_graduation_year ON users(graduation_year);