const API_BASE = 'http://localhost:5000/api/v1';

/**
 * Registration API Service
 * Handles student event registration, cancellation, and registration roster queries
 */
export const registrationService = {
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
   * Register authenticated student for an event
   * POST /api/v1/events/:id/register
   */
  async registerForEvent(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed.');
    }

    return data.data;
  },

  /**
   * Cancel authenticated student's registration
   * DELETE /api/v1/events/:id/register
   */
  async cancelRegistration(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Cancellation failed.');
    }

    return data.data;
  },

  /**
   * Fetch authenticated student's registrations and summary
   * GET /api/v1/registrations/me
   */
  async getMyRegistrations() {
    const res = await fetch(`${API_BASE}/registrations/me`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch your registrations.');
    }

    return data.data;
  }
};
