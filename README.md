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

## License

MIT License

## Credits

Built by Anamika with collaborators.
Powered by Supabase and modern web technologies.

---

