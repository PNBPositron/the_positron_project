-- Add columns for sharing functionality
ALTER TABLE presentations 
ADD COLUMN IF NOT EXISTS share_token UUID,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster lookups by share token
CREATE INDEX IF NOT EXISTS idx_presentations_share_token ON presentations(share_token) WHERE share_token IS NOT NULL;

-- Create index for public presentations
CREATE INDEX IF NOT EXISTS idx_presentations_public ON presentations(is_public) WHERE is_public = TRUE;

-- Update existing records to have updated_at timestamp
UPDATE presentations SET updated_at = created_at WHERE updated_at IS NULL;
