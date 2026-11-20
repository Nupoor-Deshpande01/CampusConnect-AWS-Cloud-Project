import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Ticket, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Trash2,
  Lock
} from 'lucide-react';
import { registrationService } from '../services/registrations';
import { eventService } from '../services/events';

export function EventDetailModal({ 
  event: initialEvent, 
  onClose, 
  currentUser,
  onOpenAuth,
  onRegisterSuccess,
  onCancelSuccess
}) {
  const [event, setEvent] = useState(initialEvent);
  const [isRegistered, setIsRegistered] = useState(Boolean(initialEvent?.is_registered));
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Confirmation state for cancellation
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Fetch fresh real API data for this event on mount
  useEffect(() => {
    if (!initialEvent?.id) return;
    let isMounted = true;

    eventService.getEventById(initialEvent.id)
      .then(freshEvent => {
        if (isMounted && freshEvent) {
          setEvent(freshEvent);
          if (freshEvent.is_registered !== undefined) {
            setIsRegistered(Boolean(freshEvent.is_registered));
          }
        }
      })
      .catch(err => {
        console.log('Using initial event data:', err.message);
      });

    return () => { isMounted = false; };
  }, [initialEvent?.id]);

  if (!event) return null;

  // Determine event timing and deadline constraints
  const now = new Date();
  const startDate = event.start_datetime ? new Date(event.start_datetime) : null;
  const deadlineDate = event.registration_deadline ? new Date(event.registration_deadline) : null;
  const isStarted = startDate && now >= startDate;
  const isDeadlinePassed = deadlineDate && now > deadlineDate;
  const isFull = event.spotsRemaining !== undefined ? event.spotsRemaining <= 0 : false;
  const isStudent = currentUser && currentUser.role === 'student';
  const isOrganizerOrAdmin = currentUser && (currentUser.role === 'organizer' || currentUser.role === 'admin');

  // Handle Event Registration
  const handleRegister = async () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!isStudent) {
      setActionError('Only students are eligible to register for campus events. Organizers and admins cannot register as student attendees.');
      return;
    }

    try {
      setLoading(true);
      setActionError(null);
      setSuccessMessage(null);

      const res = await registrationService.registerForEvent(event.id);
      setIsRegistered(true);
      setSuccessMessage(res.message || `Successfully registered for "${event.title}"!`);

      // Update remaining seats locally
      if (event.spotsRemaining !== undefined) {
        setEvent(prev => ({
          ...prev,
          spotsRemaining: Math.max(0, prev.spotsRemaining - 1),
          registration_count: (prev.registration_count || 0) + 1
        }));
      }

      if (onRegisterSuccess) {
        onRegisterSuccess(event);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setActionError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Event Registration Cancellation
  const handleCancelRegistration = async () => {
    try {
      setLoading(true);
      setActionError(null);
      setSuccessMessage(null);

      const res = await registrationService.cancelRegistration(event.id);
      setIsRegistered(false);
      setShowCancelConfirm(false);
      setSuccessMessage('Your registration has been cancelled and seat released.');

      // Update remaining seats locally
      if (event.spotsRemaining !== undefined) {
        setEvent(prev => ({
          ...prev,
          spotsRemaining: prev.spotsRemaining + 1,
          registration_count: Math.max(0, (prev.registration_count || 1) - 1)
        }));
      }

      if (onCancelSuccess) {
        onCancelSuccess(event);
      }
    } catch (err) {
      console.error('Cancellation failed:', err);
      setActionError(err.message || 'Cancellation failed.');
      setShowCancelConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '92vh',
          backgroundColor: '#12151B',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(198, 242, 78, 0.1)',
          overflowY: 'auto',
          position: 'relative',
          color: '#FFFFFF'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          id="close-event-modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 30,
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(10, 10, 10, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Poster Header */}
        <div style={{ position: 'relative', height: '280px', width: '100%', overflow: 'hidden' }}>
          <img 
            src={event.poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'} 
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.78)' }}
          />

          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #12151B 0%, rgba(18, 21, 27, 0.4) 60%, transparent 100%)'
          }} />

          {/* Badges Overlay */}
          <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            <span className="badge-pill badge-pill-lime">
              {event.category}
            </span>
            <span className="badge-pill badge-pill-dark">
              {event.price || 'Free Entry'}
            </span>
            <span className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.4)', color: '#C6F24E' }}>
              {event.spotsRemaining !== undefined ? `${event.spotsRemaining} SEATS LEFT` : `${event.capacity || 100} SEATS`}
            </span>
            {isRegistered && (
              <span className="badge-pill" style={{ backgroundColor: '#C6F24E', color: '#0A0A0A', fontWeight: 800 }}>
                ✓ YOU ARE REGISTERED
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem' }}>
          
          {/* Event Metadata Strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-gray-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color="#C6F24E" />
              <span>{event.date}</span>
            </div>
            {event.time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} color="#C6F24E" />
                <span>{event.time}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} color="#C6F24E" />
              <span>{event.venue}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-display" style={{ fontSize: '1.85rem', fontWeight: 900, lineHeight: 1.2, color: '#FFFFFF' }}>
            {event.title}
          </h2>

          {/* Organizer Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '1.25rem', padding: '0.85rem 1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(198, 242, 78, 0.1)', border: '1px solid #C6F24E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#C6F24E" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.92rem' }}>
                <span>{event.organizer?.name || event.organizer_name || 'Campus Club'}</span>
                <ShieldCheck size={16} color="#C6F24E" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>
                {event.organizer?.contact || event.organizer_email || 'club@campusconnect.edu'}
              </div>
            </div>
          </div>

          {/* Error & Feedback Banners */}
          {actionError && (
            <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.25rem', backgroundColor: 'rgba(255, 77, 77, 0.15)', border: '1px solid #FF4D4D', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FF7777', fontSize: '0.88rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{actionError}</span>
            </div>
          )}

          {successMessage && (
            <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.25rem', backgroundColor: 'rgba(198, 242, 78, 0.15)', border: '1px solid #C6F24E', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#C6F24E', fontSize: '0.88rem' }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Organizer Notice */}
          {isOrganizerOrAdmin && (
            <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: '10px', fontSize: '0.82rem', color: '#FFC107', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={15} />
              <span>You are signed in as an <strong>{currentUser.role.toUpperCase()}</strong>. Student registrations are reserved for student accounts.</span>
            </div>
          )}

          {/* Event Description */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: '#C6F24E', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              EVENT OVERVIEW
            </h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-gray-muted)', lineHeight: 1.6 }}>
              {event.description}
            </p>
          </div>

          {/* Registration Deadline Notice */}
          {deadlineDate && (
            <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.95rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>RSVP DEADLINE</span>
              <span style={{ color: isDeadlinePassed ? '#FF7777' : '#FFFFFF', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {deadlineDate.toLocaleDateString()} {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isDeadlinePassed ? ' (EXPIRED)' : ''}
              </span>
            </div>
          )}

          {/* Cancellation Confirmation Box */}
          {showCancelConfirm && (
            <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.3)', borderRadius: '14px' }}>
              <div style={{ fontWeight: 700, color: '#FF7777', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                Cancel Event Registration?
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray-light)', marginBottom: '1rem', lineHeight: 1.4 }}>
                Are you sure you want to release your reserved seat for "{event.title}"? Your spot will be made available to other students.
              </p>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  disabled={loading}
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                >
                  Keep Registration
                </button>
                <button
                  disabled={loading}
                  onClick={handleCancelRegistration}
                  style={{
                    backgroundColor: '#FF4D4D',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.45rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Releasing Seat...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          )}

          {/* Capacity & Registration CTA Bar */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)' }}>
                SEATS STATUS
              </div>
              <div className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C6F24E' }}>
                {event.spotsRemaining !== undefined ? `${event.spotsRemaining} seats available / ${event.spotsTotal || event.capacity} total` : `${event.capacity} total capacity`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {isRegistered ? (
                <>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="btn-pill"
                    style={{
                      backgroundColor: 'rgba(255, 77, 77, 0.12)',
                      border: '1px solid rgba(255, 77, 77, 0.3)',
                      color: '#FF7777',
                      padding: '0.75rem 1.4rem'
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Cancel Registration</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-pill btn-lime"
                    style={{ padding: '0.75rem 1.8rem' }}
                  >
                    <span>Done</span>
                  </button>
                </>
              ) : isStarted ? (
                <button
                  disabled
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.75rem 2rem', opacity: 0.5, cursor: 'not-allowed' }}
                >
                  <span>Event Concluded</span>
                </button>
              ) : isDeadlinePassed ? (
                <button
                  disabled
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.75rem 2rem', opacity: 0.5, cursor: 'not-allowed' }}
                >
                  <span>Registration Deadline Passed</span>
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.75rem 2rem', opacity: 0.5, cursor: 'not-allowed' }}
                >
                  <span>Event at Full Capacity</span>
                </button>
              ) : isOrganizerOrAdmin ? (
                <button
                  disabled
                  className="btn-pill btn-outline-white"
                  style={{ padding: '0.75rem 2rem', opacity: 0.5, cursor: 'not-allowed' }}
                >
                  <span>Student Accounts Only</span>
                </button>
              ) : !currentUser ? (
                <button
                  id="register-cta-btn"
                  onClick={handleRegister}
                  className="btn-pill btn-lime"
                  style={{ padding: '0.75rem 2rem' }}
                >
                  <Ticket size={16} />
                  <span>Sign In to Register →</span>
                </button>
              ) : (
                <button
                  id="register-cta-btn"
                  onClick={handleRegister}
                  disabled={loading}
                  className="btn-pill btn-lime"
                  style={{ padding: '0.75rem 2rem', opacity: loading ? 0.7 : 1 }}
                >
                  <Ticket size={16} />
                  <span>{loading ? 'Reserving Seat...' : 'Register for Event →'}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
