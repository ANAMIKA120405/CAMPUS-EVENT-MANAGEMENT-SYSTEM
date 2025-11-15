/**
 * AUTHENTICATION MODULE
 * 
 * Handles user authentication, signup, login, logout, and role-based redirects.
 */

import { supabase } from './supabase.js';

/**
 * Handle user signup
 * Creates a new user account and profile with the specified role
 * 
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} role - User's role (student, organizer, faculty)
 */
export async function handleSignup(name, email, password, role) {
    // Sign up the user with Supabase Auth and metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                role: role
            }
        }
    });

    if (authError) throw authError;

    if (!authData.user) {
        throw new Error('Signup failed. Please try again.');
    }

    // Profile will be automatically created by the trigger function
    // Step 3: Show success message and redirect to login
    alert('Account created successfully! Please login to continue.');
    window.location.href = 'login.html';
}

/**
 * Handle user login
 * Authenticates the user and redirects to appropriate dashboard based on role
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 */
export async function handleLogin(email, password) {
    // Step 1: Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    if (!data.user) {
        throw new Error('Login failed. Please check your credentials.');
    }

    // Step 2: Get user's profile to determine role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch user profile.');
    }

    // Step 3: Redirect based on role
    redirectToDashboard(profile.role);
}

/**
 * Handle user logout
 * Signs out the user and redirects to home page
 */
export async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Redirect to home page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout');
    }
}

/**
 * Check authentication state and update navigation
 * Should be called on every page to update nav links based on auth state
 */
export async function checkAuthState() {
    try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        const loginLink = document.getElementById('loginLink');
        const signupLink = document.getElementById('signupLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const dashboardLink = document.getElementById('dashboardLink');

        if (session) {
            // User is logged in
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', session.user.id)
                .single();

            // Update navigation
            if (loginLink) loginLink.style.display = 'none';
            if (signupLink) signupLink.style.display = 'none';
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.addEventListener('click', handleLogout);
            }

            if (dashboardLink && profile) {
                dashboardLink.style.display = 'block';
                dashboardLink.href = getDashboardUrl(profile.role);
            }

            // Update user name if element exists
            const userNameEl = document.getElementById('userName');
            if (userNameEl && profile) {
                userNameEl.textContent = profile.full_name;
            }

        } else {
            // User is not logged in
            if (loginLink) loginLink.style.display = 'block';
            if (signupLink) signupLink.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (dashboardLink) dashboardLink.style.display = 'none';
        }

    } catch (error) {
        console.error('Auth state check error:', error);
    }
}

/**
 * Check if user is authenticated and has the required role
 * Redirects to login if not authenticated, or to appropriate dashboard if wrong role
 * 
 * @param {string} requiredRole - The role required to access the page
 */
export async function checkAuthAndRole(requiredRole) {
    try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            // Not logged in - redirect to login
            alert('Please login to access this page');
            window.location.href = 'login.html';
            return;
        }

        // Get user profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', session.user.id)
            .single();

        if (error || !profile) {
            alert('Failed to verify user role');
            window.location.href = 'login.html';
            return;
        }

        // Check if user has the required role
        if (profile.role !== requiredRole) {
            alert(`Access denied. This page is for ${requiredRole}s only.`);
            redirectToDashboard(profile.role);
            return;
        }

        // Update user name display
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = profile.full_name;
        }

    } catch (error) {
        console.error('Auth and role check error:', error);
        window.location.href = 'login.html';
    }
}

/**
 * Get dashboard URL based on user role
 * @param {string} role - User's role
 * @returns {string} - Dashboard URL
 */
function getDashboardUrl(role) {
    const dashboardMap = {
        student: 'student-dashboard.html',
        organizer: 'organizer-dashboard.html',
        faculty: 'faculty-dashboard.html',
    };
    return dashboardMap[role] || 'index.html';
}

/**
 * Redirect to appropriate dashboard based on role
 * @param {string} role - User's role
 */
function redirectToDashboard(role) {
    window.location.href = getDashboardUrl(role);
}

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>} - User object with profile data or null
 */
export async function getCurrentUser() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        return {
            ...session.user,
            profile,
        };
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}
