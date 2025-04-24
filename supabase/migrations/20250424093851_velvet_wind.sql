/*
  # Add email confirmation setting

  1. Changes
    - Add email_confirm column to auth.users table
    - Set default value to true for automatic confirmation
*/

ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_confirm BOOLEAN DEFAULT true;

-- Update existing users to have email confirmed
UPDATE auth.users SET email_confirm = true WHERE email_confirm IS NULL;