-- =====================================================
-- VERIFY DATABASE COLUMNS
-- =====================================================
-- Run this to check which columns actually exist in your database

SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'events', 'registrations')
ORDER BY table_name, ordinal_position;
