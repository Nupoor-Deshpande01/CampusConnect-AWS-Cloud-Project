import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  ArrowUpRight,
  UserCheck,
  Image as ImageIcon
} from 'lucide-react';
import { eventService } from '../services/events';
import { authService } from '../services/auth';

const PRESET_POSTERS = [
  { label: 'AI Hackathon', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Music Concert', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Esports LAN', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Design Lab', url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Startup Pitch', url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80' }
];

export function OrganizerPortal({ currentUser, onLoginSuccess, onEventCreatedOrUpdated }) {
  // Organizer Events & Stats State
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    totalCapacity: 0,
    totalRegistrations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'cancelled'

  // Modals & Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [registrationsModalEvent, setRegistrationsModalEvent] = useState(null);
  const [registrationsData, setRegistrationsData] = useState(null);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Form State (Shared for Create / Edit)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    start_datetime: '',
    end_datetime: '',
    registration_deadline: '',
    capacity: 100,
    poster_url: PRESET_POSTERS[0].url,
    status: 'published'
  });
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Quick switch authentication state for testing
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  const isOrganizerOrAdmin = currentUser && (currentUser.role === 'organizer' || currentUser.role === 'admin');

  // Load organizer dashboard data
  const loadDashboardData = async () => {
    if (!isOrganizerOrAdmin) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch stats
      const statsData = await eventService.getOrganizerStats();
      setStats(statsData);

      // 2. Fetch organizer's events
      const res = await eventService.getEvents({
        page: currentPage,
        limit: 8,
        my_events: true,
        search: searchFilter || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      setEvents(res.events);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load organizer dashboard data:', err);
      setError(err.message || 'Error communicating with event management backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOrganizerOrAdmin) {
      loadDashboardData();
    }
  }, [currentUser, currentPage, statusFilter]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDashboardData();
  };

  // Helper: Open Create Event Form with default upcoming dates
  const openCreateForm = () => {
    const now = new Date();
    // Default start: 7 days from now at 10:00 AM
    const start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    start.setHours(10, 0, 0, 0);
    // Default end: 7 days from now at 18:00 PM
    const end = new Date(start.getTime() + 8 * 60 * 60 * 1000);
    // Default deadline: 6 days from now at 23:59 PM
    const deadline = new Date(start.getTime() - 12 * 60 * 60 * 1000);

    const toLocalISO = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormData({
      title: '',
      description: '',
      category: 'Technical',
      venue: 'Main Campus Quadrangle, Pune',
      start_datetime: toLocalISO(start),
      end_datetime: toLocalISO(end),
      registration_deadline: toLocalISO(deadline),
      capacity: 150,
      poster_url: PRESET_POSTERS[0].url,
      status: 'published'
    });
    setFormErrors([]);
    setShowCreateModal(true);
  };

  // Helper: Open Edit Event Modal
  const openEditModal = (event) => {
    const toLocalISO = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormData({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'Technical',
      venue: event.venue || '',
      start_datetime: toLocalISO(event.start_datetime),
      end_datetime: toLocalISO(event.end_datetime),
      registration_deadline: toLocalISO(event.registration_deadline),
      capacity: event.capacity || 100,
      poster_url: event.poster_url || PRESET_POSTERS[0].url,
      status: event.status || 'published'
    });
    setFormErrors([]);
    setEditingEvent(event);
  };

  // Client-side Form Validation
  const validateForm = () => {
    const errors = [];
    if (!formData.title || formData.title.trim().length < 3) {
      errors.push('Event title must be at least 3 characters.');
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters.');
    }
    if (!formData.venue || formData.venue.trim().length < 2) {
      errors.push('Venue is required.');
    }
    const cap = parseInt(formData.capacity, 10);
    if (isNaN(cap) || cap <= 0) {
      errors.push('Capacity must be a positive integer greater than 0.');
    }

    if (!formData.start_datetime) {
      errors.push('Start date and time is required.');
    }
    if (!formData.end_datetime) {
      errors.push('End date and time is required.');
    }
    if (!formData.registration_deadline) {
      errors.push('Registration deadline is required.');
    }

    if (formData.start_datetime && formData.end_datetime) {
      if (new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
        errors.push('End date and time must be strictly after the start date and time.');
      }
    }

    if (formData.start_datetime && formData.registration_deadline) {
      if (new Date(formData.registration_deadline) > new Date(formData.start_datetime)) {
        errors.push('Registration deadline must be on or before the event start date.');
      }
    }

    return errors;
  };

  // Handle Create Event Submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors([]);

      await eventService.createEvent(formData);
      setShowCreateModal(false);
      await loadDashboardData();
      if (onEventCreatedOrUpdated) onEventCreatedOrUpdated();
    } catch (err) {
      console.error('Failed to create event:', err);
      const serverErrors = err.errors || [err.message];
      setFormErrors(serverErrors);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Event Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors([]);

      await eventService.updateEvent(editingEvent.id, formData);
      setEditingEvent(null);
      await loadDashboardData();
      if (onEventCreatedOrUpdated) onEventCreatedOrUpdated();
    } catch (err) {
      console.error('Failed to update event:', err);
      const serverErrors = err.errors || [err.message];
      setFormErrors(serverErrors);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Event
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    try {
      setSubmitting(true);
      await eventService.deleteEvent(eventToDelete.id);
      setEventToDelete(null);
      await loadDashboardData();
      if (onEventCreatedOrUpdated) onEventCreatedOrUpdated();
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle View Registrations
  const openRegistrationsModal = async (event) => {
    setRegistrationsModalEvent(event);
    setLoadingRegistrations(true);
    setRegistrationsData(null);
    try {
      const data = await eventService.getEventRegistrations(event.id);
      setRegistrationsData(data);
    } catch (err) {
      console.error('Failed to load registrations:', err);
      setRegistrationsData({ error: err.message });
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Quick switch credentials helper for one-click testing
  const handleQuickLogin = async (email, password) => {
    try {
      setQuickLoginLoading(true);
      const user = await authService.login(email, password);
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setQuickLoginLoading(false);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="badge-pill" style={{ backgroundColor: 'rgba(198, 242, 78, 0.15)', color: '#C6F24E', border: '1px solid rgba(198, 242, 78, 0.4)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E', boxShadow: '0 0 8px #C6F24E' }}></span>
            <span>PUBLISHED</span>
          </span>
        );
      case 'draft':
        return (
          <span className="badge-pill" style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', color: '#FFC107', border: '1px solid rgba(255, 193, 7, 0.4)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFC107' }}></span>
            <span>DRAFT</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge-pill" style={{ backgroundColor: 'rgba(255, 77, 77, 0.15)', color: '#FF4D4D', border: '1px solid rgba(255, 77, 77, 0.4)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FF4D4D' }}></span>
            <span>CANCELLED</span>
          </span>
        );
      case 'completed':
        return (
          <span className="badge-pill" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-gray-light)', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-gray-dim)' }}></span>
            <span>COMPLETED</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // If user is not an organizer or admin, display authentication portal with quick login presets
  if (!isOrganizerOrAdmin) {
    return (
      <section style={{ backgroundColor: '#0A0A0A', minHeight: '90vh', paddingTop: '120px', paddingBottom: '6rem' }}>
        <div className="site-container" style={{ maxWidth: '780px', margin: '0 auto' }}>
          
          <div style={{ backgroundColor: '#12141A', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '3rem 2.5rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(198, 242, 78, 0.1)', border: '1px solid #C6F24E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Users size={32} color="#C6F24E" />
            </div>

            <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.3)', marginBottom: '0.85rem' }}>
              <span>ROLE-RESTRICTED PORTAL</span>
            </div>

            <h2 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '0.75rem' }}>
              Organizer & Host Dashboard
            </h2>

            <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
              Event management, ticket inventory, creation, and attendee verification are reserved for authorized campus club organizers and campus admins.
            </p>

            {/* Quick-Access Seeded Organizer Accounts for Immediate Testing */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.75rem', textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Quick Developer & Test Sign-in
                </span>
                <span className="badge-pill badge-pill-lime" style={{ fontSize: '0.68rem' }}>
                  MYSQL SEEDED
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <button
                  disabled={quickLoginLoading}
                  onClick={() => handleQuickLogin('turing@campusconnect.edu', 'organizer123')}
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', height: 'auto' }}
                >
                  <span style={{ fontWeight: 700, color: '#C6F24E', fontSize: '0.85rem' }}>Turing Computer Society</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>turing@campusconnect.edu</span>
                </button>

                <button
                  disabled={quickLoginLoading}
                  onClick={() => handleQuickLogin('beatdrop@campusconnect.edu', 'organizer123')}
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', height: 'auto' }}
                >
                  <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>BeatDrop Music Collective</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>beatdrop@campusconnect.edu</span>
                </button>

                <button
                  disabled={quickLoginLoading}
                  onClick={() => handleQuickLogin('admin@campusconnect.edu', 'admin123')}
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', height: 'auto' }}
                >
                  <span style={{ fontWeight: 700, color: '#FFC107', fontSize: '0.85rem' }}>Campus System Admin</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>admin@campusconnect.edu</span>
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-gray-dim)' }}>
              Currently signed in as: <strong>{currentUser ? `${currentUser.name} (${currentUser.role})` : 'Guest'}</strong>
            </p>
          </div>

        </div>
      </section>
    );
  }

  return (
    <section 
      style={{
        backgroundColor: '#0A0A0A',
        minHeight: '100vh',
        paddingTop: '110px',
        paddingBottom: '6rem',
        position: 'relative'
      }}
    >
      <div className="site-container">

        {/* Dashboard Header Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.4)', marginBottom: '0.6rem', gap: '0.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E', boxShadow: '0 0 8px #C6F24E' }}></span>
              <span style={{ color: '#FFFFFF' }}>AUTHENTICATED AS</span>
              <span style={{ color: '#C6F24E', fontWeight: 700 }}>{currentUser.name} [{currentUser.role.toUpperCase()}]</span>
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              organizer <span className="lime-highlight">control center.</span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              id="host-new-event-btn"
              onClick={openCreateForm}
              className="btn-pill btn-lime"
              style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem' }}
            >
              <PlusCircle size={18} />
              <span>Create Campus Event</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STATS METRIC COUNTERS (Event Counts & Capacity) */}
        {/* ========================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ backgroundColor: '#12141A', padding: '1.4rem 1.5rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', letterSpacing: '0.08em' }}>
              TOTAL EVENTS MANAGED
            </div>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.2rem' }}>
              {stats.totalEvents}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
              All lifetime staged events
            </div>
          </div>

          <div style={{ backgroundColor: '#12141A', padding: '1.4rem 1.5rem', borderRadius: '18px', border: '1px solid rgba(198, 242, 78, 0.25)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#C6F24E', letterSpacing: '0.08em' }}>
              ACTIVE & PUBLISHED
            </div>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#C6F24E', marginTop: '0.2rem' }}>
              {stats.publishedEvents}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
              Visible on public calendar
            </div>
          </div>

          <div style={{ backgroundColor: '#12141A', padding: '1.4rem 1.5rem', borderRadius: '18px', border: '1px solid rgba(255, 193, 7, 0.25)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#FFC107', letterSpacing: '0.08em' }}>
              DRAFTS & PENDING
            </div>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFC107', marginTop: '0.2rem' }}>
              {stats.draftEvents}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
              Hidden from public feeds
            </div>
          </div>

          <div style={{ backgroundColor: '#12141A', padding: '1.4rem 1.5rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', letterSpacing: '0.08em' }}>
              TOTAL CAPACITY POOL
            </div>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.2rem' }}>
              {stats.totalCapacity.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
              Combined campus seats
            </div>
          </div>

          <div style={{ backgroundColor: '#12141A', padding: '1.4rem 1.5rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', letterSpacing: '0.08em' }}>
              CONFIRMED ATTENDEES
            </div>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.2rem' }}>
              {stats.totalRegistrations.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
              Registered student passes
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EVENTS MANAGEMENT TABLE & CONTROLS */}
        {/* ========================================================= */}
        <div style={{ backgroundColor: '#12141A', borderRadius: '22px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Controls Bar: Search & Status Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', marginBottom: '1.75rem' }}>
            
            {/* Status Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', backgroundColor: '#0A0A0A', padding: '0.3rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {[
                { id: 'all', label: 'All Events' },
                { id: 'published', label: 'Published' },
                { id: 'draft', label: 'Drafts' },
                { id: 'cancelled', label: 'Cancelled' }
              ].map(tab => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
                    style={{
                      background: isActive ? '#C6F24E' : 'transparent',
                      color: isActive ? '#0A0A0A' : 'var(--text-gray-light)',
                      border: 'none',
                      padding: '0.45rem 1.1rem',
                      borderRadius: 'var(--radius-pill)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Title Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray-dim)' }} />
                <input
                  type="text"
                  placeholder="Filter by title or venue..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 1rem 0.55rem 2.3rem',
                    backgroundColor: '#0A0A0A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 'var(--radius-pill)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
              <button type="submit" className="btn-pill btn-outline-white" style={{ padding: '0.55rem 1rem', fontSize: '0.8rem' }}>
                Search
              </button>
            </form>

          </div>

          {/* Error Banner */}
          {error && (
            <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.15)', border: '1px solid #FF4D4D', borderRadius: '12px', padding: '1rem', color: '#FF4D4D', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-gray-muted)' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(198, 242, 78, 0.3)', borderTopColor: '#C6F24E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading events from MySQL database...</p>
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', border: '1px dashed rgba(255, 255, 255, 0.12)', borderRadius: '16px' }}>
              <Layers size={40} color="#C6F24E" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h4 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800 }}>No Events Found</h4>
              <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.88rem', marginTop: '0.4rem', maxWidth: '400px', margin: '0.4rem auto 1.5rem auto' }}>
                {searchFilter || statusFilter !== 'all' 
                  ? 'No events match your current filter criteria. Try clearing filters or search terms.' 
                  : 'You have not created any events yet. Click below to host your first campus event.'}
              </p>
              <button onClick={openCreateForm} className="btn-pill btn-lime" style={{ padding: '0.65rem 1.4rem' }}>
                <PlusCircle size={16} />
                <span>Create New Event</span>
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>POSTER & TITLE</th>
                    <th style={{ padding: '0.85rem 1rem' }}>CATEGORY</th>
                    <th style={{ padding: '0.85rem 1rem' }}>DATE & VENUE</th>
                    <th style={{ padding: '0.85rem 1rem' }}>CAPACITY</th>
                    <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(evt => (
                    <tr key={evt.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background-color 0.2s ease' }}>
                      
                      {/* Poster & Title */}
                      <td style={{ padding: '1.1rem 1rem', maxWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={evt.poster || PRESET_POSTERS[0].url}
                            alt={evt.title}
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255, 255, 255, 0.1)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem', lineHeight: 1.25 }}>
                              {evt.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-gray-dim)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                              ID: #{evt.id} • {evt.organizer?.name || 'Club'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '1.1rem 1rem' }}>
                        <span className="badge-pill badge-pill-outline" style={{ fontSize: '0.7rem' }}>
                          {evt.category}
                        </span>
                      </td>

                      {/* Date & Venue */}
                      <td style={{ padding: '1.1rem 1rem' }}>
                        <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{evt.date}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={11} color="#C6F24E" />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{evt.venue}</span>
                        </div>
                      </td>

                      {/* Capacity / Registrations */}
                      <td style={{ padding: '1.1rem 1rem' }}>
                        <div style={{ color: '#C6F24E', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {evt.registration_count || 0} / {evt.capacity}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-gray-dim)' }}>
                          Confirmed
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1.1rem 1rem' }}>
                        {renderStatusBadge(evt.status)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1.1rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                          
                          {/* Registrations List Button */}
                          <button
                            title="View Registrations"
                            onClick={() => openRegistrationsModal(evt)}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#FFFFFF',
                              padding: '0.45rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <UserCheck size={15} />
                          </button>

                          {/* Edit Button */}
                          <button
                            title="Edit Event"
                            onClick={() => openEditModal(evt)}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#C6F24E',
                              padding: '0.45rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Delete Button */}
                          <button
                            title="Delete Event"
                            onClick={() => setEventToDelete(evt)}
                            style={{
                              backgroundColor: 'rgba(255, 77, 77, 0.1)',
                              border: '1px solid rgba(255, 77, 77, 0.25)',
                              color: '#FF4D4D',
                              padding: '0.45rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>
                Page {currentPage} of {totalPages}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', opacity: currentPage <= 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', opacity: currentPage >= totalPages ? 0.4 : 1 }}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* CREATE / EDIT EVENT MODAL */}
        {/* ========================================================= */}
        {(showCreateModal || editingEvent) && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflowY: 'auto'
            }}
          >
            <div 
              style={{
                backgroundColor: '#12141A',
                border: '1px solid rgba(198, 242, 78, 0.35)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '720px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2.25rem',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                position: 'relative'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
                <div>
                  <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.3)', marginBottom: '0.4rem' }}>
                    <span>{editingEvent ? 'UPDATE EVENT' : 'NEW EVENT CREATION'}</span>
                  </div>
                  <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 900 }}>
                    {editingEvent ? `Edit "${editingEvent.title}"` : 'Host a Campus Event'}
                  </h3>
                </div>

                <button
                  onClick={() => { setShowCreateModal(false); setEditingEvent(null); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-gray-light)', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Validation Errors Notice */}
              {formErrors.length > 0 && (
                <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.15)', border: '1px solid #FF4D4D', borderRadius: '12px', padding: '1rem', color: '#FF7777', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <AlertCircle size={16} />
                    <span>Please correct the following:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem' }}>
                    {formErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={editingEvent ? handleEditSubmit : handleCreateSubmit}>
                
                {/* Title & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      EVENT TITLE *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Autonomous Agents Hackathon"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      CATEGORY *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.9rem' }}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Workshops">Workshops</option>
                      <option value="Entrepreneurship">Entrepreneurship</option>
                    </select>
                  </div>
                </div>

                {/* Venue & Capacity */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      VENUE & CAMPUS LOCATION *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS Lab 304, Pune Campus"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      MAX SEAT CAPACITY *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100000"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* Date Controls (Start, End, Registration Deadline) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      START DATE & TIME *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start_datetime}
                      onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      END DATE & TIME *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.end_datetime}
                      onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      RSVP REGISTRATION DEADLINE *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.registration_deadline}
                      onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Poster URL & Quick Presets */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                    POSTER IMAGE URL (OR PICK A PRESET)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.poster_url}
                    onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.85rem', marginBottom: '0.6rem' }}
                  />

                  {/* Preset Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>Presets:</span>
                    {PRESET_POSTERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, poster_url: preset.url })}
                        style={{
                          background: formData.poster_url === preset.url ? '#C6F24E' : 'rgba(255, 255, 255, 0.05)',
                          color: formData.poster_url === preset.url ? '#0A0A0A' : 'var(--text-gray-light)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.72rem',
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Selector */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                    PUBLICATION STATUS
                  </label>
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    {['published', 'draft', ...(editingEvent ? ['cancelled', 'completed'] : [])].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: st })}
                        style={{
                          flex: 1,
                          padding: '0.65rem',
                          borderRadius: '10px',
                          border: formData.status === st ? '2px solid #C6F24E' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: formData.status === st ? 'rgba(198, 242, 78, 0.15)' : '#0A0A0A',
                          color: formData.status === st ? '#C6F24E' : 'var(--text-gray-light)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer'
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description Textarea */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)' }}>
                      DESCRIPTION & AGENDA *
                    </label>
                    <span style={{ fontSize: '0.72rem', color: formData.description.length < 10 ? '#FF7777' : 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>
                      {formData.description.length} chars (min 10)
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide event details, schedule highlights, rules, prizes, or prerequisites for students..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.9rem', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}
                  />
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setEditingEvent(null); }}
                    className="btn-pill btn-outline-white"
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-pill btn-lime"
                    disabled={submitting}
                    style={{ minWidth: '160px', opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting 
                      ? 'Saving...' 
                      : (editingEvent ? 'Save Changes' : (formData.status === 'draft' ? 'Save Draft' : 'Publish Live →'))}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* ========================================================= */}
        {eventToDelete && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 210,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <div 
              style={{
                backgroundColor: '#12141A',
                border: '1px solid rgba(255, 77, 77, 0.4)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '480px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(255, 77, 77, 0.12)', border: '1px solid #FF4D4D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Trash2 size={26} color="#FF4D4D" />
              </div>

              <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.6rem' }}>
                Delete Event?
              </h3>

              <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                Are you sure you want to delete <strong style={{ color: '#FFFFFF' }}>"{eventToDelete.title}"</strong>? This will permanently remove the event and any associated registration records.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setEventToDelete(null)}
                  className="btn-pill btn-outline-white"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleDeleteConfirm}
                  style={{
                    flex: 1,
                    backgroundColor: '#FF4D4D',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.75rem',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* REGISTRATIONS ATTENDEES MODAL */}
        {/* ========================================================= */}
        {registrationsModalEvent && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <div 
              style={{
                backgroundColor: '#12141A',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
                <div>
                  <div className="badge-pill badge-pill-lime" style={{ marginBottom: '0.35rem', fontSize: '0.68rem' }}>
                    ATTENDEE ROSTER
                  </div>
                  <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {registrationsModalEvent.title}
                  </h3>
                </div>

                <button
                  onClick={() => setRegistrationsModalEvent(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-gray-light)', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loadingRegistrations ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-gray-muted)' }}>
                    Loading attendees...
                  </div>
                ) : registrationsData?.error ? (
                  <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255, 77, 77, 0.12)', border: '1px solid #FF4D4D', borderRadius: '12px', color: '#FF7777' }}>
                    {registrationsData.error}
                  </div>
                ) : !registrationsData?.registrations || registrationsData.registrations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', border: '1px dashed rgba(255, 255, 255, 0.12)', borderRadius: '16px' }}>
                    <Users size={36} color="#C6F24E" style={{ opacity: 0.7, marginBottom: '0.85rem' }} />
                    <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>No Student Registrations Yet</h4>
                    <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                      Once students RSVP for this event, their names and verification timestamps will appear here.
                    </p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        <th style={{ padding: '0.65rem 0.85rem' }}>ATTENDEE NAME</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>EMAIL</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>REGISTERED AT</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrationsData.registrations.map(reg => (
                        <tr key={reg.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>{reg.user_name}</td>
                          <td style={{ padding: '0.85rem', color: 'var(--text-gray-light)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{reg.user_email}</td>
                          <td style={{ padding: '0.85rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                            {new Date(reg.registered_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <span className="badge-pill badge-pill-lime" style={{ fontSize: '0.68rem' }}>
                              {reg.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>
                  Total Registrations: {registrationsData?.totalRegistrations || 0} / {registrationsModalEvent.capacity}
                </span>
                <button
                  onClick={() => setRegistrationsModalEvent(null)}
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
