-- Create a type for the plan values
CREATE TYPE plan_type AS ENUM ('BASIC', 'STANDARD', 'FAMILY', 'ENTERPRISE');

ALTER TABLE users
ADD COLUMN plan plan_type DEFAULT 'BASIC';
