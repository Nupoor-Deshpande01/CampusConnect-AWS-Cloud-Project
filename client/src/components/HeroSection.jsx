import React, { useState } from 'react';
import { ArrowRight, Sparkles, MapPin, Calendar, Users, Flame, Zap, Search } from 'lucide-react';

export function HeroSection({ 
  onExploreClick, 
  onSelectFeaturedEvent,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) {
  const [activeHotspot, setActiveHotspot] = useState(0);

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshops', 'Entrepreneurship'];

  const hotspots = [
    {
      id: 0,
      title: 'HackPune 2026',
      subtitle: '36-Hour Autonomous AI & Web3 Sprint',
      meta: 'INNOVATION HUB · NOV 14',
      x: '38%',
      y: '35%'
    },
    {
      id: 1,
      title: 'EchoFest Live Stage',
      subtitle: 'Indie Rock & Electronic Sunset Sessions',
      meta: 'CENTRAL GREENS · NOV 21',
      x: '64%',
      y: '58%'
    }
  ];

  return (
    <section 
      style={{
        position: 'relative',
        minHeight: '100vh',
        paddingTop: '110px',
        paddingBottom: '4rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(198, 242, 78, 0.08), transparent 70%), #0A0A0A'
      }}
    >
      {/* Background Typography Watermark */}
      <div 
        style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(4.5rem, 15vw, 16rem)',
          fontWeight: 900,
          letterSpacing: '-0.05em',
          color: 'rgba(255, 255, 255, 0.035)',
          userSelect: 'none',
          pointerEvents: 'none',
          lineHeight: 0.85,
          zIndex: 1,
          whiteSpace: 'nowrap'
        }}
      >
        campusconnect
      </div>

      {/* Side Margins: Left Vertical Tags & Right Geo Label */}
      <div 
        style={{
          position: 'absolute',
          left: '2rem',
          top: '35%',
          zIndex: 10,
          display: 'none'
        }}
        className="hero-side-tags"
      >
        <div className="vertical-tag">
          <span>INNOVATION <span className="slash">//</span></span>
          <span>CULTURE <span className="slash">//</span></span>
          <span>DISCOVERY <span className="slash">//</span></span>
        </div>
      </div>

      <div 
        style={{
          position: 'absolute',
          right: '2rem',
          top: '28%',
          zIndex: 10,
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          letterSpacing: '0.14em',
          color: 'var(--text-gray-muted)',
          lineHeight: 1.6,
          display: 'none'
        }}
        className="hero-side-geo"
      >
        <div style={{ color: '#FFFFFF', fontWeight: 700 }}>COLLEGE SCENE</div>
        <div>FALL 2026 // INDIA</div>
        <div style={{ color: '#C6F24E', marginTop: '0.25rem' }}>● LIVE EVENTS</div>
      </div>

      {/* Main Hero Content */}
      <div className="site-container" style={{ position: 'relative', zIndex: 5, width: '100%', marginTop: 'auto', marginBottom: 'auto' }}>
        
        {/* Top Mini Pill Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.3)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E' }}></span>
            <span>NEXT-GEN COLLEGE EVENT NETWORK</span>
            <span style={{ color: '#C6F24E', fontFamily: 'var(--font-mono)' }}>// 2026</span>
          </div>
        </div>

        {/* Central Hero Visual Composition */}
        <div 
          style={{
            position: 'relative',
            maxWidth: '1040px',
            margin: '0 auto',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(198, 242, 78, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          {/* Main Visual Image Banner */}
          <div style={{ position: 'relative', height: '420px', width: '100%', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=85" 
              alt="Campus Hackathon and Creative Lab"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.82) contrast(1.05)'
              }}
            />

            {/* Gradient Overlays */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(10, 10, 10, 0.95) 0%, rgba(10, 10, 10, 0.25) 50%, rgba(10, 10, 10, 0.6) 100%)'
            }} />

            {/* Interactive Hotspot 1 */}
            <div 
              onClick={() => setActiveHotspot(0)}
              style={{
                position: 'absolute',
                top: hotspots[0].y,
                left: hotspots[0].x,
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeHotspot === 0 ? '#C6F24E' : 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(198, 242, 78, 0.6)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0A0A0A' }} />
              </div>

              {activeHotspot === 0 && (
                <div 
                  onClick={(e) => { e.stopPropagation(); onSelectFeaturedEvent('evt-1'); }}
                  style={{
                    position: 'absolute',
                    top: '38px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '260px',
                    background: 'rgba(18, 20, 26, 0.92)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(198, 242, 78, 0.4)',
                    borderRadius: '16px',
                    padding: '1rem',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#C6F24E', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    <Flame size={12} />
                    <span>FEATURED HACKATHON</span>
                  </div>
                  <div className="font-display" style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF', marginTop: '0.2rem' }}>
                    {hotspots[0].title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                    {hotspots[0].subtitle}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#C6F24E', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {hotspots[0].meta} →
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Hotspot 2 */}
            <div 
              onClick={() => setActiveHotspot(1)}
              style={{
                position: 'absolute',
                top: hotspots[1].y,
                left: hotspots[1].x,
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: activeHotspot === 1 ? '#C6F24E' : 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(198, 242, 78, 0.6)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0A0A0A' }} />
              </div>

              {activeHotspot === 1 && (
                <div 
                  onClick={(e) => { e.stopPropagation(); onSelectFeaturedEvent('evt-2'); }}
                  style={{
                    position: 'absolute',
                    top: '38px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '260px',
                    background: 'rgba(18, 20, 26, 0.92)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(198, 242, 78, 0.4)',
                    borderRadius: '16px',
                    padding: '1rem',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FF6B6B', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    <Sparkles size={12} />
                    <span>FLAGSHIP CONCERT</span>
                  </div>
                  <div className="font-display" style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF', marginTop: '0.2rem' }}>
                    {hotspots[1].title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                    {hotspots[1].subtitle}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#C6F24E', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {hotspots[1].meta} →
                  </div>
                </div>
              )}
            </div>

            {/* Left Headline Overlay: Exact Match to Requirement 1 */}
            <div 
              style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.75rem',
                zIndex: 10,
                maxWidth: '640px'
              }}
            >
              <h1 
                className="font-display" 
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                  color: '#FFFFFF'
                }}
              >
                Discover What's<br />
                <span className="lime-highlight">Happening on Campus</span>
              </h1>
            </div>
          </div>

          {/* Bottom Bar inside the Hero Box */}
          <div 
            style={{
              backgroundColor: '#0F1116',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem'
            }}
          >
            {/* Supporting Description */}
            <p style={{ maxWidth: '540px', fontSize: '0.96rem', color: 'var(--text-gray-muted)', lineHeight: 1.55 }}>
              Explore hackathons, cultural concerts, sports tournaments, workshops, and startup mixers across colleges. Discover events, check live seat availability, and RSVP in seconds.
            </p>

            {/* Explore Events CTA */}
            <div>
              <button 
                onClick={onExploreClick}
                className="btn-pill btn-lime"
                style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}
                id="hero-explore-cta"
              >
                <span>Explore Events</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Quick Search & Filter Strip in Hero Box */}
          <div 
            style={{
              backgroundColor: '#090B0E',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '1rem 1.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '1rem',
              justifyContent: 'space-between'
            }}
          >
            {/* Quick Search Field */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: '#14171E',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.45rem 1rem',
                flex: '1 1 240px',
                maxWidth: '420px'
              }}
            >
              <Search size={16} color="#C6F24E" />
              <input
                type="text"
                placeholder="Search events by title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  width: '100%',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </div>

            {/* Quick Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              {categories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      onExploreClick();
                    }}
                    style={{
                      background: isSelected ? '#C6F24E' : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#0A0A0A' : 'var(--text-gray-light)',
                      border: isSelected ? '1px solid #C6F24E' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-pill)',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.74rem',
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
        </div>

      </div>

      <style>{`
        @media (min-width: 1024px) {
          .hero-side-tags {
            display: block !important;
          }
          .hero-side-geo {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
}
