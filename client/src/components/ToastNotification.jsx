import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastNotification({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 2000,
        backgroundColor: '#12141A',
        border: '1px solid #C6F24E',
        borderRadius: '16px',
        padding: '0.9rem 1.4rem',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(198, 242, 78, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#FFFFFF',
        animation: 'slideUp 0.3s ease'
      }}
    >
      <CheckCircle2 size={18} color="#C6F24E" />
      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-gray-muted)',
          cursor: 'pointer',
          padding: '0.2rem',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={15} />
      </button>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
