-- Initialize OneEvent Database
-- This script creates the database and user for the OneEvent application

-- Create the onevent_user
CREATE USER onevent_user WITH PASSWORD 'onevent_pass';

-- Create the database
CREATE DATABASE one_event_production OWNER onevent_user;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE one_event_production TO onevent_user;

-- Connect to the database and grant schema privileges
\c one_event_production

-- Grant all privileges on the public schema
GRANT ALL ON SCHEMA public TO onevent_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO onevent_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO onevent_user;

-- Allow the user to create tables and other objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO onevent_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO onevent_user;
