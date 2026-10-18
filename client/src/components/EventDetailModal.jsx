import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Ticket, 
  CheckCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function EventDetailModal({ 
  event, 
  onClose, 
  onRegisterSuccess, 
  isRegistered 
}) {
  const [registered, setRegistered] = useState(isRegistered || false);

  if (!event) return null;

  const handleRegister = () => {
    setRegistered(true);
    if (onRegisterSuccess) {
      onRegisterSuccess(event);
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
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#C6F24E'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Poster Header */}
        <div style={{ position: 'relative', height: '280px', width: '100%', overflow: 'hidden' }}>
          <img 
            src={event.poster} 
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.78)' }}
          />

          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #12151B 0%, rgba(18, 21, 27, 0.4) 60%, transparent 100%)'
          }} />

          {/* Badges Overlay */}
          <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span className="badge-pill badge-pill-lime">
              {event.category}
            </span>
            <span className="badge-pill badge-pill-dark">
              {event.price}
            </span>
            <span className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.4)', color: '#C6F24E' }}>
              {event.spotsRemaining} SEATS LEFT
            </span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} color="#C6F24E" />
              <span>{event.time}</span>
            </div>
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
            <img 
              src={event.organizer.avatar} 
              alt={event.organizer.name}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #C6F24E' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.92rem' }}>
                <span>{event.organizer.name}</span>
                <ShieldCheck size={16} color="#C6F24E" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>
                {event.organizer.contact}
              </div>
            </div>
          </div>

          {/* Mock Event Description */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: '#C6F24E', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              EVENT OVERVIEW
            </h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-gray-muted)', lineHeight: 1.6 }}>
              {event.description}
            </p>
          </div>

          {/* Agenda & Schedule */}
          {event.agenda && (
            <div style={{ marginTop: '1.75rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: '#C6F24E', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                SCHEDULE & AGENDA
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {event.agenda.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.65rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#C6F24E', minWidth: '100px', fontWeight: 600 }}>
                      {item.time}
                    </span>
                    <span style={{ color: '#FFFFFF' }}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Confirmation Feedback */}
          {registered && (
            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', backgroundColor: 'rgba(198, 242, 78, 0.12)', border: '1px solid #C6F24E', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={22} color="#C6F24E" />
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem' }}>
                  Registration Confirmed!
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>
                  Your spot for {event.title} is reserved. Show your student ID at the gate.
                </div>
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
                {event.spotsRemaining} seats available / {event.spotsTotal} total
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {registered ? (
                <button
                  onClick={onClose}
                  className="btn-pill btn-lime"
                  style={{ padding: '0.75rem 2rem' }}
                >
                  <span>Close Window</span>
                </button>
              ) : (
                <button
                  id="register-cta-btn"
                  onClick={handleRegister}
                  className="btn-pill btn-lime"
                  style={{ padding: '0.75rem 2rem' }}
                >
                  <Ticket size={16} />
                  <span>Register for Event →</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
