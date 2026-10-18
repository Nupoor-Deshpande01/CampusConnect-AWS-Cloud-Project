import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  Ticket, 
  Compass, 
  FolderGit2, 
  ArrowRight,
  User,
  LogOut
} from 'lucide-react';

export function Navbar({ 
  activeView, 
  setActiveView, 
  selectedCategory, 
  setSelectedCategory,
  onExploreClick,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'HOME', icon: Compass },
    { id: 'events', label: 'EVENTS', icon: Ticket },
    { id: 'categories', label: 'CATEGORIES', icon: FolderGit2 },
    { id: 'how-it-works', label: 'HOW IT WORKS', icon: Sparkles }
  ];

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="site-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => { setActiveView('home'); setMobileMenuOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            backgroundColor: '#0A0A0A',
            border: '2px solid #C6F24E',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(198, 242, 78, 0.25)'
          }}>
            <span className="font-display" style={{ color: '#C6F24E', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.05em' }}>
              CC
            </span>
          </div>

          <div>
            <div className="font-display" style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              campus<span style={{ color: '#C6F24E' }}>connect</span>
            </div>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>
              COLLEGE SCENE // 2026
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(255, 255, 255, 0.08)' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                id={`nav-${link.id}`}
                onClick={() => {
                  setActiveView(link.id);
                  if (link.id === 'categories') setSelectedCategory('All');
                }}
                style={{
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#0A0A0A' : 'var(--text-gray-light)',
                  border: 'none',
                  padding: '0.45rem 1.2rem',
                  borderRadius: 'var(--radius-pill)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 10px rgba(0, 0, 0, 0.3)' : 'none'
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions: Auth & Explore */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          <button
            onClick={() => {
              setActiveView('events');
              onExploreClick();
            }}
            className="btn-pill btn-lime"
            style={{ padding: '0.55rem 1.3rem', fontSize: '0.82rem' }}
          >
            <span>Explore Events</span>
            <ArrowRight size={15} />
          </button>

          {/* User Profile or Sign In Button */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                className="badge-pill badge-pill-dark"
                style={{ padding: '0.45rem 0.85rem', border: '1px solid rgba(198, 242, 78, 0.4)', gap: '0.4rem' }}
                title={`Signed in as ${currentUser.email} (${currentUser.role})`}
              >
                <User size={13} color="#C6F24E" />
                <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 600 }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#C6F24E', fontFamily: 'var(--font-mono)' }}>
                  [{currentUser.role}]
                </span>
              </div>

              <button
                onClick={onLogout}
                className="btn-pill btn-outline-white"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
                title="Sign out of account"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              id="nav-signin-btn"
              className="btn-pill btn-outline-white"
              style={{ padding: '0.55rem 1.2rem', fontSize: '0.82rem' }}
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.45rem',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="mobile-toggle"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#0F1216',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveView(link.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: isActive ? '#C6F24E' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#0A0A0A' : '#FFFFFF',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </button>
            );
          })}

          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {currentUser ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="btn-pill btn-outline-white"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <span>Sign Out ({currentUser.name})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="btn-pill btn-lime"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (min-width: 820px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
