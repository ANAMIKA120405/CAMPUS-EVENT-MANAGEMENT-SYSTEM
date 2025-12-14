# Campus Event Management System

A full-stack web application for managing campus events, built using HTML, CSS, JavaScript, and Supabase. The system allows organizers to create events, students to register for them, and faculty to monitor event activity.

## Features

### For Students

- **Browse Events**: View approved campus events with details such as date, venue, and description.
- **Event Registration**: Register for events with automatic capacity checks.
- **My Registrations**: View and cancel registered events.

### For Event Organizers

- **Event Creation**: Create events with title, description, date, time, venue, and capacity.
- **Poster Upload**: Upload event posters using Supabase Storage.
- **Registration View**: View the list of students registered for each event.

### For Faculty

- **Event Monitoring**: View all events across the system.
- **Registration Overview**: Monitor event participation and registrations.

### General

- **Role-Based Access**: Separate dashboards for students, organizers, and faculty.
- **Capacity Management**: Prevents overbooking of events.
- **Secure Authentication**: Uses Supabase Auth and Row-Level Security (RLS).
- **Responsive Design**: Works on desktop and mobile devices.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Authentication**: Supabase Auth
- **Security**: Row-Level Security (RLS)
- **Deployment**: Vercel

## Folder Structure

```
CAMPUS-EVENT-MANAGEMENT-SYSTEM/
├── index.html
├── login.html
├── signup.html
├── student-dashboard.html
├── organizer-dashboard.html
├── faculty-dashboard.html
├── styles/
├── js/
├── database/
└── vercel.json
```

## Known Limitations

- Events are automatically approved upon creation.
- Faculty role is read-only.
- No email notifications.
- Events cannot be edited after creation.

## Project Collaboration

This project was developed as a collaborative effort.

**My contributions include:**

- Implementing authentication and role-based access
- Developing event creation and registration workflows
- Integrating Supabase for database operations and security

## License

MIT License

## Credits

Built by Anamika with collaborators.
Powered by Supabase and modern web technologies.

---

### Step 3: Set Up Database Schema

1. In Supabase dashboard, open **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run** to create tables (profiles, events, registrations)

---

### Step 4: ⚠️ MANDATORY - Run Column Migration

**IMPORTANT:** The application code expects renamed columns. You **must** run this migration:

1. Open **SQL Editor** again
2. Create a new query
3. Copy and paste the contents of `database/fix_columns.sql`
4. Click **Run** to rename columns:
   - `name` → `full_name` (in profiles)
   - `capacity` → `max_participants` (in events)
   - `student_id` → `user_id` (in registrations)

**Without this step, the application will fail to load data.**

---

### Step 5: Enable Row-Level Security

1. Open **SQL Editor** again
2. Create a new query
3. Copy and paste the contents of `database/rls-policies.sql`
4. Click **Run** to enable security policies

---

### Step 6: Create Storage Bucket

1. Navigate to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Bucket name: `event-images` (exactly this name!)
4. Check **Public bucket** ✅
5. Click **Create bucket**

---

### Step 7: Configure Application Credentials

1. Open `js/supabase.js` in your code editor
2. Update these two constants with your Supabase credentials:

```javascript
const SUPABASE_URL = 'https://klrfbrydsfjcvrdzyeyd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscmZicnlkc2ZqY3ZyZHp5ZXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODk1MzksImV4cCI6MjA3ODc2NTUzOX0.tT3dTv5uMtObZDS7WnE5t-V2bJ46sXT8dJuN4Jul9IY';
```

**Where to find these:**
- Supabase Dashboard → **Settings** → **API**
- Use the **Project URL** and **anon public** key (NOT the service_role key)

---

### Step 8: Run the Application Locally

Choose one method:

**Option A: VS Code Live Server (Recommended)**
```bash
# Install Live Server extension in VS Code
# Right-click index.html → "Open with Live Server"
```

**Option B: Python HTTP Server**
```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Option C: Node.js HTTP Server**
```bash
npx http-server -p 8000
# Open http://localhost:8000
```

---

### Step 9: Create Test Accounts

**Student Account:**
1. Navigate to Signup page
2. Fill form with role = "Student"
3. Login and access Student Dashboard

**Organizer Account:**
1. Navigate to Signup page
2. Fill form with role = "Event Organizer"
3. Login and access Organizer Dashboard

**Faculty Account (Manual Creation):**
1. In Supabase Dashboard → **Authentication** → **Users** → **Add user**
2. Create user with email/password
3. In **SQL Editor**, run:
```sql
INSERT INTO public.profiles (id, full_name, role)
VALUES ('USER_ID_FROM_AUTH', 'Faculty Name', 'faculty');
```
(Replace `USER_ID_FROM_AUTH` with the actual UUID from the auth.users table)

---

## 📁 Project Structure

```
CAMPUS-EVENT-MANAGEMENT-SYSTEM/
├── index.html                    # Home page (public event listing)
├── login.html                    # Login page
├── signup.html                   # Signup page with role selection
├── student-dashboard.html        # Student dashboard
├── organizer-dashboard.html      # Organizer dashboard
├── faculty-dashboard.html        # Faculty monitoring dashboard
├── styles/
│   ├── main.css                  # Main styles, layout, variables
│   └── components.css            # Component-specific styles
├── js/
│   ├── supabase.js               # Supabase client & storage helpers
│   ├── auth.js                   # Authentication & role-based routing
│   ├── events.js                 # Event operations & registration
│   └── dashboard.js              # Dashboard logic for all roles
├── database/
│   ├── schema.sql                # Base database schema
│   ├── fix_columns.sql           # MANDATORY migration script
│   └── rls-policies.sql          # Row-Level Security policies
├── assets/
│   └── images/                   # Static images
└── vercel.json                   # Vercel deployment config
```

---

## 🔐 Security Implementation

### Row-Level Security Policies

- **Profiles**: Users can only modify their own profile data
- **Events**: Public can read approved events; organizers manage their own
- **Registrations**: Students manage their own; organizers view their event registrations
- **Faculty**: Can view all data for monitoring purposes

### Additional Security Measures

- Passwords hashed by Supabase Auth (bcrypt)
- Session tokens managed securely
- SQL injection prevention (parameterized queries)
- File upload validation (type and size limits)
- CORS configuration for storage bucket

---

## 🐛 Troubleshooting

### Events not loading
- Verify Supabase URL and anon key in `js/supabase.js`
- Check browser console for specific errors
- Ensure RLS policies were applied successfully
- Confirm migration script (`fix_columns.sql`) was run

### Registration fails
- Verify you're logged in as a student
- Check event capacity hasn't been reached
- Ensure you haven't already registered for this event

### File upload fails
- Verify storage bucket named `event-images` exists
- Ensure bucket is marked as **Public**
- Check file size (must be under 5MB)
- Verify file is an image format

### CORS errors
- Don't open HTML files directly (file://)
- Use a development server (Live Server, Python, or Node.js)
- Verify storage bucket CORS settings in Supabase

---

## ⚠️ Known Limitations

1. **No Email Verification**: Users can sign up without email confirmation (Supabase Auth can be configured to enable this)
2. **Auto-Approval**: Events are automatically approved upon creation; no manual review workflow
3. **Faculty Role**: Currently view-only; cannot approve/reject events
4. **No Notifications**: No email or push notifications for event updates
5. **Single Image Upload**: Events support only one poster image
6. **No Event Editing**: Organizers cannot edit events after creation (only delete)

---

## 🎯 Planned Improvements

These features are **not currently implemented** but are planned for future releases:

- [ ] Manual event approval workflow by faculty
- [ ] Event editing capabilities for organizers
- [ ] Email notifications for event approvals and registrations
- [ ] QR code generation for event check-in
- [ ] Calendar view for events
- [ ] Advanced search with date range filters
- [ ] Export registration lists to CSV
- [ ] Event analytics dashboard for organizers
- [ ] Email verification for new accounts

---

## 🚀 Deployment

This project is configured for deployment on **Vercel**.

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository in Vercel dashboard
3. Vercel will automatically detect `vercel.json` configuration
4. Deploy
5. Update Supabase credentials in deployed code (use environment variables in production)

**Important:** Never commit your actual Supabase credentials. Use environment variables for production deployments.

---

## 📝 Database Schema Reference

### Tables

**profiles**
- `id` (UUID, FK to auth.users)
- `full_name` (TEXT)
- `role` (TEXT: student, organizer, faculty)
- `created_at` (TIMESTAMPTZ)

**events**
- `id` (UUID, PK)
- `title`, `description`, `venue`, `category` (TEXT)
- `event_date` (DATE), `event_time` (TIME)
- `poster_url` (TEXT)
- `organizer_id` (UUID, FK to profiles)
- `status` (TEXT: pending, approved, rejected)
- `max_participants` (INT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**registrations**
- `id` (UUID, PK)
- `event_id` (UUID, FK to events)
- `user_id` (UUID, FK to profiles)
- `created_at` (TIMESTAMPTZ)
- UNIQUE constraint on (event_id, user_id)

### Key Functions

**`register_student(p_event_id, p_user_id)`**
- Atomically registers a student for an event
- Checks capacity and prevents duplicate registrations
- Decrements event capacity on successful registration
- Returns registration ID or throws error

---

## 📄 License

MIT License - Open source and free to use

---

## 🤝 Contributing

This is a portfolio/learning project. Feel free to fork and adapt for your own use cases.

---

## 👨‍💻 Developer

**Built by:** ANAMIKA120405  
**Repository:** [github.com/ANAMIKA120405/CAMPUS-EVENT-MANAGEMENT-SYSTEM](https://github.com/ANAMIKA120405/CAMPUS-EVENT-MANAGEMENT-SYSTEM)

---

**Questions or Issues?** Check browser console for errors, review Supabase logs, and verify all setup steps were completed.
