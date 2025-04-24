/*
  # Add trigger for automatic notification preferences

  1. Changes
    - Create trigger function to automatically create notification preferences for new users
    - Add trigger to auth.users table
    - Insert notification preferences for existing users

  2. Security
    - Maintains existing RLS policies
    - No changes to existing security model
*/

-- Function to create notification preferences
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, sms_enabled)
  VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences();

-- Create notification preferences for existing users
INSERT INTO public.notification_preferences (user_id, sms_enabled)
SELECT id, false
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;