import React from 'react';
import { Compass, QrCode, Zap, Award, ArrowRight } from 'lucide-react';

export function HowItWorks({ onGetStarted }) {
  const steps = [
    {
      num: '01',
      title: 'discover without friction',
      desc: 'Browse multi-campus hackathons, music gigs, esports tourneys, and workshops. Filter by your college, tags, or what your friends are attending.',
      icon: Compass
    },
    {
      num: '02',
      title: '1-click cryptographic pass',
      desc: 'Instant RSVP with your student credentials. Receive a high-res digital ticket with a unique QR code directly saved to your phone or dashboard.',
      icon: QrCode
    },
    {
      num: '03',
      title: '1.2s rapid gate check-in',
      desc: 'Organizers scan your QR in 1.2 seconds flat with offline-capable camera verification. No waiting in 200-meter manual registration queues.',
      icon: Zap
    },
    {
      num: '04',
      title: 'proof of attendance & badges',
      desc: 'Earn verifiable digital participation badges for hackathons and masterclasses that boost your portfolio and tech resume.',
      icon: Award
    }
  ];

  return (
    <section 
      id="how-it-works-section"
      className="section-light"
      style={{
        padding: '6.5rem 0',
        backgroundColor: '#F7F8FA',
        color: '#0A0A0A'
      }}
    >
      <div className="site-container">

        {/* Section Header (Inspired directly by Kondhare "why choose kondhare-") */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', marginBottom: '4rem' }}>
          <div>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#64748B',
                marginBottom: '1rem'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0A0A0A' }}></span>
              <span>ARCHITECTURE & FLOW</span>
            </div>

            <h2 
              className="font-display" 
              style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                textTransform: 'lowercase',
                color: '#0A0A0A'
              }}
            >
              how campusconnect<br />
              <span className="lime-highlight" style={{ color: '#0A0A0A' }}>works.</span>
            </h2>
          </div>

          <div style={{ maxWidth: '400px' }}>
            <div 
              style={{
                border: '1px solid rgba(0, 0, 0, 0.15)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.4rem 1rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: '#475569',
                display: 'inline-block',
                marginBottom: '0.75rem'
              }}
            >
              • ZERO PAPERS · ZERO QUEUES
            </div>
            <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6 }}>
              Built specifically for modern universities. We replaced printed PDF lists and chaotic Google Forms with an automated live event operating system.
            </p>
          </div>
        </div>

        {/* 4 Steps Row List (Matching Kondhare Why Choose numbered rows) */}
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isFirst = idx === 0;

            return (
              <div 
                key={step.num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1.5fr 2fr',
                  alignItems: 'start',
                  padding: '2.5rem 0',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  gap: '2rem'
                }}
                className="step-row"
              >
                {/* Number Circle (Direct Kondhare Match) */}
                <div 
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: isFirst ? '#0A0A0A' : 'transparent',
                    border: isFirst ? 'none' : '1px solid rgba(0, 0, 0, 0.3)',
                    color: isFirst ? '#C6F24E' : '#0A0A0A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 900
                  }}
                >
                  {step.num}
                </div>

                {/* Step Title & Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Icon size={22} color="#0A0A0A" />
                  <h3 
                    className="font-display" 
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: '#0A0A0A',
                      letterSpacing: '-0.02em',
                      textTransform: 'lowercase'
                    }}
                  >
                    {step.title}
                  </h3>
                </div>

                {/* Step Description */}
                <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA in light section */}
        <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onGetStarted}
            className="btn-pill btn-dark"
            style={{ padding: '0.9rem 2.2rem', fontSize: '0.95rem' }}
          >
            <span>Claim Your Free Student Pass →</span>
          </button>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .step-row {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </section>
  );
}
