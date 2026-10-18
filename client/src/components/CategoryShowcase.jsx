import React from 'react';
import { CATEGORIES } from '../data/eventsData';
import { Cpu, Music, Trophy, Lightbulb, Rocket, ArrowRight } from 'lucide-react';

export function CategoryShowcase({ onSelectCategory }) {
  const iconMap = {
    Cpu: Cpu,
    Music: Music,
    Trophy: Trophy,
    Lightbulb: Lightbulb,
    Rocket: Rocket
  };

  return (
    <section 
      id="categories-section"
      style={{
        backgroundColor: '#0A0A0A',
        padding: '6rem 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative'
      }}
    >
      <div className="site-container">

        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div>
            <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.3)', marginBottom: '0.8rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E' }}></span>
              <span>EVENT DISCIPLINES // 2026</span>
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
              five pillars.<br />
              <span className="lime-highlight">zero limits.</span>
            </h2>
          </div>

          <p style={{ maxWidth: '420px', fontSize: '0.95rem', color: 'var(--text-gray-muted)', lineHeight: 1.6 }}>
            Every discipline has a home at CampusConnect. Explore by genre and find the squad or competition that matches your drive.
          </p>
        </div>

        {/* Grid matching Kondhare Amenities layout */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            overflow: 'hidden'
          }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon] || Cpu;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  backgroundColor: '#0F1116',
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '260px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#161920';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0F1116';
                }}
              >
                {/* Top Row: Number & Count */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="font-mono" style={{ color: '#C6F24E', fontSize: '1.2rem', fontWeight: 800 }}>
                    {cat.number}
                  </span>

                  <span 
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-gray-dim)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)'
                    }}
                  >
                    {cat.count}
                  </span>
                </div>

                {/* Middle: Icon & Title */}
                <div style={{ margin: '1.5rem 0' }}>
                  <div style={{ marginBottom: '1rem', color: '#C6F24E' }}>
                    <Icon size={28} strokeWidth={1.8} />
                  </div>

                  <h3 
                    className="font-display" 
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    {cat.name}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-gray-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {cat.tagline}
                  </p>
                </div>

                {/* Bottom link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#C6F24E', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  <span>Explore category</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
