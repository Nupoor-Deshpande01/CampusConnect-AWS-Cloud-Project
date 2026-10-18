import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/auth';

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isSignUp) {
        // Public registration: strictly student role (enforced by backend)
        user = await authService.signup(name, email, password);
      } else {
        user = await authService.login(email, password);
      }

      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
          maxWidth: '440px',
          backgroundColor: '#12141A',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(198, 242, 78, 0.1)',
          padding: '2rem',
          position: 'relative',
          color: '#FFFFFF'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-gray-muted)',
            cursor: 'pointer'
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            margin: '0 auto 0.75rem auto',
            backgroundColor: '#0A0A0A',
            border: '2px solid #C6F24E',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span className="font-display" style={{ color: '#C6F24E', fontWeight: 900, fontSize: '1.2rem' }}>
              CC
            </span>
          </div>

          <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {isSignUp ? 'Student Registration' : 'Welcome Back'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
            {isSignUp 
              ? 'Join CampusConnect to discover and RSVP for university events' 
              : 'Sign in to access your digital passes & events'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              color: '#EF4444',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.35rem' }}>
                FULL NAME
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.35rem' }}>
              UNIVERSITY EMAIL
            </label>
            <input
              type="email"
              required
              placeholder="student@univ.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.9rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.35rem' }}>
              PASSWORD (MIN 8 CHARS)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.9rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pill btn-lime"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <span>{isSignUp ? 'Create Student Account →' : 'Sign In →'}</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-gray-muted)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{ background: 'none', border: 'none', color: '#C6F24E', fontWeight: 700, cursor: 'pointer' }}
          >
            {isSignUp ? 'Sign in' : 'Create one'}
          </button>
        </div>

      </div>
    </div>
  );
}
