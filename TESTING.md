# 🧪 Testing Guide - Campus Event Management System

This document provides comprehensive testing scenarios to ensure all features work correctly.

---

## 🎯 Test Scenarios

### 1. Authentication Tests

#### Test 1.1: Student Signup
**Steps:**
1. Navigate to signup page
2. Fill form with student role
3. Submit

**Expected:**
- ✅ Success message appears
- ✅ Redirect to login page
- ✅ Profile created in database
- ✅ Role set to 'student'

**Edge Cases:**
- Duplicate email → Should show error
- Weak password → Should show validation error
- Missing fields → Should show required field error

---

#### Test 1.2: Login Flow
**Steps:**
1. Login with valid credentials
2. Check redirect based on role

**Expected:**
- Student → student-dashboard.html
- Organizer → organizer-dashboard.html
- Faculty → faculty-dashboard.html

---

### 2. Student Workflow Tests

#### Test 2.1: Register for Event
**Steps:**
1. Login as student
2. Click event card
3. Click "Register Now"

**Expected:**
- ✅ Registration successful message
- ✅ Event capacity decrements by 1
- ✅ Event appears in student dashboard

**Edge Cases:**
- Event full → "Event is full" error
- Already registered → "Already registered" error

---

### 3. Organizer Workflow Tests

#### Test 3.1: Create Event
**Steps:**
1. Login as organizer
2. Fill create event form
3. Submit

**Expected:**
- ✅ Event created with status 'pending'
- ✅ Event appears in organizer's list

---

### 4. Faculty Workflow Tests

#### Test 4.1: Approve Event
**Steps:**
1. Login as faculty
2. Click "Approve" on pending event

**Expected:**
- ✅ Event status changes to 'approved'
- ✅ Event appears on home page

---

## ✅ Testing Checklist

- [ ] Authentication flows
- [ ] Event creation
- [ ] Event approval
- [ ] Student registration
- [ ] Search and filter
- [ ] File upload
- [ ] Security/RLS policies

---

**Happy Testing! 🧪**
