/**
 * DASHBOARD MODULE
 * 
 * Handles dashboard-specific operations for students, organizers, and faculty
 */

import { supabase, uploadFile, getPublicUrl, deleteFile } from './supabase.js';
import { getCurrentUser } from './auth.js';

// ==================== STUDENT DASHBOARD ====================

/**
 * Load student's registered events
 */
export async function loadStudentRegistrations() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return;

        const grid = document.getElementById('registeredEventsGrid');
        const noRegistrations = document.getElementById('noRegistrations');

        grid.innerHTML = '<div class="loading-spinner">Loading your registrations...</div>';

        // Fetch registrations with event details
        const { data: registrations, error } = await supabase
            .from('registrations')
            .select(`
                *,
                event:events(
                    *,
                    organizer:profiles!events_organizer_id_fkey(full_name)
                )
            `)
            .eq('user_id', currentUser.id)
            .order('registered_at', { ascending: false });

        if (error) throw error;

        grid.innerHTML = '';

        if (registrations.length === 0) {
            noRegistrations.style.display = 'block';
            updateStudentStats(0, 0);
            return;
        }

        noRegistrations.style.display = 'none';

        // Count upcoming events (events with future dates)
        const today = new Date();
        const upcomingCount = registrations.filter(reg => 
            new Date(reg.event.event_date) >= today
        ).length;

        updateStudentStats(registrations.length, upcomingCount);

        // Render event cards
        registrations.forEach(reg => {
            const card = createStudentEventCard(reg.event, reg.id);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Load registrations error:', error);
        document.getElementById('registeredEventsGrid').innerHTML = 
            '<div class="error-message">Failed to load registrations</div>';
    }
}

/**
 * Update student dashboard stats
 */
function updateStudentStats(total, upcoming) {
    const totalEl = document.getElementById('totalRegistrations');
    const upcomingEl = document.getElementById('upcomingEvents');
    
    if (totalEl) totalEl.textContent = total;
    if (upcomingEl) upcomingEl.textContent = upcoming;
}

/**
 * Create event card for student dashboard
 */
function createStudentEventCard(event, registrationId) {
    const card = document.createElement('div');
    card.className = 'event-card';

    const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const posterUrl = event.poster_url ? getPublicUrl(event.poster_url) : null;

    card.innerHTML = `
        <div class="event-card-image">
            ${posterUrl ? 
                `<img src="${posterUrl}" alt="${event.title}">` : 
                `<span>📅</span>`
            }
        </div>
        <div class="event-card-content">
            <div class="event-card-header">
                <h3 class="event-card-title">${event.title}</h3>
                <span class="event-category">${event.category || 'General'}</span>
            </div>
            <div class="event-card-body">
                <p class="event-description">${event.description || 'No description'}</p>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <span>📅</span>
                        <span>${eventDate}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>🕐</span>
                        <span>${event.event_time || 'TBA'}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>📍</span>
                        <span>${event.venue || 'TBA'}</span>
                    </div>
                </div>
            </div>
            <div class="event-card-footer">
                <div class="event-actions">
                    <button class="btn btn-danger btn-sm" onclick="window.unregisterFromEvent('${registrationId}')">
                        Cancel Registration
                    </button>
                </div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Unregister from an event
 */
export async function unregisterFromEvent(registrationId) {
    if (!confirm('Are you sure you want to cancel your registration?')) {
        return;
    }

    try {
        // Delete registration
        const { error } = await supabase
            .from('registrations')
            .delete()
            .eq('id', registrationId);

        if (error) throw error;

        alert('Registration cancelled successfully');
        loadStudentRegistrations();

    } catch (error) {
        console.error('Unregister error:', error);
        alert('Failed to cancel registration');
    }
}

// ==================== ORGANIZER DASHBOARD ====================

/**
 * Load organizer's events
 */
export async function loadOrganizerEvents() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return;

        const grid = document.getElementById('myEventsGrid');
        const noEvents = document.getElementById('noEvents');

        grid.innerHTML = '<div class="loading-spinner">Loading your events...</div>';

        // Fetch organizer's events
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .eq('organizer_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        grid.innerHTML = '';

        if (events.length === 0) {
            noEvents.style.display = 'block';
            updateOrganizerStats(0, 0);
            return;
        }

        noEvents.style.display = 'none';

        // Calculate stats
        const approved = events.filter(e => e.status === 'approved').length;

        updateOrganizerStats(events.length, approved);

        // Render event cards
        events.forEach(event => {
            const card = createOrganizerEventCard(event);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Load organizer events error:', error);
        document.getElementById('myEventsGrid').innerHTML = 
            '<div class="error-message">Failed to load events</div>';
    }
}

/**
 * Update organizer dashboard stats
 */
function updateOrganizerStats(total, approved) {
    const totalEl = document.getElementById('totalEvents');
    const approvedEl = document.getElementById('approvedEvents');
    
    if (totalEl) totalEl.textContent = total;
    if (approvedEl) approvedEl.textContent = approved;
}

/**
 * Create event card for organizer dashboard
 */
function createOrganizerEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';

    const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const posterUrl = event.poster_url ? getPublicUrl(event.poster_url) : null;

    const statusClass = `status-${event.status}`;

    card.innerHTML = `
        <div class="event-card-image">
            ${posterUrl ? 
                `<img src="${posterUrl}" alt="${event.title}">` : 
                `<span>📅</span>`
            }
        </div>
        <div class="event-card-content">
            <div class="event-card-header">
                <h3 class="event-card-title">${event.title}</h3>
                <span class="status-badge ${statusClass}">${event.status}</span>
            </div>
            <div class="event-card-body">
                <p class="event-description">${event.description || 'No description'}</p>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <span>📅</span>
                        <span>${eventDate}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>📍</span>
                        <span>${event.venue || 'TBA'}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>👥</span>
                        <span>${event.capacity} capacity</span>
                    </div>
                </div>
            </div>
            <div class="event-card-footer">
                <div class="event-actions">
                    <button class="btn btn-primary btn-sm" onclick="window.viewEventRegistrations('${event.id}')">
                        View Registrations
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.deleteEvent('${event.id}', '${event.poster_url || ''}')">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Create a new event
 */
export async function createEvent(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitEventBtn');
    const formError = document.getElementById('formError');
    const formSuccess = document.getElementById('formSuccess');

    formError.style.display = 'none';
    formSuccess.style.display = 'none';

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error('Not authenticated');

        // Get form data
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const venue = document.getElementById('venue').value.trim();
        const category = document.getElementById('category').value;
        const capacity = parseInt(document.getElementById('capacity').value);
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const posterFile = document.getElementById('poster').files[0];

        // Upload poster if provided
        let posterUrl = null;
        if (posterFile) {
            // Validate file size (max 5MB)
            if (posterFile.size > 5 * 1024 * 1024) {
                throw new Error('Poster image must be less than 5MB');
            }

            posterUrl = await uploadFile(posterFile);
        }

        // Insert event
        const { data, error } = await supabase
            .from('events')
            .insert([
                {
                    title,
                    description,
                    venue,
                    category,
                    max_participants: capacity,
                    event_date: eventDate,
                    event_time: eventTime,
                    poster_url: posterUrl,
                    organizer_id: currentUser.id,
                    status: 'approved'  // Auto-approve events
                }
            ])
            .select()
            .single();

        if (error) throw error;

        formSuccess.textContent = 'Event created successfully! Students can now register.';
        formSuccess.style.display = 'block';

        // Reset form
        document.getElementById('eventForm').reset();

        // Hide form and reload events
        setTimeout(() => {
            document.getElementById('createEventForm').style.display = 'none';
            document.getElementById('toggleFormBtn').textContent = '+ New Event';
            loadOrganizerEvents();
        }, 2000);

    } catch (error) {
        console.error('Create event error:', error);
        formError.textContent = error.message || 'Failed to create event';
        formError.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Event';
    }
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId, posterUrl) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }

    try {
        // Delete event (cascades to registrations)
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) throw error;

        // Delete poster if exists
        if (posterUrl) {
            try {
                await deleteFile(posterUrl);
            } catch (err) {
                console.error('Failed to delete poster:', err);
            }
        }

        alert('Event deleted successfully');
        loadOrganizerEvents();

    } catch (error) {
        console.error('Delete event error:', error);
        alert('Failed to delete event');
    }
}

/**
 * View event registrations
 */
export async function viewEventRegistrations(eventId) {
    try {
        // Fetch registrations for this event
        const { data: registrations, error } = await supabase
            .from('registrations')
            .select(`
                *,
                student:profiles!registrations_user_id_fkey(full_name, role)
            `)
            .eq('event_id', eventId)
            .order('registered_at', { ascending: false });

        if (error) throw error;

        // Get event details
        const { data: event } = await supabase
            .from('events')
            .select('title')
            .eq('id', eventId)
            .single();

        // Show modal with registrations
        showRegistrationsModal(event.title, registrations);

    } catch (error) {
        console.error('View registrations error:', error);
        alert('Failed to load registrations');
    }
}

/**
 * Show registrations modal
 */
function showRegistrationsModal(eventTitle, registrations) {
    const modal = document.getElementById('registrationsModal');
    const modalBody = document.getElementById('registrationsModalBody');

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">Registrations for "${eventTitle}"</h2>
        </div>
        <div class="modal-body">
            ${registrations.length === 0 ? 
                '<p class="info-message">No registrations yet</p>' :
                `
                <p><strong>${registrations.length}</strong> student(s) registered</p>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student Name</th>
                                <th>Registered On</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${registrations.map((reg, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${reg.student?.full_name || 'Unknown'}</td>
                                    <td>${new Date(reg.created_at).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                `
            }
        </div>
    `;

    modal.classList.add('active');

    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = () => modal.classList.remove('active');
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };
}

// ==================== FACULTY DASHBOARD ====================

/**
 * Load events for faculty review
 */
export async function loadFacultyEvents(filter = 'pending') {
    try {
        const grid = document.getElementById('eventsGrid');
        const noEvents = document.getElementById('noEvents');

        grid.innerHTML = '<div class="loading-spinner">Loading events...</div>';

        // Fetch events based on filter
        const { data: events, error } = await supabase
            .from('events')
            .select(`
                *,
                organizer:profiles!events_organizer_id_fkey(full_name)
            `)
            .eq('status', filter)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Update stats
        await updateFacultyStats();

        grid.innerHTML = '';

        if (events.length === 0) {
            noEvents.style.display = 'block';
            return;
        }

        noEvents.style.display = 'none';

        // Render event cards
        events.forEach(event => {
            const card = createFacultyEventCard(event, filter);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Load faculty events error:', error);
        document.getElementById('eventsGrid').innerHTML = 
            '<div class="error-message">Failed to load events</div>';
    }
}

/**
 * Update faculty dashboard stats
 */
async function updateFacultyStats() {
    try {
        // Count events by status
        const { data: allEvents } = await supabase
            .from('events')
            .select('status');

        const pending = allEvents?.filter(e => e.status === 'pending').length || 0;
        const approved = allEvents?.filter(e => e.status === 'approved').length || 0;
        const rejected = allEvents?.filter(e => e.status === 'rejected').length || 0;

        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('approvedCount').textContent = approved;
        document.getElementById('rejectedCount').textContent = rejected;

    } catch (error) {
        console.error('Update stats error:', error);
    }
}

/**
 * Create event card for faculty dashboard
 */
function createFacultyEventCard(event, currentFilter) {
    const card = document.createElement('div');
    card.className = 'event-card';

    const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const posterUrl = event.poster_url ? getPublicUrl(event.poster_url) : null;
    const statusClass = `status-${event.status}`;

    card.innerHTML = `
        <div class="event-card-image">
            ${posterUrl ? 
                `<img src="${posterUrl}" alt="${event.title}">` : 
                `<span>📅</span>`
            }
        </div>
        <div class="event-card-content">
            <div class="event-card-header">
                <h3 class="event-card-title">${event.title}</h3>
                <span class="status-badge ${statusClass}">${event.status}</span>
            </div>
            <div class="event-card-body">
                <p class="event-description">${event.description || 'No description'}</p>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <span>📅</span>
                        <span>${eventDate}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>📍</span>
                        <span>${event.venue || 'TBA'}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>👤</span>
                        <span>By ${event.organizer?.name || 'Unknown'}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>🏷️</span>
                        <span>${event.category || 'General'}</span>
                    </div>
                </div>
            </div>
            <div class="event-card-footer">
                <div class="event-actions">
                    ${currentFilter === 'pending' ? `
                        <button class="btn btn-success btn-sm" onclick="window.approveEvent('${event.id}')">
                            ✓ Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.rejectEvent('${event.id}')">
                            ✗ Reject
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Approve an event
 */
export async function approveEvent(eventId) {
    if (!confirm('Approve this event?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('events')
            .update({ status: 'approved' })
            .eq('id', eventId);

        if (error) throw error;

        alert('Event approved successfully');
        loadFacultyEvents('pending');

    } catch (error) {
        console.error('Approve event error:', error);
        alert('Failed to approve event');
    }
}

/**
 * Reject an event
 */
export async function rejectEvent(eventId) {
    if (!confirm('Reject this event?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('events')
            .update({ status: 'rejected' })
            .eq('id', eventId);

        if (error) throw error;

        alert('Event rejected');
        loadFacultyEvents('pending');

    } catch (error) {
        console.error('Reject event error:', error);
        alert('Failed to reject event');
    }
}

// Make functions available globally
window.unregisterFromEvent = unregisterFromEvent;
window.viewEventRegistrations = viewEventRegistrations;
window.deleteEvent = deleteEvent;
window.approveEvent = approveEvent;
window.rejectEvent = rejectEvent;
