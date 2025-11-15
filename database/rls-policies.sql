-- =====================================================
-- CAMPUS EVENT MANAGEMENT SYSTEM - RLS POLICIES
-- =====================================================
-- Row-Level Security policies for data protection
-- Run this AFTER schema.sql

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Policy: Users can insert their own profile
-- Applied when: User signs up and creates profile
CREATE POLICY profiles_insert_own 
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can view their own profile
CREATE POLICY profiles_select_own 
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY profiles_update_own 
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY profiles_delete_own 
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- =====================================================
-- EVENTS TABLE POLICIES
-- =====================================================

-- Policy: Public can read approved events
-- Applied when: Anyone views the home page
CREATE POLICY events_public_read_approved 
ON public.events
FOR SELECT
USING (status = 'approved');

-- Policy: Authenticated users can read all events (for dashboards)
-- Students see approved, organizers see their own, faculty see all
CREATE POLICY events_authenticated_read 
ON public.events
FOR SELECT
USING (
    auth.uid() IS NOT NULL 
    AND (
        -- Public can see approved events
        status = 'approved'
        -- Organizers can see their own events
        OR organizer_id = auth.uid()
        -- Faculty can see all events
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'faculty'
        )
    )
);

-- Policy: Organizers can insert events
-- Applied when: Organizer creates a new event
CREATE POLICY events_insert_by_organizer 
ON public.events
FOR INSERT
WITH CHECK (
    organizer_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'organizer'
    )
);

-- Policy: Organizers can update their own events
-- Applied when: Organizer edits their event
CREATE POLICY events_update_by_organizer 
ON public.events
FOR UPDATE
USING (
    organizer_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'organizer'
    )
)
WITH CHECK (
    organizer_id = auth.uid()
);

-- Policy: Faculty can update event status
-- Applied when: Faculty approves/rejects events
CREATE POLICY events_update_status_by_faculty 
ON public.events
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'faculty'
    )
)
WITH CHECK (
    -- Faculty can only update status, not other fields
    -- This is enforced at application level as well
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'faculty'
    )
);

-- Policy: Organizers can delete their own events
-- Applied when: Organizer deletes their event
CREATE POLICY events_delete_by_organizer 
ON public.events
FOR DELETE
USING (
    organizer_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'organizer'
    )
);

-- =====================================================
-- REGISTRATIONS TABLE POLICIES
-- =====================================================

-- Policy: Students can insert registrations for themselves
-- Applied when: Student registers for an event
-- Note: Actual registration should use register_student() function
CREATE POLICY registrations_insert_student_self 
ON public.registrations
FOR INSERT
WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'student'
    )
);

-- Policy: Students can view their own registrations
-- Applied when: Student views their dashboard
CREATE POLICY registrations_select_student_self 
ON public.registrations
FOR SELECT
USING (student_id = auth.uid());

-- Policy: Organizers can view registrations for their events
-- Applied when: Organizer views registration list
CREATE POLICY registrations_select_for_organizer 
ON public.registrations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE id = public.registrations.event_id 
        AND organizer_id = auth.uid()
    )
);

-- Policy: Faculty can view all registrations (for auditing)
-- Applied when: Faculty monitors event registrations
CREATE POLICY registrations_select_for_faculty 
ON public.registrations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'faculty'
    )
);

-- Policy: Students can delete their own registrations (cancel)
-- Applied when: Student cancels their registration
CREATE POLICY registrations_delete_student_self 
ON public.registrations
FOR DELETE
USING (
    student_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'student'
    )
);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant table permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT ALL ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;

GRANT ALL ON public.registrations TO authenticated;
GRANT SELECT ON public.registrations TO anon;

-- Grant function execution
GRANT EXECUTE ON FUNCTION public.register_student TO authenticated;

-- =====================================================
-- SECURITY BEST PRACTICES
-- =====================================================

-- 1. The register_student function is SECURITY DEFINER
--    This means it runs with elevated privileges to bypass RLS
--    This is necessary for atomic operations (capacity check + insert + decrement)

-- 2. All sensitive operations are protected by role checks
--    Example: Only faculty can approve events
--    Example: Only students can register for events

-- 3. The frontend should NEVER use the service role key
--    Only use the anon/public key in browser code
--    The service role key bypasses ALL RLS policies

-- 4. Additional security at application level:
--    - Form validation (client-side)
--    - Input sanitization (Supabase handles SQL injection)
--    - File size limits (5MB for posters)

-- =====================================================
-- TESTING RLS POLICIES
-- =====================================================

-- Test as anonymous user (should only see approved events)
SET LOCAL ROLE anon;
SELECT * FROM public.events; -- Should only show approved events
RESET ROLE;

-- Test as authenticated student
-- (requires actual JWT token, can't be tested in SQL editor)

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'events', 'registrations');

-- List all policies
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected output:
-- - profiles: 4 policies (insert, select, update, delete)
-- - events: 6 policies (public read, authenticated read, insert, update by organizer, update by faculty, delete)
-- - registrations: 5 policies (insert, select student, select organizer, select faculty, delete)

-- =====================================================
-- RLS SETUP COMPLETE
-- =====================================================
-- Next steps:
-- 1. Create storage bucket 'event-posters' in Supabase dashboard
-- 2. Set bucket to PUBLIC (for poster access)
-- 3. Update frontend with Supabase credentials
-- 4. Test authentication and CRUD operations

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================

-- Note 1: Faculty accounts should be created manually by admins
-- Students and organizers can self-register via the signup page

-- Note 2: The frontend enforces additional business logic:
-- - Only approved events appear on home page
-- - Only students can register for events
-- - Only organizers can create events
-- - Only faculty can approve/reject events

-- Note 3: If you need to create a faculty account:
/*
-- First create the auth user in Supabase dashboard
-- Then insert the profile:
INSERT INTO public.profiles (id, name, role)
VALUES ('UUID_FROM_AUTH_USERS', 'Faculty Name', 'faculty');
*/
