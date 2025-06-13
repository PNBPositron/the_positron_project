-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slides JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  thumbnail_url TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);

-- Enable Row Level Security
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can insert their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can update their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can delete their own presentations" ON presentations;
DROP POLICY IF EXISTS "Public presentations are viewable by everyone" ON presentations;

-- Create policies
CREATE POLICY "Users can view their own presentations" 
  ON presentations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentations" 
  ON presentations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations" 
  ON presentations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations" 
  ON presentations FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Public presentations are viewable by everyone" 
  ON presentations FOR SELECT 
  USING (is_public = TRUE);
