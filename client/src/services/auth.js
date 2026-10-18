const API_BASE = 'http://localhost:5000/api/v1/auth';

/**
 * Client Authentication Service
 * Communicates with the Express backend authentication endpoints
 */
export const authService = {
  /**
   * Register a new student account
   */
  async signup(name, email, password) {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    if (data.data?.token) {
      localStorage.setItem('campus_token', data.data.token);
    }
    return data.data?.user;
  },

  /**
   * Login with email and password
   */
  async login(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }

    if (data.data?.token) {
      localStorage.setItem('campus_token', data.data.token);
    }
    return data.data?.user;
  },

  /**
   * Fetch current authenticated user session
   */
  async getMe() {
    const token = localStorage.getItem('campus_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/me`, {
      headers,
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Session expired');
    }
    return data.data?.user;
  },

  /**
   * Logout session
   */
  async logout() {
    localStorage.removeItem('campus_token');
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
  }
};
