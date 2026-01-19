-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Presentation',
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS presentations_user_id_idx ON presentations(user_id);
CREATE INDEX IF NOT EXISTS presentations_created_at_idx ON presentations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can insert their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can update their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can delete their own presentations" ON presentations;

-- Create policies
CREATE POLICY "Users can view their own presentations" ON presentations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentations" ON presentations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations" ON presentations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations" ON presentations
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_presentations_updated_at ON presentations;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_presentations_updated_at 
  BEFORE UPDATE ON presentations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
