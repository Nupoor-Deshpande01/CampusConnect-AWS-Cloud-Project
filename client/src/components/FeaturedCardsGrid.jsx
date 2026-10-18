import React, { useState } from 'react';
import { Search, Calendar, MapPin, Ticket, ArrowUpRight, Flame, RotateCcw, Users, Clock } from 'lucide-react';

export function FeaturedCardsGrid({ 
  events, 
  onSelectEvent, 
  onRegisterQuick, 
  searchQuery, 
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) {
  const [selectedSort, setSelectedSort] = useState('date-asc'); // 'date-asc' | 'date-desc' | 'spots' | 'title'

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshops', 'Entrepreneurship'];

  // Search by event title & filter by category
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery.trim() === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesCategory = selectedCategory === 'All' || 
      event.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Sort by upcoming date or other criteria
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (selectedSort === 'date-asc') {
      return a.isoDate.localeCompare(b.isoDate);
    }
    if (selectedSort === 'date-desc') {
      return b.isoDate.localeCompare(a.isoDate);
    }
    if (selectedSort === 'spots') {
      return b.spotsRemaining - a.spotsRemaining;
    }
    if (selectedSort === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSort('date-asc');
  };

  return (
    <section 
      id="events-grid-section"
      style={{
        backgroundColor: '#0E1015',
        padding: '5.5rem 0',
        position: 'relative',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="site-container">

        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.3)', marginBottom: '0.8rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E' }}></span>
              <span>CAMPUS DIRECTORY // 2026</span>
            </div>

            <h2 
              className="font-display" 
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                textTransform: 'lowercase',
                color: '#FFFFFF'
              }}
            >
              upcoming <span className="lime-highlight">campus events.</span>
            </h2>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-gray-muted)', fontFamily: 'var(--font-mono)' }}>
            SHOWING <strong style={{ color: '#C6F24E' }}>{sortedEvents.length}</strong> OF {events.length} EVENTS
          </div>
        </div>

        {/* Search, Filter & Sort Control Bar */}
        <div 
          style={{
            backgroundColor: '#15181F',
            borderRadius: '20px',
            padding: '1.25rem 1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '3rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {/* Top Controls Row: Search Input & Sort Dropdown */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            
            {/* Search by event title */}
            <div 
              style={{
                flex: 1,
                minWidth: '260px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#0A0A0A',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.7rem 1.25rem'
              }}
            >
              <Search size={18} color="#C6F24E" />
              <input
                type="text"
                id="event-search-input"
                placeholder="Search by event title (e.g. HackPune, EchoFest, ApexClash)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  width: '100%',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-body)'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-gray-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort by upcoming date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-gray-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Sort By:
              </span>
              <select
                id="event-sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                style={{
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.65rem 1.2rem',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="date-asc">Upcoming Date (Earliest First)</option>
                <option value="date-desc">Upcoming Date (Latest First)</option>
                <option value="spots">Available Seats (Most First)</option>
                <option value="title">Title (A - Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills: Technical, Cultural, Sports, Workshops, Entrepreneurship */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-gray-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginRight: '0.25rem' }}>
              Category:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    backgroundColor: isSelected ? '#C6F24E' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#0A0A0A' : 'var(--text-gray-light)',
                    border: isSelected ? '1px solid #C6F24E' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.45rem 1.05rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State when no events match */}
        {sortedEvents.length === 0 ? (
          <div 
            id="empty-events-state"
            style={{
              padding: '4.5rem 2rem',
              textAlign: 'center',
              backgroundColor: '#12141A',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <div style={{ width: '56px', height: '56px', margin: '0 auto 1.25rem auto', borderRadius: '50%', backgroundColor: 'rgba(198, 242, 78, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={26} color="#C6F24E" />
            </div>
            <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
              No Events Found
            </h3>
            <p style={{ color: 'var(--text-gray-muted)', marginTop: '0.5rem', fontSize: '0.92rem', lineHeight: 1.5 }}>
              No campus events match your search "{searchQuery}" or category filter "{selectedCategory}".
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-pill btn-lime"
              style={{ marginTop: '1.75rem', padding: '0.7rem 1.6rem', fontSize: '0.88rem' }}
            >
              <RotateCcw size={15} />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          /* Responsive Event Cards Grid */
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
              gap: '2rem'
            }}
          >
            {sortedEvents.map((event) => {
              const fillPercentage = Math.round(((event.spotsTotal - event.spotsRemaining) / event.spotsTotal) * 100);

              return (
                <div
                  key={event.id}
                  className="event-card"
                  onClick={() => onSelectEvent(event)}
                  style={{
                    backgroundColor: '#13161C',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'rgba(198, 242, 78, 0.4)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(198, 242, 78, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  {/* Event Poster Image */}
                  <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
                    <img
                      src={event.poster}
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, #13161C 0%, transparent 60%)'
                    }} />

                    {/* Category Badge */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                      <span className="badge-pill badge-pill-lime" style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem' }}>
                        {event.category}
                      </span>
                    </div>

                    {/* Price Badge */}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                      <span className="badge-pill badge-pill-dark" style={{ fontSize: '0.7rem' }}>
                        {event.price}
                      </span>
                    </div>

                    {/* Date Badge on bottom of poster */}
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '0.75rem',
                        left: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.76rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#FFFFFF',
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                    >
                      <Calendar size={13} color="#C6F24E" />
                      <span>{event.date}</span>
                    </div>
                  </div>

                  {/* Card Content: Title, Venue, Description, Available Seats */}
                  <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    
                    {/* Venue */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-gray-dim)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      <MapPin size={12} color="#C6F24E" />
                      <span>{event.venue.split(',')[0]}</span>
                    </div>

                    {/* Title */}
                    <h3 
                      className="font-display" 
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        marginTop: '0.45rem',
                        lineHeight: 1.25
                      }}
                    >
                      {event.title}
                    </h3>

                    {/* Short Description */}
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-gray-muted)', marginTop: '0.5rem', lineHeight: 1.5, flex: 1 }}>
                      {event.shortDescription}
                    </p>

                    {/* Available Seats Progress Bar */}
                    <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', marginBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-gray-dim)' }}>SEAT CAPACITY</span>
                        <span style={{ color: event.spotsRemaining < 20 ? '#FF6B6B' : '#C6F24E', fontWeight: 700 }}>
                          {event.spotsRemaining} OF {event.spotsTotal} SEATS AVAILABLE
                        </span>
                      </div>

                      <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{
                            height: '100%',
                            width: `${fillPercentage}%`,
                            backgroundColor: event.spotsRemaining < 20 ? '#FF6B6B' : '#C6F24E',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectEvent(event); }}
                        className="btn-pill btn-outline-white"
                        style={{ flex: 1, padding: '0.65rem 0.8rem', fontSize: '0.82rem' }}
                      >
                        <span>View Details</span>
                        <ArrowUpRight size={14} />
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); onRegisterQuick(event); }}
                        className="btn-pill btn-lime"
                        style={{ padding: '0.65rem 1.25rem', fontSize: '0.82rem' }}
                      >
                        <span>RSVP Now</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
