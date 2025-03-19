-- Alter the danger_zones table to add new columns
ALTER TABLE danger_zones
ADD COLUMN deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE danger_zones
ADD COLUMN updated_by UUID REFERENCES users(id);

ALTER TABLE danger_zones
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
