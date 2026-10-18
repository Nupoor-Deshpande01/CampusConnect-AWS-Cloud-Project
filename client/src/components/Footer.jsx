import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, Mail, Sparkles, Check } from 'lucide-react';

export function Footer({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer 
      style={{
        backgroundColor: '#0A0A0A',
        borderTop: '1px solid rgba(255, 255, 255, 0.09)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* High-Impact CTA Strip before Footer */}
      <div 
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0E1015',
          padding: '5rem 0'
        }}
      >
        <div className="site-container">
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2.5rem'
            }}
          >
            <div>
              <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.3)', marginBottom: '1rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E' }}></span>
                <span>NEVER MISS THE DROP</span>
              </div>
              <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', fontWeight: 900, textTransform: 'lowercase', lineHeight: 1.05 }}>
                get the weekly<br />
                <span className="lime-highlight">campus drops.</span>
              </h2>
            </div>

            {/* Newsletter input */}
            <div style={{ maxWidth: '440px', width: '100%' }}>
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="email"
                  required
                  placeholder="Enter university email..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.85rem 1.25rem',
                    backgroundColor: '#15181F',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-pill)',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="btn-pill btn-lime"
                  style={{ padding: '0.85rem 1.6rem' }}
                >
                  {subscribed ? <Check size={18} /> : <ArrowRight size={18} />}
                </button>
              </form>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)', marginTop: '0.6rem' }}>
                {subscribed ? '✓ You are subscribed to weekly drop alerts!' : '● Sent every Thursday. No spam. Unsubscribe anytime.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="site-container" style={{ padding: '4.5rem 2rem 3rem 2rem' }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem'
          }}
        >
          {/* Brand Column */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#0A0A0A',
                border: '2px solid #C6F24E',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="font-display" style={{ color: '#C6F24E', fontWeight: 900, fontSize: '1.1rem' }}>
                  CC
                </span>
              </div>
              <span className="font-display" style={{ fontWeight: 800, fontSize: '1.3rem', color: '#FFF' }}>
                campus<span style={{ color: '#C6F24E' }}>connect</span>
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-gray-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
              The youth-driven operating system for university festivals, hackathons, and student communities. Built for next-gen campus culture.
            </p>

            <div style={{ marginTop: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#C6F24E' }}>
              ● PLATFORM HEALTH: ALL SYSTEMS NOMINAL (99.98%)
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              EXPLORE
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.88rem' }}>
              <li>
                <button onClick={() => onNavigate('events')} style={{ background: 'none', border: 'none', color: 'var(--text-gray-light)', cursor: 'pointer', padding: 0 }}>
                  Upcoming Events
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} style={{ background: 'none', border: 'none', color: 'var(--text-gray-light)', cursor: 'pointer', padding: 0 }}>
                  Event Categories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} style={{ background: 'none', border: 'none', color: 'var(--text-gray-light)', cursor: 'pointer', padding: 0 }}>
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-gray-light)', cursor: 'pointer', padding: 0 }}>
                  Student Passes
                </button>
              </li>
            </ul>
          </div>

          {/* Disciplines */}
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              DISCIPLINES
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.88rem', color: 'var(--text-gray-muted)' }}>
              <li>AI & Hackathons</li>
              <li>Cultural & Band Gigs</li>
              <li>Esports & Gaming LANs</li>
              <li>Design & Spatial Labs</li>
              <li>E-Cell Pitch Battles</li>
            </ul>
          </div>

          {/* Campus Hubs */}
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              CAMPUS HUBS
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.88rem', color: 'var(--text-gray-muted)' }}>
              <li>Pune Universities</li>
              <li>Mumbai Tech Campuses</li>
              <li>Bengaluru Student Node</li>
              <li>Delhi NCR Circuit</li>
            </ul>
          </div>

        </div>

        {/* Bottom Giant Brand Text (Kondhare Style) */}
        <div 
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 11vw, 11rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: 'rgba(255, 255, 255, 0.04)',
            textAlign: 'center',
            userSelect: 'none',
            lineHeight: 0.9,
            marginBottom: '2rem'
          }}
        >
          campusconnect
        </div>

        {/* Legal & Copyright */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-gray-dim)' }}>
          <div>
            © 2026 CampusConnect Technologies. Designed for college creators.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)' }}>
            <span>REACT 19 + VITE</span>
            <span>EXPRESS + MYSQL</span>
            <span style={{ color: '#C6F24E' }}>TARGET: AWS CLOUD</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
