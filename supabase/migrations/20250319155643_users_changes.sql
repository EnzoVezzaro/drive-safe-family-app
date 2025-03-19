-- Alter the users table to make role nullable and add new columns
ALTER TABLE users
ALTER COLUMN role DROP NOT NULL;

ALTER TABLE users
ADD COLUMN created_by UUID REFERENCES users(id);

ALTER TABLE users
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE users
ADD COLUMN updated_by UUID REFERENCES users(id);
