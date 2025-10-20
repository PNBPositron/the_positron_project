-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can insert their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can update their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can delete their own presentations" ON presentations;
DROP POLICY IF EXISTS "Public presentations are viewable by everyone" ON presentations;

-- Create presentations table if it doesn't exist
CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  share_token TEXT UNIQUE,
  is_public BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_share_token ON presentations(share_token);
CREATE INDEX IF NOT EXISTS idx_presentations_is_public ON presentations(is_public);
CREATE INDEX IF NOT EXISTS idx_presentations_created_at ON presentations(created_at DESC);

-- Enable RLS
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own presentations"
  ON presentations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentations"
  ON presentations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations"
  ON presentations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations"
  ON presentations
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public presentations are viewable by everyone"
  ON presentations
  FOR SELECT
  USING (is_public = TRUE);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_presentations_updated_at ON presentations;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON presentations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
