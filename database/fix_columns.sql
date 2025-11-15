-- =====================================================
-- FIX DATABASE COLUMNS TO MATCH CODE
-- =====================================================
-- Run this ENTIRE script in Supabase SQL Editor to fix all mismatches
-- This will update column names, indexes, and functions

-- 1. Rename 'name' to 'full_name' in profiles table
ALTER TABLE public.profiles 
RENAME COLUMN name TO full_name;

-- 2. Rename 'capacity' to 'max_participants' in events table
ALTER TABLE public.events 
RENAME COLUMN capacity TO max_participants;

-- 3. Rename 'student_id' to 'user_id' in registrations table
ALTER TABLE public.registrations 
RENAME COLUMN student_id TO user_id;

-- 4. Update the unique index name (drop old, create new)
DROP INDEX IF EXISTS registrations_unique_event_student;
CREATE UNIQUE INDEX registrations_unique_event_user 
    ON public.registrations(event_id, user_id);

-- 5. Update the regular index
DROP INDEX IF EXISTS registrations_student_idx;
CREATE INDEX registrations_user_idx ON public.registrations(user_id);

-- 6. Update comments
COMMENT ON COLUMN public.profiles.full_name IS 'Full name of the user';
COMMENT ON COLUMN public.events.max_participants IS 'Maximum number of participants allowed';
COMMENT ON INDEX registrations_unique_event_user IS 'Prevents duplicate registrations per user per event';

-- 7. Update the register_student function to use new column names
CREATE OR REPLACE FUNCTION public.register_student(
    p_event_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_max_participants INT;
    v_reg_id UUID;
    v_event_status TEXT;
BEGIN
    -- Lock the event row for update to prevent race conditions
    SELECT max_participants, status INTO v_max_participants, v_event_status
    FROM public.events
    WHERE id = p_event_id
    FOR UPDATE;

    -- Check if event exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'event_not_found';
    END IF;

    -- Check if event is approved
    IF v_event_status != 'approved' THEN
        RAISE EXCEPTION 'event_not_approved';
    END IF;

    -- Check if event has available capacity
    IF v_max_participants <= 0 THEN
        RAISE EXCEPTION 'event_full';
    END IF;

    -- Check for duplicate registration (using new column name)
    IF EXISTS (
        SELECT 1 
        FROM public.registrations r 
        WHERE r.event_id = p_event_id 
        AND r.user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'duplicate_registration';
    END IF;

    -- Insert registration (using new column name)
    INSERT INTO public.registrations (event_id, user_id)
    VALUES (p_event_id, p_user_id)
    RETURNING id INTO v_reg_id;

    -- Decrement event capacity (using new column name)
    UPDATE public.events 
    SET max_participants = max_participants - 1,
        updated_at = NOW()
    WHERE id = p_event_id;

    RETURN v_reg_id;
END;
$$;

COMMENT ON FUNCTION public.register_student IS 'Atomically registers a user for an event with capacity check';

-- 8. Verify the changes
SELECT 
    'VERIFICATION RESULTS' as info,
    'Check if columns were renamed successfully' as description;

SELECT 
    'profiles table' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name IN ('full_name', 'name')
UNION ALL
SELECT 
    'events table' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'events' 
  AND column_name IN ('max_participants', 'capacity')
UNION ALL
SELECT 
    'registrations table' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'registrations' 
  AND column_name IN ('user_id', 'student_id')
ORDER BY table_name, column_name;
