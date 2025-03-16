/*
  # Initial Schema Setup for DriveSafe Family

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text) - 'parent' or 'family_member'
      - created_at (timestamp)
      - parent uuid REFERENCES users(id)
    
    - driving_data
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - speed (float)
      - latitude (float)
      - longitude (float)
      - timestamp (timestamp)
    
    - violations
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - type (text) - 'speeding', 'red_light', etc.
      - severity (int)
      - location (point)
      - timestamp (timestamp)
    
    - scores
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - score (float)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('parent', 'family_member')),
  created_at timestamptz DEFAULT now(),
  parent uuid REFERENCES users(id)
);

-- Create driving_data table
CREATE TABLE IF NOT EXISTS driving_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  speed float NOT NULL,
  latitude float NOT NULL,
  longitude float NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create violations table
CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  type text NOT NULL,
  severity int CHECK (severity BETWEEN 1 AND 5),
  location point NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) UNIQUE NOT NULL,
  score float DEFAULT 100.0,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE driving_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own driving data"
  ON driving_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own driving data"
  ON driving_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own violations"
  ON violations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_driving_data_user_id ON driving_data(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_user_id ON violations(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
