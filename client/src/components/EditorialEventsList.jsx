import React, { useState } from 'react';
import { MapPin, Calendar, Users, ArrowUpRight, Clock, ShieldCheck, Ticket } from 'lucide-react';

export function EditorialEventsList({ events, onSelectEvent, onRegisterQuick }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || 'evt-1');

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshops', 'Entrepreneurship'];

  const filteredEvents = activeCategory === 'All' 
    ? events 
    : events.filter(e => e.category === activeCategory);

  const currentEvent = events.find(e => e.id === selectedEventId) || events[0];

  return (
    <section 
      style={{
        backgroundColor: '#0A0A0A',
        padding: '6rem 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative'
      }}
    >
      <div className="site-container">
        
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.3)', marginBottom: '1rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E' }}></span>
              <span>CURATED LINEUP // 2026</span>
            </div>

            <h2 
              className="font-display" 
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                textTransform: 'lowercase',
                color: '#FFFFFF'
              }}
            >
              live across<br />
              <span style={{ color: '#C6F24E' }}>campuses.</span>
            </h2>
          </div>

          <p style={{ maxWidth: '420px', fontSize: '0.95rem', color: 'var(--text-gray-muted)', lineHeight: 1.6 }}>
            From high-stakes hackathons and underground band battles to esports championships and venture grant showdowns. Select an event to inspect details.
          </p>
        </div>

        {/* Category Pills (Directly matching Kondhare: Developed, Under Construction, Future) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2.5rem' }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  const matches = cat === 'All' ? events : events.filter(e => e.category === cat);
                  if (matches.length > 0) setSelectedEventId(matches[0].id);
                }}
                className={`badge-pill ${isActive ? 'badge-pill-lime' : 'badge-pill-outline'}`}
                style={{
                  cursor: 'pointer',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 2-Column Editorial Grid: Left Interactive List, Right Visual Preview */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start'
          }}
          className="editorial-split-grid"
        >
          {/* Left Table / List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredEvents.map((event) => {
              const isSelected = event.id === currentEvent?.id;
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  onMouseEnter={() => setSelectedEventId(event.id)}
                  className={`editorial-row ${isSelected ? 'active' : ''}`}
                  style={{
                    backgroundColor: isSelected ? '#C6F24E' : 'rgba(255, 255, 255, 0.02)',
                    color: isSelected ? '#0A0A0A' : '#FFFFFF',
                    border: isSelected ? '1px solid #C6F24E' : '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '1.25rem 1.4rem'
                  }}
                >
                  {/* Event Title */}
                  <div>
                    <div className="font-display" style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                      {event.title.split(':')[0]}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: isSelected ? '#222' : 'var(--text-gray-dim)', marginTop: '0.2rem' }}>
                      {event.organizer.name}
                    </div>
                  </div>

                  {/* Venue / Campus */}
                  <div style={{ fontSize: '0.85rem', color: isSelected ? '#111' : 'var(--text-gray-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color={isSelected ? '#0A0A0A' : '#C6F24E'} />
                    <span>{event.venue.split(',')[0]}</span>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: isSelected ? '#111' : 'var(--text-gray-light)' }}>
                    {event.date.split(',')[0]}
                  </div>

                  {/* Badge Pill */}
                  <div>
                    <span 
                      className="badge-pill"
                      style={{
                        backgroundColor: isSelected ? '#0A0A0A' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#C6F24E' : 'var(--text-gray-light)',
                        border: isSelected ? '1px solid #0A0A0A' : '1px solid rgba(255, 255, 255, 0.12)',
                        fontSize: '0.7rem'
                      }}
                    >
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Visual Card Showcase (Directly matching Kondhare Right Card with offset layer) */}
          {currentEvent && (
            <div 
              style={{
                position: 'sticky',
                top: '100px',
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: '#12141A',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(198, 242, 78, 0.08)'
              }}
            >
              {/* Card Image */}
              <div style={{ position: 'relative', height: '320px', width: '100%', overflow: 'hidden' }}>
                <img 
                  src={currentEvent.poster} 
                  alt={currentEvent.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.9) contrast(1.05)'
                  }}
                />
                
                {/* Top Badge Overlay */}
                <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <span className="badge-pill badge-pill-lime">
                    {currentEvent.category}
                  </span>
                  <span className="badge-pill badge-pill-dark">
                    {currentEvent.price}
                  </span>
                </div>

                {/* Floating Glass Box at Bottom of Image */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    right: '1rem',
                    background: 'rgba(10, 10, 10, 0.88)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '14px',
                    padding: '0.85rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#C6F24E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      REGISTRATION STATUS
                    </div>
                    <div className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {currentEvent.spotsRemaining} spots remaining
                    </div>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #C6F24E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ticket size={18} color="#C6F24E" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-gray-dim)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <span>{currentEvent.date}</span>
                  <span>•</span>
                  <span>{currentEvent.time}</span>
                </div>

                <h3 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem', lineHeight: 1.2 }}>
                  {currentEvent.title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray-muted)', marginTop: '0.6rem', lineHeight: 1.5 }}>
                  {currentEvent.shortDescription}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1.1rem' }}>
                  {currentEvent.tags.map(tag => (
                    <span 
                      key={tag} 
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-gray-light)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Action CTA */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.85rem' }}>
                  <button
                    onClick={() => onSelectEvent(currentEvent)}
                    className="btn-pill btn-lime"
                    style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.88rem' }}
                  >
                    <span>Inspect Details & Agenda</span>
                    <ArrowUpRight size={16} />
                  </button>

                  <button
                    onClick={() => onRegisterQuick(currentEvent)}
                    className="btn-pill btn-outline-white"
                    style={{ padding: '0.75rem 1.25rem', fontSize: '0.88rem' }}
                    title="Quick RSVP"
                  >
                    <span>RSVP</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .editorial-row {
            grid-template-columns: 1fr auto !important;
            gap: 0.5rem;
          }
          .editorial-row > div:nth-child(2),
          .editorial-row > div:nth-child(3) {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
