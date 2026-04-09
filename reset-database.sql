-- Reset Database Script
-- This will drop and recreate the database with a clean schema

-- Disconnect all users from the database
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'tasks_db' AND pid <> pg_backend_pid();

-- Drop the database
DROP DATABASE IF EXISTS tasks_db;

-- Recreate the database
CREATE DATABASE tasks_db;

-- Connect to the new database
\c tasks_db;

-- The tables will be automatically created by TypeORM synchronize
