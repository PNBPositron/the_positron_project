-- Add additional columns to the presentations table for enhanced features

-- First check if the columns already exist
DO $$
BEGIN
    -- Add is_favorite column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'presentations' AND column_name = 'is_favorite') THEN
        ALTER TABLE presentations ADD COLUMN is_favorite BOOLEAN DEFAULT false;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'presentations' AND column_name = 'tags') THEN
        ALTER TABLE presentations ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add folder column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'presentations' AND column_name = 'folder') THEN
        ALTER TABLE presentations ADD COLUMN folder TEXT DEFAULT 'Main';
    END IF;
    
    -- Add thumbnail_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'presentations' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE presentations ADD COLUMN thumbnail_url TEXT;
    END IF;
END
$$;

-- Update RLS policies to include the new columns
DROP POLICY IF EXISTS presentations_select_policy ON presentations;
DROP POLICY IF EXISTS presentations_insert_policy ON presentations;
DROP POLICY IF EXISTS presentations_update_policy ON presentations;
DROP POLICY IF EXISTS presentations_delete_policy ON presentations;

-- Create updated policies
CREATE POLICY presentations_select_policy ON presentations
    FOR SELECT USING (
        auth.uid() = user_id OR is_public = true
    );

CREATE POLICY presentations_insert_policy ON presentations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY presentations_update_policy ON presentations
    FOR UPDATE USING (
        auth.uid() = user_id
    );

CREATE POLICY presentations_delete_policy ON presentations
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS presentations_user_id_idx ON presentations(user_id);
CREATE INDEX IF NOT EXISTS presentations_is_favorite_idx ON presentations(is_favorite);
CREATE INDEX IF NOT EXISTS presentations_folder_idx ON presentations(folder);
