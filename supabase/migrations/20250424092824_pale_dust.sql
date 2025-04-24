/*
  # Fix users table structure and add phone authentication
  
  1. Changes
    - Drop existing users table
    - Recreate users table with proper UUID structure
    - Add phone authentication support
    - Configure proper constraints
  
  2. Security
    - Enable RLS
    - Add policy for authenticated users
*/

-- Drop existing table
DROP TABLE IF EXISTS users;

-- Create new users table with proper structure
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  username text DEFAULT ''::text,
  phone_number text UNIQUE,
  password varchar,
  CONSTRAINT phone_number_format CHECK (
    phone_number IS NULL OR 
    phone_number ~ '^\+[1-9]\d{1,14}$'
  )
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());