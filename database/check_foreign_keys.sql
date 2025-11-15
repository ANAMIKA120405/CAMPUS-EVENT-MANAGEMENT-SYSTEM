-- Check all foreign key constraints in registrations table
SELECT
    con.conname AS constraint_name,
    att.attname AS column_name
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
WHERE rel.relname = 'registrations'
  AND con.contype = 'f'
ORDER BY con.conname;
