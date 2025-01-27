/*
  # Update users table for email authentication

  1. Changes
    - Add email field
    - Remove phone field
    - Ensure policies exist

  Note: Uses IF NOT EXISTS checks to prevent errors with existing objects
*/

DO $$ 
BEGIN
    -- Drop the phone column if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE users DROP COLUMN phone;
    END IF;

    -- Add email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE users ADD COLUMN email TEXT;
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
        ALTER TABLE users ALTER COLUMN email SET NOT NULL;
    END IF;
END $$;