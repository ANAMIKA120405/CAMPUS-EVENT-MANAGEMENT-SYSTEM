# Campus Event Management System

A full-stack campus event management system built with **HTML, CSS, JavaScript** (frontend) and **Supabase** (backend).

## 🎓 Features

- **User Authentication**: Email/password authentication with role-based access
- **Three User Roles**: Student, Event Organizer, Faculty Coordinator
- **Event Management**: Create, approve, and browse campus events
- **Student Registration**: Students can register for approved events
- **Capacity Management**: Automatic seat count decrement
- **File Upload**: Event poster upload to Supabase Storage
- **Row-Level Security**: Database protected by RLS policies

---

## 📁 Project Structure

```
CAMPUS-EVENT-MANAGEMENT-SYSTEM/
├── index.html                    # Home page (public event listing)
├── login.html                    # Login page
├── signup.html                   # Signup page
├── student-dashboard.html        # Student dashboard
├── organizer-dashboard.html      # Organizer dashboard
├── faculty-dashboard.html        # Faculty dashboard
├── styles/
│   ├── main.css                  # Main stylesheet
│   └── components.css            # Component styles
├── js/
│   ├── supabase.js               # Supabase client initialization
│   ├── auth.js                   # Authentication logic
│   ├── events.js                 # Event operations
│   └── dashboard.js              # Dashboard logic
├── database/
│   ├── schema.sql                # Database schema
│   └── rls-policies.sql          # Row-level security policies
└── README.md                     # This file
```

---

## 🚀 Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project
5. Wait for the database to initialize

### 2. Set Up Database

#### Step 1: Run Schema SQL

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `database/schema.sql` (provided below)
4. Paste and click "Run"
5. Verify tables are created under **Table Editor**

#### Step 2: Enable Row-Level Security

1. Go to **SQL Editor** again
2. Create another new query
3. Copy the contents of `database/rls-policies.sql` (provided below)
4. Paste and click "Run"

### 3. Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click "New bucket"
3. Name: `event-posters`
4. **Public bucket**: ✅ (check this box)
5. Click "Create bucket"

#### Configure CORS (if needed)

If you're testing locally and encounter CORS issues:

1. In your bucket settings, add allowed origins
2. Add: `http://localhost:3000`, `http://127.0.0.1:5500` (or your local dev server)

### 4. Configure Frontend

#### Update `js/supabase.js`

1. Open `js/supabase.js`
2. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';
```

**Where to find these:**
- Go to **Settings** > **API** in your Supabase dashboard
- Copy **Project URL** → Replace `SUPABASE_URL`
- Copy **anon/public** key → Replace `SUPABASE_ANON_KEY`

### 5. Run the Application

#### Option 1: Using Live Server (VS Code)

1. Install the "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

#### Option 2: Using Python HTTP Server

```bash
python -m http.server 8000
```

Then open: `http://localhost:8000`

#### Option 3: Using Node.js HTTP Server

```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000`

---

## 📊 Database Schema

### Tables

#### 1. `profiles`
- Links to Supabase Auth users
- Stores user name and role

#### 2. `events`
- Stores event information
- Includes status (pending, approved, rejected)
- Has capacity tracking

#### 3. `registrations`
- Links students to events
- Prevents duplicate registrations
- Auto-decrements event capacity

### Server Function

**`register_student(p_event_id, p_student_id)`**
- Atomic registration with capacity check
- Prevents race conditions
- Returns registration ID on success

---

## 🔐 User Roles & Permissions

### Student
- ✅ Browse approved events
- ✅ Register for events
- ✅ View registered events
- ✅ Cancel registrations
- ❌ Cannot create events
- ❌ Cannot approve events

### Event Organizer
- ✅ Create events
- ✅ Upload event posters
- ✅ View their own events
- ✅ View registrations for their events
- ✅ Delete their own events
- ❌ Cannot approve events
- ❌ Cannot register for events

### Faculty Coordinator
- ✅ View all events (pending, approved, rejected)
- ✅ Approve events
- ✅ Reject events
- ❌ Cannot create events
- ❌ Cannot register for events

---

## 🎨 Pages Overview

### Home (`index.html`)
- Public page showing all approved events
- Search and filter functionality
- Event detail modal
- Registration button (for logged-in students)

### Login (`login.html`)
- Email/password authentication
- Auto-redirect to role-based dashboard

### Signup (`signup.html`)
- Create account with name, email, password
- Select role: Student or Organizer
- Faculty accounts created by admins

### Student Dashboard (`student-dashboard.html`)
- View registered events
- Cancel registrations
- Statistics: Total registrations, upcoming events

### Organizer Dashboard (`organizer-dashboard.html`)
- Create new events with poster upload
- View created events
- See registration list for each event
- Delete events
- Statistics: Total events, approved, pending

### Faculty Dashboard (`faculty-dashboard.html`)
- Review pending events
- Approve/Reject events
- View approved and rejected events
- Statistics: Pending, approved, rejected counts

---

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern responsive design with CSS variables
- **JavaScript (ES6+)**: Modular code with ES modules
- **Supabase JS Client**: v2 (loaded via CDN)

### Backend
- **Supabase**: PostgreSQL database
- **Supabase Auth**: User authentication
- **Supabase Storage**: File uploads
- **Row-Level Security**: Database access control

---

## 🔒 Security Features

### Authentication
- Secure password hashing (handled by Supabase Auth)
- Session management
- Auto-logout on token expiration

### Row-Level Security (RLS)
- Students can only view/modify their own registrations
- Organizers can only modify their own events
- Faculty can only update event status
- Public can only read approved events

### Input Validation
- Frontend form validation
- File size limits (5MB for posters)
- SQL injection prevention (Supabase handles this)

---

## 📝 Usage Guide

### For Students

1. **Sign Up**: Create account with student role
2. **Browse Events**: View approved events on home page
3. **Register**: Click "View Details" → "Register Now"
4. **View Registrations**: Check your dashboard
5. **Cancel**: Click "Cancel Registration" if needed

### For Organizers

1. **Sign Up**: Create account with organizer role
2. **Create Event**: Fill form with event details
3. **Upload Poster**: Select image (optional, max 5MB)
4. **Submit**: Wait for faculty approval
5. **View Registrations**: See who registered for your event

### For Faculty

1. **Login**: Use faculty credentials (created by admin)
2. **Review Events**: See pending events
3. **Approve/Reject**: Click action buttons
4. **Track**: View approved/rejected events

---

## 🐛 Troubleshooting

### Issue: "Failed to load events"
- ✅ Check Supabase URL and anon key in `js/supabase.js`
- ✅ Verify RLS policies are enabled
- ✅ Check browser console for errors

### Issue: "Registration failed"
- ✅ Ensure you're logged in as a student
- ✅ Check if event is full
- ✅ Verify you're not already registered

### Issue: "Upload failed"
- ✅ Check file size (must be < 5MB)
- ✅ Verify storage bucket `event-posters` exists
- ✅ Ensure bucket is public

### Issue: CORS errors
- ✅ Add your local dev server to allowed origins in Supabase Storage settings
- ✅ Or use a simple HTTP server instead of opening HTML directly

---

## 🚀 Deployment

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Build settings: Not needed (static site)
4. Deploy!

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy!

### Deploy to GitHub Pages

1. Push code to GitHub
2. Go to Settings > Pages
3. Select branch and folder
4. Save and visit your site!

**Note**: Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` before deploying!

---

## 📈 Future Enhancements

- [ ] Email notifications for event approvals
- [ ] QR code generation for event tickets
- [ ] Event calendar view
- [ ] Advanced search with date range
- [ ] Export registration list to CSV
- [ ] Event analytics dashboard
- [ ] Push notifications for upcoming events
- [ ] Social sharing features
- [ ] Dark mode toggle
- [ ] Multi-language support

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Developer

Built with ❤️ for campus event management

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Supabase documentation
3. Check browser console for errors
4. Verify database schema and RLS policies

---

**Happy Event Managing! 🎉**
