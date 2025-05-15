-- Create stored procedures for table creation
-- These will be called from the app to ensure tables exist

-- Create admin_users table
CREATE OR REPLACE FUNCTION create_admin_users_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create profiles table
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create app_settings table
CREATE OR REPLACE FUNCTION create_app_settings_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'string',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create advertisements table
CREATE OR REPLACE FUNCTION create_advertisements_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS advertisements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    placement TEXT NOT NULL,
    imageUrl TEXT,
    targetUrl TEXT,
    isActive BOOLEAN DEFAULT true,
    startDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    endDate TIMESTAMP WITH TIME ZONE,
    createdBy TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;