/**
 * EVENTS MODULE
 * 
 * Handles event-related operations: loading, filtering, searching, registration
 */

import { supabase, getPublicUrl } from './supabase.js';
import { getCurrentUser } from './auth.js';

/**
 * Load all approved events and display them
 */
export async function loadEvents() {
    try {
        const eventsGrid = document.getElementById('eventsGrid');
        const noEventsMessage = document.getElementById('noEventsMessage');

        // Show loading state
        eventsGrid.innerHTML = '<div class="loading-spinner">Loading events...</div>';

        // Fetch approved events from Supabase
        const { data: events, error } = await supabase
            .from('events')
            .select(`
                *,
                organizer:profiles!events_organizer_id_fkey(full_name)
            `)
            .eq('status', 'approved')
            .order('event_date', { ascending: true });

        if (error) throw error;

        // Clear loading state
        eventsGrid.innerHTML = '';

        if (events.length === 0) {
            noEventsMessage.style.display = 'block';
            return;
        }

        noEventsMessage.style.display = 'none';

        // Render event cards
        events.forEach(event => {
            const card = createEventCard(event);
            eventsGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Load events error:', error);
        document.getElementById('eventsGrid').innerHTML = 
            '<div class="error-message">Failed to load events. Please try again later.</div>';
    }
}

/**
 * Search and filter events
 * @param {string} searchTerm - Search term to filter by
 * @param {string} category - Category to filter by
 */
export async function searchAndFilterEvents(searchTerm = '', category = '') {
    try {
        const eventsGrid = document.getElementById('eventsGrid');
        const noEventsMessage = document.getElementById('noEventsMessage');

        eventsGrid.innerHTML = '<div class="loading-spinner">Searching...</div>';

        // Build query
        let query = supabase
            .from('events')
            .select(`
                *,
                organizer:profiles!events_organizer_id_fkey(full_name)
            `)
            .eq('status', 'approved');

        // Apply category filter
        if (category) {
            query = query.eq('category', category);
        }

        // Apply search filter (search in title, description, and venue)
        if (searchTerm) {
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,venue.ilike.%${searchTerm}%`);
        }

        query = query.order('event_date', { ascending: true });

        const { data: events, error } = await query;

        if (error) throw error;

        eventsGrid.innerHTML = '';

        if (events.length === 0) {
            noEventsMessage.style.display = 'block';
            return;
        }

        noEventsMessage.style.display = 'none';

        events.forEach(event => {
            const card = createEventCard(event);
            eventsGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Search and filter error:', error);
        document.getElementById('eventsGrid').innerHTML = 
            '<div class="error-message">Search failed. Please try again.</div>';
    }
}

/**
 * Create an event card element
 * @param {Object} event - Event data
 * @returns {HTMLElement} - Event card element
 */
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';

    // Format date and time
    const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const eventTime = event.event_time || 'TBA';

    // Get poster URL or use placeholder
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
                <p class="event-description">${event.description || 'No description available'}</p>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <span>📅</span>
                        <span>${eventDate}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>🕐</span>
                        <span>${eventTime}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>📍</span>
                        <span>${event.venue || 'TBA'}</span>
                    </div>
                    <div class="event-meta-item">
                        <span>👥</span>
                        <span>${event.capacity} seats available</span>
                    </div>
                    <div class="event-meta-item">
                        <span>👤</span>
                        <span>Organized by ${event.organizer?.full_name || 'Unknown'}</span>
                    </div>
                </div>
            </div>
            <div class="event-card-footer">
                <button class="btn btn-primary btn-sm" onclick="window.viewEventDetails('${event.id}')">
                    View Details
                </button>
            </div>
        </div>
    `;

    return card;
}

/**
 * View event details in a modal
 * @param {string} eventId - Event ID
 */
export async function viewEventDetails(eventId) {
    try {
        // Fetch event details
        const { data: event, error } = await supabase
            .from('events')
            .select(`
                *,
                organizer:profiles!events_organizer_id_fkey(full_name)
            `)
            .eq('id', eventId)
            .single();

        if (error) throw error;

        // Get current user to check if already registered
        const currentUser = await getCurrentUser();
        let isRegistered = false;

        if (currentUser && currentUser.profile.role === 'student') {
            const { data: registration } = await supabase
                .from('registrations')
                .select('id')
                .eq('event_id', eventId)
                .eq('student_id', currentUser.id)
                .single();

            isRegistered = !!registration;
        }

        // Show modal with event details
        showEventModal(event, currentUser, isRegistered);

    } catch (error) {
        console.error('View event details error:', error);
        alert('Failed to load event details');
    }
}

/**
 * Show event details in a modal
 * @param {Object} event - Event data
 * @param {Object} currentUser - Current user data
 * @param {boolean} isRegistered - Whether user is already registered
 */
function showEventModal(event, currentUser, isRegistered) {
    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');

    const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const posterUrl = event.poster_url ? getPublicUrl(event.poster_url) : null;

    modalBody.innerHTML = `
        ${posterUrl ? `<img src="${posterUrl}" alt="${event.title}" style="width: 100%; border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">` : ''}
        
        <div class="modal-header">
            <h2 class="modal-title">${event.title}</h2>
            <span class="event-category">${event.category || 'General'}</span>
        </div>
        
        <div class="modal-body">
            <div class="modal-detail">
                <span class="modal-detail-label">Description</span>
                <p class="modal-detail-value">${event.description || 'No description available'}</p>
            </div>
            
            <div class="modal-detail">
                <span class="modal-detail-label">📅 Date</span>
                <p class="modal-detail-value">${eventDate}</p>
            </div>
            
            <div class="modal-detail">
                <span class="modal-detail-label">🕐 Time</span>
                <p class="modal-detail-value">${event.event_time || 'TBA'}</p>
            </div>
            
            <div class="modal-detail">
                <span class="modal-detail-label">📍 Venue</span>
                <p class="modal-detail-value">${event.venue || 'TBA'}</p>
            </div>
            
            <div class="modal-detail">
                <span class="modal-detail-label">👥 Available Seats</span>
                <p class="modal-detail-value">${event.capacity} seats</p>
            </div>
            
            <div class="modal-detail">
                <span class="modal-detail-label">👤 Organizer</span>
                <p class="modal-detail-value">${event.organizer?.full_name || 'Unknown'}</p>
            </div>
        </div>
        
        <div class="modal-footer">
            ${currentUser && currentUser.profile.role === 'student' ? 
                (isRegistered ? 
                    `<button class="btn btn-secondary" disabled>Already Registered ✓</button>` :
                    `<button class="btn btn-primary" onclick="window.registerForEvent('${event.id}')">Register Now</button>`
                ) :
                (currentUser ? 
                    `<p class="info-message">Only students can register for events</p>` :
                    `<a href="login.html" class="btn btn-primary">Login to Register</a>`
                )
            }
        </div>
    `;

    modal.classList.add('active');

    // Close modal on click outside or close button
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = () => modal.classList.remove('active');
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };
}

/**
 * Register for an event
 * @param {string} eventId - Event ID
 */
export async function registerForEvent(eventId) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.profile.role !== 'student') {
            alert('Only students can register for events');
            return;
        }

        // Call the server-side function to register (handles capacity check atomically)
        const { data, error } = await supabase.rpc('register_student', {
            p_event_id: eventId,
            p_user_id: currentUser.id
        });

        if (error) {
            if (error.message.includes('event_full')) {
                alert('Sorry, this event is full!');
            } else if (error.message.includes('duplicate_registration')) {
                alert('You are already registered for this event');
            } else {
                throw error;
            }
            return;
        }

        alert('Successfully registered for the event!');
        
        // Close modal and reload events
        document.getElementById('eventModal').classList.remove('active');
        
        // Reload to show updated capacity
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            loadEvents();
        }

    } catch (error) {
        console.error('Registration error:', error);
        alert('Failed to register for event. Please try again.');
    }
}

// Make functions available globally for inline onclick handlers
window.viewEventDetails = viewEventDetails;
window.registerForEvent = registerForEvent;
