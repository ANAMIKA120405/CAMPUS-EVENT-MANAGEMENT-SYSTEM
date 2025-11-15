# 🚀 SETUP GUIDE - Campus Event Management System

This guide will walk you through setting up the complete Campus Event Management System from scratch.

---

## 📋 Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Supabase account (free tier works fine)
- A local development server (VS Code Live Server, Python, or Node.js)
- Text editor (VS Code recommended)

---

## ⏱️ Estimated Setup Time

- **Supabase Setup**: 10-15 minutes
- **Database Configuration**: 5 minutes
- **Frontend Configuration**: 2 minutes
- **Total**: ~20 minutes

---

## 🎯 Step-by-Step Setup

### STEP 1: Create Supabase Project (5 minutes)

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Click "Start your project"

2. **Create Organization** (if first time)
   - Enter organization name
   - Click "Create organization"

3. **Create New Project**
   - Click "New project"
   - Fill in details:
     - **Name**: `campus-events` (or any name)
     - **Database Password**: Choose a strong password (save it!)
     - **Region**: Select closest to you
   - Click "Create new project"

4. **Wait for Database**
   - Wait 2-3 minutes for database initialization
   - You'll see a green checkmark when ready

---

### STEP 2: Set Up Database Schema (3 minutes)

1. **Open SQL Editor**
   - In Supabase dashboard, click "SQL Editor" in left sidebar
   - Click "+ New query"

2. **Run Schema SQL**
   - Open `database/schema.sql` from your project
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - You should see: "Success. No rows returned"

3. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see 3 tables: `profiles`, `events`, `registrations`

---

### STEP 3: Enable Row-Level Security (2 minutes)

1. **Open New SQL Query**
   - In SQL Editor, click "+ New query" again

2. **Run RLS Policies**
   - Open `database/rls-policies.sql` from your project
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run"
   - You should see: "Success. No rows returned"

3. **Verify RLS Enabled**
   - Go to "Table Editor"
   - Click on "events" table
   - You should see a shield icon indicating RLS is enabled

---

### STEP 4: Create Storage Bucket (2 minutes)

1. **Open Storage**
   - Click "Storage" in left sidebar
   - Click "New bucket"

2. **Create Bucket**
   - **Name**: `event-posters` (exactly this name!)
   - **Public bucket**: ✅ Check this box (IMPORTANT!)
   - Click "Create bucket"

3. **Verify Bucket**
   - You should see "event-posters" in the list
   - It should show "Public" badge

---

### STEP 5: Get API Credentials (1 minute)

1. **Open Project Settings**
   - Click Settings icon (⚙️) in left sidebar
   - Click "API" under Project Settings

2. **Copy Credentials**
   - **Project URL**: Copy this (e.g., `https://xxxxx.supabase.co`)
   - **anon public key**: Copy this (long string starting with `eyJ...`)

   ⚠️ **IMPORTANT**: 
   - Copy the **anon public** key, NOT the service_role key
   - Never share the service_role key publicly
   - The anon key is safe to use in browser code

---

### STEP 6: Configure Frontend (2 minutes)

1. **Open `js/supabase.js`**
   - Find these lines near the top:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

2. **Replace with Your Credentials**
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Your Project URL
   const SUPABASE_ANON_KEY = 'eyJhbGc...'; // Your anon public key
   ```

3. **Save the File**

---

### STEP 7: Run the Application (2 minutes)

#### Option A: Using VS Code Live Server (Recommended)

1. **Install Live Server Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search "Live Server"
   - Install by Ritwick Dey

2. **Start Server**
   - Right-click `index.html`
   - Select "Open with Live Server"
   - Browser opens automatically at `http://127.0.0.1:5500`

#### Option B: Using Python HTTP Server

```bash
# Navigate to project folder
cd CAMPUS-EVENT-MANAGEMENT-SYSTEM

# Start server
python -m http.server 8000
```

Then open: `http://localhost:8000`

#### Option C: Using Node.js HTTP Server

```bash
# Navigate to project folder
cd CAMPUS-EVENT-MANAGEMENT-SYSTEM

# Start server (no install needed)
npx http-server -p 8000
```

Then open: `http://localhost:8000`

---

### STEP 8: Test the Application (5 minutes)

#### Test 1: View Home Page

1. Open `http://localhost:8000` (or your server URL)
2. You should see the home page with:
   - Navigation bar
   - Hero section
   - Search bar
   - Empty events grid (no events yet)

#### Test 2: Create Student Account

1. Click "Sign Up" in navigation
2. Fill in the form:
   - **Name**: Test Student
   - **Email**: student@test.com
   - **Password**: password123
   - **Confirm Password**: password123
   - **Role**: Student
3. Click "Create Account"
4. You should see: "Account created successfully!"
5. You'll be redirected to login page

#### Test 3: Login as Student

1. Enter credentials:
   - **Email**: student@test.com
   - **Password**: password123
2. Click "Login"
3. You should be redirected to Student Dashboard
4. Dashboard shows: 0 registrations, 0 upcoming events

#### Test 4: Create Organizer Account

1. **Logout**: Click "Logout" button
2. Click "Sign Up"
3. Create organizer account:
   - **Name**: Test Organizer
   - **Email**: organizer@test.com
   - **Password**: password123
   - **Role**: Event Organizer
4. Login with organizer credentials

#### Test 5: Create Event

1. In Organizer Dashboard, click "+ New Event"
2. Fill in event details:
   - **Title**: Web Development Workshop
   - **Category**: Technical
   - **Description**: Learn HTML, CSS, and JavaScript
   - **Venue**: Computer Lab 101
   - **Capacity**: 50
   - **Date**: Select future date
   - **Time**: 14:00
   - **Poster**: (optional) Upload an image
3. Click "Create Event"
4. Event appears with status: "pending"

#### Test 6: Create Faculty Account (Manual)

1. **In Supabase Dashboard**:
   - Go to "Authentication" → "Users"
   - Click "Add user" → "Create new user"
   - Email: faculty@test.com
   - Password: password123
   - Click "Create user"

2. **Add Profile**:
   - Go to "SQL Editor"
   - Run this query (replace UUID with the user ID from step 1):
   ```sql
   INSERT INTO public.profiles (id, name, role)
   VALUES ('USER_ID_FROM_AUTH_USERS', 'Test Faculty', 'faculty');
   ```

3. **Login as Faculty**:
   - Logout from organizer account
   - Login with faculty@test.com
   - You should see Faculty Dashboard

#### Test 7: Approve Event

1. In Faculty Dashboard:
   - You should see the pending event
   - Click "✓ Approve" button
   - Event status changes to "approved"

#### Test 8: Student Registration

1. **Logout** and login as student (student@test.com)
2. Click "Home" in navigation
3. You should now see the approved event
4. Click "View Details"
5. Click "Register Now"
6. You should see: "Successfully registered!"
7. Go to "Dashboard"
8. Event appears in "My Registered Events"

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Home page loads without errors
- [ ] Can create student account
- [ ] Can create organizer account
- [ ] Can login and logout
- [ ] Organizer can create events
- [ ] Faculty can approve/reject events
- [ ] Approved events appear on home page
- [ ] Students can register for events
- [ ] Registration appears in student dashboard
- [ ] Organizers can view registration list
- [ ] Poster upload works (if tested)

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to load events"

**Cause**: Incorrect Supabase credentials

**Solution**:
1. Check `js/supabase.js` has correct URL and key
2. Verify you copied the **anon public** key, not service_role
3. Check browser console for specific error
4. Ensure RLS policies are enabled

---

### Issue: "Registration failed"

**Cause**: Missing database function or RLS policy

**Solution**:
1. Re-run `database/schema.sql` in Supabase SQL Editor
2. Re-run `database/rls-policies.sql`
3. Verify `register_student` function exists:
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'register_student';
   ```

---

### Issue: "Upload failed"

**Cause**: Storage bucket not created or not public

**Solution**:
1. Go to Storage in Supabase
2. Ensure bucket named `event-posters` exists
3. Ensure bucket is marked as "Public"
4. Recreate bucket if needed

---

### Issue: CORS errors in console

**Cause**: Opening HTML file directly (file://)

**Solution**:
1. Don't open HTML files directly
2. Use a development server (Live Server, Python, etc.)
3. Access via http://localhost

---

### Issue: "Not authenticated" errors

**Cause**: Session expired or not logged in

**Solution**:
1. Logout and login again
2. Clear browser cache and cookies
3. Check browser console for auth errors

---

### Issue: Faculty can't login

**Cause**: Faculty profile not created

**Solution**:
1. Faculty accounts must be created manually
2. First create auth user in Supabase dashboard
3. Then insert profile with role='faculty'
4. See "Test 6" above for detailed steps

---

## 🔒 Security Notes

### DO:
✅ Use the **anon public** key in frontend code
✅ Enable Row-Level Security on all tables
✅ Keep service_role key secret
✅ Validate user input on frontend
✅ Test RLS policies thoroughly

### DON'T:
❌ Never use service_role key in browser code
❌ Don't disable RLS policies
❌ Don't trust client-side validation alone
❌ Don't store passwords in plain text
❌ Don't commit credentials to version control

---

## 📊 Database Structure Reference

### Tables

1. **profiles**
   - Links to auth.users
   - Stores: name, role
   - Roles: student, organizer, faculty

2. **events**
   - Created by organizers
   - Approved by faculty
   - Fields: title, description, venue, category, date, time, capacity, status, poster_url

3. **registrations**
   - Links students to events
   - Unique constraint: one student per event
   - Auto-decrements event capacity

### Key Functions

- **register_student(event_id, student_id)**
  - Atomic registration
  - Checks capacity
  - Prevents duplicates
  - Decrements capacity

---

## 🎓 Next Steps

After successful setup:

1. **Create More Test Data**
   - Create multiple students
   - Create multiple events
   - Test different scenarios

2. **Customize**
   - Update CSS colors
   - Add your university logo
   - Modify event categories

3. **Deploy**
   - Deploy to Netlify, Vercel, or GitHub Pages
   - Update Supabase URL in production code
   - Test in production environment

4. **Monitor**
   - Check Supabase dashboard for usage
   - Monitor errors in browser console
   - Review RLS policy effectiveness

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Review Supabase logs (Database → Logs)
3. Verify all setup steps completed
4. Test with different browsers
5. Clear cache and try again

---

## 🎉 Congratulations!

You've successfully set up the Campus Event Management System!

**What's Working:**
- ✅ User authentication with role-based access
- ✅ Event creation and approval workflow
- ✅ Student registration system
- ✅ File upload for event posters
- ✅ Real-time updates
- ✅ Secure database with RLS

**Start using the system to manage your campus events!**

---

**Last Updated**: November 2025  
**Version**: 1.0.0
