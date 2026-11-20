const API_BASE = 'http://localhost:5000/api/v1/events';

/**
 * Normalizes backend event record for UI consumption
 */
export function normalizeEvent(e) {
  if (!e) return null;
  const startDate = new Date(e.start_datetime);
  const formattedDate = !isNaN(startDate.getTime())
    ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : e.start_datetime;
  const formattedTime = !isNaN(startDate.getTime())
    ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const spotsRemaining = Math.max(0, (e.capacity || 0) - (e.registration_count || 0));

  return {
    ...e,
    id: e.id,
    title: e.title,
    shortDescription: e.description && e.description.length > 140 
      ? e.description.slice(0, 140) + '...' 
      : e.description,
    description: e.description,
    category: e.category,
    venue: e.venue,
    city: 'Pune Campus',
    date: formattedDate,
    time: formattedTime,
    isoDate: e.start_datetime,
    spotsTotal: e.capacity,
    spotsRemaining,
    price: 'Free Entry',
    poster: e.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    organizer: {
      name: e.organizer_name || 'Campus Club',
      contact: e.organizer_email || 'club@campusconnect.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      verified: true
    },
    tags: [e.category, 'Campus Scene', '2026'],
    statusLabel: e.status
  };
}

/**
 * Event Management API Service
 */
export const eventService = {
  /**
   * Helper to build auth headers
   */
  getHeaders() {
    const token = localStorage.getItem('campus_token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  /**
   * GET /api/v1/events
   * Fetch paginated events with optional filters (search, category, sort, my_events, status)
   */
  async getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.sort) query.set('sort', params.sort);
    if (params.my_events) query.set('my_events', 'true');
    if (params.status) query.set('status', params.status);
    if (params.organizer_id) query.set('organizer_id', params.organizer_id);

    const url = `${API_BASE}${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url, {
      headers: this.getHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch events');
    }

    return {
      events: (data.data.events || []).map(normalizeEvent),
      rawEvents: data.data.events || [],
      pagination: data.data.pagination
    };
  },

  /**
   * GET /api/v1/events/:id
   * Fetch single event details
   */
  async getEventById(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Event not found');
    }

    return normalizeEvent(data.data.event);
  },

  /**
   * POST /api/v1/events
   * Create new event
   */
  async createEvent(eventData) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(eventData)
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to create event');
      err.errors = data.errors;
      throw err;
    }

    return normalizeEvent(data.data.event);
  },

  /**
   * PUT /api/v1/events/:id
   * Edit existing event
   */
  async updateEvent(id, eventData) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(eventData)
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to update event');
      err.errors = data.errors;
      throw err;
    }

    return normalizeEvent(data.data.event);
  },

  /**
   * DELETE /api/v1/events/:id
   * Delete existing event
   */
  async deleteEvent(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete event');
    }

    return data.data;
  },

  /**
   * GET /api/v1/events/:id/registrations
   * Retrieve event registration list
   */
  async getEventRegistrations(id) {
    const res = await fetch(`${API_BASE}/${id}/registrations`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch registrations');
    }

    return data.data;
  },

  /**
   * GET /api/v1/events/stats/organizer
   * Fetch organizer dashboard aggregated metrics
   */
  async getOrganizerStats() {
    const res = await fetch(`${API_BASE}/stats/organizer`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch organizer stats');
    }

    return data.data.stats;
  }
};
