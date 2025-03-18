-- This migration creates the danger_zones table.
CREATE TABLE danger_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- Assuming GeoJSON format
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE danger_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Danger zones are viewable by everyone." ON danger_zones FOR
SELECT
  USING (TRUE);

CREATE POLICY "Users can insert their own danger zones." ON danger_zones FOR
INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own danger zones." ON danger_zones FOR
UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own danger zones." ON danger_zones FOR DELETE USING (auth.uid() = created_by);
