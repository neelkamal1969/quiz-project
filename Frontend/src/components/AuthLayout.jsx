import React from 'react';
import GlassCard from './ui/GlassCard';

// Full-screen auth scene: holographic gradient background + floating orbs + a
// centered glass card. Shared by Login and SignUp so they stay identical in feel.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-4)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Background layers */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'var(--grad-bg)' }} />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage:
            'linear-gradient(rgba(var(--accent-rgb),0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-rgb),0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: '8%', left: '10%', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.18) 0%, transparent 70%)',
          filter: 'blur(45px)', zIndex: 0, animation: 'ds-float-a 9s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', bottom: '8%', right: '8%', width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
          filter: 'blur(55px)', zIndex: 0, animation: 'ds-float-b 12s ease-in-out infinite',
        }}
      />

      {/* Card */}
      <GlassCard
        holo
        padding="clamp(28px, 5vw, 44px)"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 440,
          animation: 'ds-fade-up var(--dur-slow) var(--ease-out) both',
        }}
      >
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div
            style={{
              width: 52, height: 52, margin: '0 auto var(--space-4)', borderRadius: 'var(--radius-md)',
              background: 'var(--grad-primary)', display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            S
          </div>
          <h1
            className="ds-holo-text"
            style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-black)', letterSpacing: '-0.5px' }}
          >
            {title}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{subtitle}</p>
        </div>

        {children}

        {footer && <div style={{ marginTop: 'var(--space-6)' }}>{footer}</div>}

        {/* Trust strip */}
        <div
          style={{
            marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'center', gap: 'var(--space-5)',
            borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-5)', flexWrap: 'wrap',
          }}
        >
          {['100% Private', 'Gemini Powered', 'Secure Login'].map((t) => (
            <span
              key={t}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.3px',
              }}
            >
              <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
              {t}
            </span>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
