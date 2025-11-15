# ⚡ Quick Start - Campus Event Management System

## 🎯 5-Minute Setup

### 1️⃣ Create Supabase Project
```
1. Go to https://supabase.com
2. Create new project
3. Wait for database initialization
```

### 2️⃣ Run SQL Scripts
```
1. Open Supabase SQL Editor
2. Run database/schema.sql
3. Run database/rls-policies.sql
```

### 3️⃣ Create Storage Bucket
```
1. Go to Storage tab
2. New bucket: "event-posters"
3. Make it PUBLIC ✅
```

### 4️⃣ Configure Frontend
```javascript
// Edit js/supabase.js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 5️⃣ Run Application
```bash
# VS Code: Right-click index.html → Open with Live Server
# OR
python -m http.server 8000
# OR
npx http-server -p 8000
```

---

## 📋 Test Credentials

Create these test accounts:

**Student:**
- Email: student@test.com
- Password: password123
- Role: Student

**Organizer:**
- Email: organizer@test.com
- Password: password123
- Role: Event Organizer

**Faculty:** (Create manually in Supabase)
- Email: faculty@test.com
- Password: password123
- Role: Faculty (via SQL)

---

## 🔑 Key Features

✅ **3 User Roles**: Student, Organizer, Faculty  
✅ **Authentication**: Secure login/signup  
✅ **Event Management**: Create, approve, browse events  
✅ **Registration System**: Students register for events  
✅ **Capacity Tracking**: Auto seat count management  
✅ **File Upload**: Event poster storage  
✅ **Row-Level Security**: Database protection  

---

## 📁 Project Structure

```
CAMPUS-EVENT-MANAGEMENT-SYSTEM/
├── index.html              # Home page
├── login.html              # Login
├── signup.html             # Signup
├── student-dashboard.html  # Student dashboard
├── organizer-dashboard.html# Organizer dashboard
├── faculty-dashboard.html  # Faculty dashboard
├── styles/
│   ├── main.css           # Main styles
│   └── components.css     # Component styles
├── js/
│   ├── supabase.js        # Supabase config
│   ├── auth.js            # Authentication
│   ├── events.js          # Event operations
│   └── dashboard.js       # Dashboard logic
├── database/
│   ├── schema.sql         # Database schema
│   └── rls-policies.sql   # Security policies
├── README.md              # Full documentation
├── SETUP_GUIDE.md         # Detailed setup
└── TESTING.md             # Testing guide
```

---

## 🚀 Workflow

1. **Organizer** creates event → Status: Pending
2. **Faculty** approves event → Status: Approved
3. **Students** browse approved events → Register
4. **Organizer** views registration list

---

## 🐛 Troubleshooting

**Events not loading?**
→ Check Supabase URL and anon key in js/supabase.js

**Can't register?**
→ Ensure RLS policies are enabled

**Upload failed?**
→ Check storage bucket "event-posters" exists and is public

**CORS errors?**
→ Use a dev server, don't open HTML files directly

---

## 📞 Need Help?

1. Check README.md for full documentation
2. Review SETUP_GUIDE.md for detailed steps
3. See TESTING.md for test scenarios
4. Check browser console for errors
5. Review Supabase logs

---

## 🎓 User Guide

### For Students:
1. Sign up → Select "Student" role
2. Browse approved events on home page
3. Click event → "Register Now"
4. View registrations in dashboard

### For Organizers:
1. Sign up → Select "Event Organizer" role
2. Create event with details + poster
3. Wait for faculty approval
4. View registrations for your events

### For Faculty:
1. Login (account created by admin)
2. Review pending events
3. Approve or reject events
4. Monitor all event activity

---

**Built with**: HTML, CSS, JavaScript + Supabase  
**License**: MIT  
**Version**: 1.0.0

---

🎉 **Happy Event Managing!**
