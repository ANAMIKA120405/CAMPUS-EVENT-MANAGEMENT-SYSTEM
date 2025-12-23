# Campus Event Management System

A full-stack web application designed to streamline the management of campus events with role-based access control for Students, Organizers, and Faculty members. The system provides a comprehensive workflow from event creation to student registration, with administrative oversight capabilities.

## Project Overview

The Campus Event Management System is a secure, scalable web application built to handle the complete lifecycle of campus events. It implements a three-tier role-based access system where Organizers can create and manage events, Faculty members can approve or reject event proposals, and Students can browse and register for approved events. The application leverages modern web technologies and cloud infrastructure to provide a responsive, real-time experience across all user roles.

## Core Features (Completed)

### Authentication and Authorization
- Secure user authentication with email/password using Supabase Auth
- Role-based access control with three distinct user types: Student, Organizer, and Faculty
- Automatic profile creation with database triggers
- Session management with Row-Level Security (RLS) policies

### Event Management Workflow
- **Event Creation**: Organizers can create events with comprehensive details including title, description, venue, date, time, category, and capacity
- **Poster Upload**: Support for event poster images stored securely in Supabase Storage
- **Approval System**: Faculty members can review, approve, or reject event submissions with reason tracking
- **Status Tracking**: Real-time event status updates (pending, approved, rejected) visible to all stakeholders

### Student Registration System
- Browse all approved campus events with detailed information
- Register for events with automatic capacity validation
- Duplicate registration prevention using database constraints
- Atomic registration handling to prevent race conditions
- Real-time capacity management with automatic decrements

### Role-Specific Dashboards
- **Student Dashboard**: View approved events, register for events, track registrations
- **Organizer Dashboard**: Create events, view event status, monitor registrations, track pending approvals
- **Faculty Dashboard**: Review pending events, approve or reject submissions, provide feedback

### Data Security and Integrity
- Row-Level Security (RLS) policies ensuring users can only access their authorized data
- Database triggers for automatic profile creation and capacity management
- Foreign key constraints maintaining referential integrity
- Secure file storage with public access control for event posters

### User Experience
- Responsive design compatible with desktop and mobile devices
- Real-time data updates without page refreshes
- Intuitive navigation with role-appropriate menus
- Clear success and error messaging
- Search and filter capabilities for event discovery

## What Works Without Email Notifications

The system is fully functional and production-ready without email support. All critical workflows are handled internally through the application dashboards:

- Students receive immediate confirmation upon successful registration through on-screen alerts
- Organizers can monitor their event status in real-time through the dashboard
- Faculty actions (approvals/rejections) are immediately reflected in organizer dashboards
- Event capacity updates are visible instantly to all users
- Registration status is tracked and accessible through user dashboards

The absence of email notifications does not impact any core functionality. All user interactions and state changes are communicated effectively through the application interface.

## Optional / Future Enhancements

### Email Notification System
Email notifications can be integrated as a modular enhancement to improve user convenience:

- **Registration Confirmations**: Send automated confirmation emails when students successfully register for events, including event details and calendar information
- **Event Status Updates**: Notify organizers when their events are approved or rejected by faculty, with approval reasons included
- **Reminder Notifications**: Send event reminders to registered students 24 hours before the event
- **Capacity Alerts**: Notify organizers when events are nearing or reach capacity

**Implementation Note**: The application architecture supports seamless integration of email functionality through Supabase Edge Functions without requiring changes to the core system. Email services like Resend, SendGrid, or AWS SES can be integrated as needed.

### Additional Future Enhancements
- Event editing and updating capabilities for organizers
- Advanced search and filtering with multiple criteria
- Event categories and tagging system
- QR code generation for event check-ins
- Analytics dashboard for faculty with attendance metrics
- Export functionality for registration lists
- Calendar integration (iCal/Google Calendar)

## Tech Stack

### Frontend
- **HTML5**: Semantic markup for accessibility and SEO
- **CSS3**: Modern styling with flexbox and grid layouts, responsive design
- **JavaScript (ES6+)**: Modular code with ES6 modules, async/await for API calls

### Backend
- **Supabase**: Backend-as-a-Service platform providing multiple services
  - **PostgreSQL Database**: Relational database with custom functions and triggers
  - **Authentication**: Built-in auth service with JWT tokens
  - **Storage**: Object storage for event posters and images
  - **Row-Level Security**: Database-level security policies
  - **Edge Functions**: Serverless functions for future extensibility

### Security
- JWT-based authentication
- Row-Level Security (RLS) policies on all database tables
- Secure password hashing (bcrypt)
- HTTPS-only communication
- Environment variable management for sensitive credentials

### Deployment
- **Vercel**: Serverless deployment platform with automatic HTTPS and global CDN
- **GitHub Integration**: Continuous deployment from repository
- **Custom Domain Support**: Ready for production domain mapping

## System Architecture

### Database Schema
The system uses a normalized PostgreSQL schema with three main tables:

1. **profiles**: Stores user information and role assignments
2. **events**: Contains event details with foreign key to organizers
3. **registrations**: Junction table linking students to events with unique constraints

### Security Model
Multi-layered security approach:
- Application-level authentication checks
- Database-level RLS policies restricting data access by role
- Function-level security for atomic operations
- Storage policies controlling file access

### Modular Design
The application follows a modular architecture where features are loosely coupled:
- Authentication module handles all user-related operations
- Event module manages event CRUD operations
- Dashboard modules are role-specific and independent
- Future features (like email) can be added without modifying existing code

This design ensures maintainability, testability, and extensibility as the system evolves.

## Project Structure

```
CAMPUS-EVENT-MANAGEMENT-SYSTEM/
├── index.html                      # Landing page
├── login.html                      # User login page
├── signup.html                     # User registration page
├── create-event.html               # Event creation form
├── student-dashboard.html          # Student interface
├── organizer-dashboard.html        # Organizer interface
├── faculty-dashboard.html          # Faculty interface
├── styles/
│   ├── main.css                    # Global styles
│   └── components.css              # Component-specific styles
├── js/
│   ├── auth.js                     # Authentication module
│   ├── events.js                   # Event management module
│   ├── dashboard.js                # Dashboard functionality
│   └── supabase.js                 # Supabase client configuration
├── database/
│   ├── schema.sql                  # Database schema
│   ├── rls-policies.sql            # Row-Level Security policies
│   └── triggers.sql                # Database triggers
└── vercel.json                     # Deployment configuration
```

## Setup and Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Supabase account (free tier available)
- Vercel account for deployment (optional)

### Configuration
1. Create a Supabase project and obtain API credentials
2. Run database schema and RLS policy scripts
3. Create storage bucket for event posters
4. Update `js/supabase.js` with your project URL and anon key
5. Deploy to Vercel or serve locally

## Development Notes

This project demonstrates several key software engineering concepts:

- **Separation of Concerns**: Distinct modules for different functionalities
- **Security First**: Multiple layers of security from frontend to database
- **Scalable Architecture**: Designed to handle growth in users and features
- **User-Centric Design**: Role-based interfaces tailored to user needs
- **Production Ready**: Implements best practices for real-world deployment

The codebase is structured for easy understanding and modification, making it suitable for academic evaluation and real-world deployment.

## License

MIT License

## Author

Built by Anamika as a demonstration of full-stack web development capabilities, showcasing proficiency in modern web technologies, database design, authentication systems, and cloud infrastructure.

---

