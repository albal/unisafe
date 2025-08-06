-- UniSafe Database Initialization
-- This script creates the database and user for the UniSafe application

-- Create database (if running as postgres superuser)
-- Note: This may not work in Docker environments where the database is already created
-- CREATE DATABASE unisafe;

-- Create user and grant permissions
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'unisafe_user') THEN
      
      CREATE ROLE unisafe_user LOGIN PASSWORD 'unisafe_password';
   END IF;
END
$do$;

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON DATABASE unisafe TO unisafe_user;
GRANT ALL ON SCHEMA public TO unisafe_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO unisafe_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO unisafe_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO unisafe_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO unisafe_user;
