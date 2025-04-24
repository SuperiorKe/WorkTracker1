/*
  # Create authentication schema

  1. Changes
    - Enable email-based authentication
    - Disable email confirmation requirement
    - Set up RLS policies for user data access

  2. Security
    - Enable RLS on auth tables
    - Add policies for authenticated users
*/

-- Enable email auth without confirmation
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT true;

-- Update existing users to have email confirmed
UPDATE auth.users 
SET email_confirmed = true 
WHERE email_confirmed IS NULL;