-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can insert their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can update their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can delete their own presentations" ON presentations;
DROP POLICY IF EXISTS "Anyone can view public presentations" ON presentations;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_presentations_updated_at ON presentations;

-- Create presentations table if it doesn't exist
CREATE TABLE IF NOT EXISTS presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  share_token TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false NOT NULL
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'presentations' AND column_name = 'share_token') THEN
    ALTER TABLE presentations ADD COLUMN share_token TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'presentations' AND column_name = 'is_public') THEN
    ALTER TABLE presentations ADD COLUMN is_public BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_share_token ON presentations(share_token);
CREATE INDEX IF NOT EXISTS idx_presentations_is_public ON presentations(is_public);

-- Enable Row Level Security
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Create policies (fresh, after dropping old ones)
CREATE POLICY "Users can view their own presentations"
  ON presentations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentations"
  ON presentations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations"
  ON presentations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations"
  ON presentations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public presentations"
  ON presentations FOR SELECT
  USING (is_public = true);

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
