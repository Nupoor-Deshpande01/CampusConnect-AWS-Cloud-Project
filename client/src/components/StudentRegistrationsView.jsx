import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  Trash2, 
  Compass, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { registrationService } from '../services/registrations';

export function StudentRegistrationsView({ 
  currentUser, 
  onExploreEvents, 
  onOpenAuth,
  onRegistrationUpdated 
}) {
  const [registrations, setRegistrations] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'completed' | 'cancelled'

  // Cancellation Confirmation Modal State
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Digital QR Pass Modal State
  const [qrPassItem, setQrPassItem] = useState(null);

  const fetchRegistrations = async () => {
    if (!currentUser || currentUser.role !== 'student') return;
    try {
      setLoading(true);
      setError(null);
      const data = await registrationService.getMyRegistrations();
      setRegistrations(data.registrations || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load student registrations:', err);
      setError(err.message || 'Failed to retrieve your registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [currentUser]);

  // Handle Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    try {
      setCancelling(true);
      setCancelError(null);
      await registrationService.cancelRegistration(cancelModalItem.event_id);
      setCancelModalItem(null);
      await fetchRegistrations();
      if (onRegistrationUpdated) {
        onRegistrationUpdated(cancelModalItem);
      }
    } catch (err) {
      console.error('Cancellation failed:', err);
      setCancelError(err.message || 'Failed to cancel registration.');
    } finally {
      setCancelling(false);
    }
  };

  // Filter registrations by tab
  const filteredRegistrations = registrations.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return item.timeline_status === 'upcoming';
    if (activeTab === 'completed') return item.timeline_status === 'completed';
    if (activeTab === 'cancelled') return item.timeline_status === 'cancelled';
    return true;
  });

  // If user is not authenticated as a student
  if (!currentUser || currentUser.role !== 'student') {
    return (
      <section style={{ backgroundColor: '#0A0A0A', minHeight: '90vh', paddingTop: '120px', paddingBottom: '6rem' }}>
        <div className="site-container" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#12141A', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '3.5rem 2.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(198, 242, 78, 0.1)', border: '1px solid #C6F24E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Ticket size={32} color="#C6F24E" />
            </div>

            <div className="badge-pill badge-pill-lime" style={{ marginBottom: '1rem', fontSize: '0.72rem' }}>
              STUDENT PASS HUB
            </div>

            <h2 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '0.75rem' }}>
              Your Campus Event Passes
            </h2>

            <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              {currentUser 
                ? `You are currently signed in as an ${currentUser.role.toUpperCase()}. The attendee passes hub is reserved for student accounts.`
                : 'Sign in to access your digital QR event passes, manage active registrations, and check in at campus venues.'}
            </p>

            {currentUser ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
                <button onClick={onExploreEvents} className="btn-pill btn-lime">
                  <span>Explore Campus Events</span>
                </button>
              </div>
            ) : (
              <button onClick={onOpenAuth} className="btn-pill btn-lime" style={{ padding: '0.75rem 2rem' }}>
                <span>Sign In to Access Passes</span>
                <ArrowRight size={16} />
              </button>
            )}
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

        {/* Header Strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.4)', marginBottom: '0.6rem', gap: '0.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E', boxShadow: '0 0 8px #C6F24E' }}></span>
              <span>VERIFIED STUDENT ACCOUNT</span>
              <span style={{ color: '#C6F24E', fontWeight: 700 }}>{currentUser.name}</span>
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              my event <span className="lime-highlight">passes.</span>
            </h1>
          </div>

          <button
            onClick={onExploreEvents}
            className="btn-pill btn-lime"
            style={{ padding: '0.75rem 1.6rem', fontSize: '0.88rem' }}
          >
            <Compass size={17} />
            <span>Discover More Events</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* SUMMARY STATS COUNTERS */}
        {/* ========================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ backgroundColor: '#12141A', padding: '1.4rem 1.5rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', letterSpacing: '0.08em' }}>
              TOTAL PASSES HELD
            </div>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.2rem' }}>
              {summary.total}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
              All-time registration history
            </div>
          </div>

          <div style={{ backgroundColor: '#12141A', padding: '1.4rem 1.5rem', borderRadius: '18px', border: '1px solid rgba(198, 242, 78, 0.3)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#C6F24E', letterSpacing: '0.08em' }}>
              UPCOMING EVENTS
            </div>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#C6F24E', marginTop: '0.2rem' }}>
              {summary.upcoming}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
              Active spots reserved
            </div>
          </div>

          <div style={{ backgroundColor: '#12141A', padding: '1.4rem 1.5rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', letterSpacing: '0.08em' }}>
              PAST & ATTENDED
            </div>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.2rem' }}>
              {summary.completed}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
              Concluded campus sessions
            </div>
          </div>

          <div style={{ backgroundColor: '#12141A', padding: '1.4rem 1.5rem', borderRadius: '18px', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#FF7777', letterSpacing: '0.08em' }}>
              CANCELLED PASSES
            </div>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FF7777', marginTop: '0.2rem' }}>
              {summary.cancelled}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
              Seats released
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* REGISTRATION TABS & CARDS LIST */}
        {/* ========================================================= */}
        <div style={{ backgroundColor: '#12141A', borderRadius: '22px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem' }}>
          
          {/* Tabs Filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
            {[
              { id: 'all', label: 'All History', count: summary.total },
              { id: 'upcoming', label: 'Upcoming Passes', count: summary.upcoming },
              { id: 'completed', label: 'Past & Completed', count: summary.completed },
              { id: 'cancelled', label: 'Cancelled', count: summary.cancelled }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: isActive ? '#C6F24E' : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? '#0A0A0A' : 'var(--text-gray-light)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius-pill)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{ 
                    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
                    padding: '0.1rem 0.45rem', 
                    borderRadius: '10px', 
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)' 
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.15)', border: '1px solid #FF4D4D', borderRadius: '12px', padding: '1rem', color: '#FF7777', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Registrations List */}
          {loading ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-gray-muted)' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(198, 242, 78, 0.3)', borderTopColor: '#C6F24E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Fetching student passes from MySQL...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', border: '1px dashed rgba(255, 255, 255, 0.12)', borderRadius: '16px' }}>
              <Ticket size={40} color="#C6F24E" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h4 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800 }}>No Passes in this Section</h4>
              <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.88rem', marginTop: '0.4rem', maxWidth: '420px', margin: '0.4rem auto 1.5rem auto' }}>
                {activeTab === 'upcoming' 
                  ? 'You do not have any upcoming event passes. Explore the campus calendar to reserve your spot.'
                  : 'No event registrations match this filter category.'}
              </p>
              <button onClick={onExploreEvents} className="btn-pill btn-lime" style={{ padding: '0.65rem 1.4rem' }}>
                <span>Explore Upcoming Events</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {filteredRegistrations.map(reg => {
                const startDate = new Date(reg.start_datetime);
                const formattedDate = !isNaN(startDate.getTime())
                  ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : reg.start_datetime;
                const formattedTime = !isNaN(startDate.getTime())
                  ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                const isUpcoming = reg.timeline_status === 'upcoming';
                const isCompleted = reg.timeline_status === 'completed';
                const isCancelled = reg.timeline_status === 'cancelled';

                return (
                  <div
                    key={reg.registration_id}
                    style={{
                      backgroundColor: '#161922',
                      borderRadius: '18px',
                      border: isUpcoming ? '1px solid rgba(198, 242, 78, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: isUpcoming ? '0 10px 25px rgba(0, 0, 0, 0.4)' : 'none',
                      transition: 'transform 0.2s ease, border-color 0.2s ease'
                    }}
                  >
                    {/* Card Header & Poster */}
                    <div style={{ position: 'relative', height: '140px', width: '100%', overflow: 'hidden' }}>
                      <img
                        src={reg.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                        alt={reg.event_title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isCancelled ? 'grayscale(80%) brightness(0.6)' : 'brightness(0.8)' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #161922 0%, rgba(22, 25, 34, 0.3) 100%)' }} />

                      {/* Status Badge */}
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        {isUpcoming && (
                          <span className="badge-pill" style={{ backgroundColor: 'rgba(198, 242, 78, 0.2)', color: '#C6F24E', border: '1px solid #C6F24E', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E', boxShadow: '0 0 6px #C6F24E' }}></span>
                            <span>UPCOMING PASS</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="badge-pill" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-gray-light)', fontSize: '0.72rem' }}>
                            COMPLETED
                          </span>
                        )}
                        {isCancelled && (
                          <span className="badge-pill" style={{ backgroundColor: 'rgba(255, 77, 77, 0.2)', color: '#FF7777', border: '1px solid #FF4D4D', fontSize: '0.72rem' }}>
                            CANCELLED
                          </span>
                        )}
                      </div>

                      {/* Category */}
                      <div style={{ position: 'absolute', bottom: '12px', left: '14px' }}>
                        <span className="badge-pill badge-pill-dark" style={{ fontSize: '0.68rem' }}>
                          {reg.event_category}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: isCancelled ? 'var(--text-gray-dim)' : '#FFFFFF', lineHeight: 1.3 }}>
                          {reg.event_title}
                        </h3>

                        {/* Event Details */}
                        <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-gray-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Calendar size={13} color="#C6F24E" />
                            <span>{formattedDate} • {formattedTime}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <MapPin size={13} color="#C6F24E" />
                            <span>{reg.event_venue}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <ShieldCheck size={13} color="#C6F24E" />
                            <span>Organized by {reg.organizer_name}</span>
                          </div>
                        </div>

                        {/* Ticket Code Tag */}
                        <div style={{ marginTop: '1rem', padding: '0.55rem 0.85rem', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>
                            PASS ID: #CC-{reg.registration_id}-{reg.event_id}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: isCancelled ? '#FF7777' : '#C6F24E', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {reg.registration_status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.65rem' }}>
                        
                        {/* Digital QR Pass Button */}
                        <button
                          onClick={() => setQrPassItem(reg)}
                          className="btn-pill btn-outline-white"
                          style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <QrCode size={14} />
                          <span>Show QR</span>
                        </button>

                        {/* Cancel Pass Action (Only allowed before event start) */}
                        {isUpcoming && (
                          <button
                            id={`cancel-reg-btn-${reg.event_id}`}
                            onClick={() => { setCancelModalItem(reg); setCancelError(null); }}
                            style={{
                              backgroundColor: 'rgba(255, 77, 77, 0.1)',
                              border: '1px solid rgba(255, 77, 77, 0.25)',
                              color: '#FF7777',
                              padding: '0.45rem 0.85rem',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Cancel Pass</span>
                          </button>
                        )}

                        {isCancelled && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray-dim)', fontStyle: 'italic' }}>
                            Pass Voided
                          </span>
                        )}

                        {isCompleted && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray-dim)' }}>
                            Attended / Concluded
                          </span>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* CANCELLATION CONFIRMATION MODAL */}
        {/* ========================================================= */}
        {cancelModalItem && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 300,
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
                padding: '2.25rem',
                textAlign: 'center',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(255, 77, 77, 0.12)', border: '1px solid #FF4D4D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Trash2 size={26} color="#FF4D4D" />
              </div>

              <h3 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '0.6rem' }}>
                Cancel Event Registration?
              </h3>

              <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Are you sure you want to cancel your pass for <strong style={{ color: '#FFFFFF' }}>"{cancelModalItem.event_title}"</strong>? Your reserved seat will be immediately released to other students.
              </p>

              {cancelError && (
                <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.15)', border: '1px solid #FF4D4D', borderRadius: '10px', padding: '0.75rem', color: '#FF7777', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  {cancelError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancelModalItem(null)}
                  className="btn-pill btn-outline-white"
                  style={{ flex: 1 }}
                >
                  Keep Pass
                </button>

                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleConfirmCancel}
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
                  {cancelling ? 'Releasing Seat...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DIGITAL QR PASS MODAL */}
        {/* ========================================================= */}
        {qrPassItem && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setQrPassItem(null)}
          >
            <div 
              style={{
                backgroundColor: '#12141A',
                border: '1px solid rgba(198, 242, 78, 0.4)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '420px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(198, 242, 78, 0.15)',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setQrPassItem(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-gray-light)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div className="badge-pill badge-pill-lime" style={{ marginBottom: '1rem', fontSize: '0.7rem' }}>
                CAMPUSCONNECT GATE PASS
              </div>

              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.2rem' }}>
                {qrPassItem.event_title}
              </h3>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
                Holder: {currentUser.name} • {currentUser.email}
              </div>

              {/* Simulated Cryptographic QR Code Container */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', display: 'inline-block', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginBottom: '1.25rem' }}>
                <QrCode size={180} color="#0A0A0A" />
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#C6F24E', letterSpacing: '0.1em' }}>
                PASS CODE: #CC-{qrPassItem.registration_id}-{qrPassItem.event_id}
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-gray-muted)', marginTop: '0.85rem' }}>
                Present this screen at {qrPassItem.event_venue} checkpoint for fast 1-second gate verification.
              </p>

              <button
                onClick={() => setQrPassItem(null)}
                className="btn-pill btn-lime"
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.7rem' }}
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
