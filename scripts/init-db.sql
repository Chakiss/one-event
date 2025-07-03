-- OneEvent Database Initialization Script
-- This script creates the necessary database and basic setup

-- Database is already created by Docker environment variable
-- POSTGRES_DB=one_event_development

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The application will handle table creation through migrations
-- This file is just for basic database setup
