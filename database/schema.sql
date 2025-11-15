-- =====================================================
-- CAMPUS EVENT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- This script creates all necessary tables, indexes, and functions
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: profiles
-- =====================================================
-- Stores user profile information and roles
-- Links to auth.users via foreign key

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'organizer', 'faculty')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profile information with role assignment';
COMMENT ON COLUMN public.profiles.role IS 'User role: student, organizer, or faculty';

-- =====================================================
-- TABLE: events
-- =====================================================
-- Stores campus event information

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    category TEXT,
    event_date DATE,
    event_time TIME,
    poster_url TEXT,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    capacity INT NOT NULL DEFAULT 0 CHECK (capacity >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);
CREATE INDEX IF NOT EXISTS events_date_idx ON public.events(event_date);
CREATE INDEX IF NOT EXISTS events_organizer_idx ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);

-- Add comments
COMMENT ON TABLE public.events IS 'Campus events created by organizers';
COMMENT ON COLUMN public.events.status IS 'Event approval status: pending, approved, or rejected';
COMMENT ON COLUMN public.events.capacity IS 'Maximum number of attendees, decrements on registration';

-- =====================================================
-- TABLE: registrations
-- =====================================================
-- Stores student event registrations

CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure a student can only register once per event
CREATE UNIQUE INDEX IF NOT EXISTS registrations_unique_event_student 
    ON public.registrations(event_id, student_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS registrations_event_idx ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS registrations_student_idx ON public.registrations(student_id);

-- Add comments
COMMENT ON TABLE public.registrations IS 'Student registrations for events';
COMMENT ON INDEX registrations_unique_event_student IS 'Prevents duplicate registrations';

-- =====================================================
-- FUNCTION: register_student
-- =====================================================
-- Atomically registers a student for an event
-- Checks capacity, prevents duplicates, decrements capacity

CREATE OR REPLACE FUNCTION public.register_student(
    p_event_id UUID,
    p_student_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_capacity INT;
    v_reg_id UUID;
    v_event_status TEXT;
BEGIN
    -- Lock the event row for update to prevent race conditions
    SELECT capacity, status INTO v_capacity, v_event_status
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
    IF v_capacity <= 0 THEN
        RAISE EXCEPTION 'event_full';
    END IF;

    -- Check for duplicate registration
    IF EXISTS (
        SELECT 1 
        FROM public.registrations r 
        WHERE r.event_id = p_event_id 
        AND r.student_id = p_student_id
    ) THEN
        RAISE EXCEPTION 'duplicate_registration';
    END IF;

    -- Insert registration
    INSERT INTO public.registrations (event_id, student_id)
    VALUES (p_event_id, p_student_id)
    RETURNING id INTO v_reg_id;

    -- Decrement event capacity
    UPDATE public.events 
    SET capacity = capacity - 1,
        updated_at = NOW()
    WHERE id = p_event_id;

    RETURN v_reg_id;
END;
$$;

COMMENT ON FUNCTION public.register_student IS 'Atomically registers a student for an event with capacity check';

-- =====================================================
-- TRIGGER: update_updated_at
-- =====================================================
-- Automatically updates the updated_at timestamp

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- TRIGGER: increment_capacity_on_unregister
-- =====================================================
-- Automatically increments capacity when a registration is deleted

CREATE OR REPLACE FUNCTION public.increment_capacity_on_unregister()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.events
    SET capacity = capacity + 1,
        updated_at = NOW()
    WHERE id = OLD.event_id;
    
    RETURN OLD;
END;
$$;

CREATE TRIGGER registrations_deleted
    AFTER DELETE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_capacity_on_unregister();

COMMENT ON FUNCTION public.increment_capacity_on_unregister IS 'Automatically increments event capacity when registration is cancelled';

-- =====================================================
-- SEED DATA (Optional)
-- =====================================================
-- Uncomment to add sample data for testing

/*
-- Note: You must create auth users first, then insert profiles
-- Example profiles (replace UUIDs with actual auth.users IDs)

INSERT INTO public.profiles (id, name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Alice Student', 'student'),
('22222222-2222-2222-2222-222222222222', 'Bob Organizer', 'organizer'),
('33333333-3333-3333-3333-333333333333', 'Prof. Charlie Faculty', 'faculty')
ON CONFLICT (id) DO NOTHING;

-- Example events
INSERT INTO public.events (title, description, venue, category, event_date, event_time, organizer_id, status, capacity) VALUES
('Tech Workshop 2025', 'Learn web development basics', 'Lab 101', 'technical', '2025-12-01', '14:00', '22222222-2222-2222-2222-222222222222', 'approved', 50),
('Cultural Fest', 'Annual cultural celebration', 'Main Auditorium', 'cultural', '2025-12-15', '18:00', '22222222-2222-2222-2222-222222222222', 'pending', 200);
*/

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify setup

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'events', 'registrations');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'events', 'registrations');

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('register_student', 'update_updated_at', 'increment_capacity_on_unregister');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run the RLS policies script (rls-policies.sql)
-- 2. Create storage bucket 'event-posters' in Supabase dashboard
-- 3. Update frontend with your Supabase URL and anon key
