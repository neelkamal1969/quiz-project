import React, { useState } from 'react';
import Modal from './ui/Modal';
import { useToast } from '../context/ToastContext';

const MAIL = 'neel76441969@gmail.com';

// Inline brand/glyph SVGs — always render (no asset/network dependency).
const ICONS = {
  portfolio: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.8 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.8-3.8-9S9.5 5.5 12 3z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
};

// Social links — URLs intentionally blank for now (fill in later).
const SOCIALS = [
  { key: 'portfolio', name: 'Portfolio', url: '' },
  { key: 'github', name: 'GitHub', url: '' },
  { key: 'linkedin', name: 'LinkedIn', url: '' },
  { key: 'instagram', name: 'Instagram', url: '' },
];

function Chip({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(var(--accent-rgb),0.45)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.6)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
      style={{
        width: 46, height: 46, borderRadius: 'var(--radius-md)',
        display: 'grid', placeItems: 'center', cursor: 'pointer',
        background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)',
        color: 'var(--text-secondary)', transition: 'all var(--dur) var(--ease-out)',
      }}
    >
      {children}
    </button>
  );
}

export default function Footer() {
  const toast = useToast();
  const [mailOpen, setMailOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const subject = encodeURIComponent(name ? `StudyAI — message from ${name}` : 'StudyAI — hello');
  const body = encodeURIComponent(message || '');
  const composeLinks = {
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${MAIL}&su=${subject}&body=${body}`,
    outlook: `https://outlook.office.com/mail/deeplink/compose?to=${MAIL}&subject=${subject}&body=${body}`,
    default: `mailto:${MAIL}?subject=${subject}&body=${body}`,
  };

  const handleChoice = (kind) => {
    if (kind === 'copy') {
      navigator.clipboard?.writeText(MAIL).then(() => toast.success('Email address copied'), () => toast.error('Copy failed'));
    } else if (kind === 'default') {
      window.location.href = composeLinks.default;
    } else {
      window.open(composeLinks[kind], '_blank', 'noopener');
    }
    setMailOpen(false);
  };

  const onSocial = (s) => {
    if (s.url) window.open(s.url, '_blank', 'noopener');
    else toast.info(`${s.name} link coming soon`);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: 'var(--glass-bg)',
    border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <footer style={{ position: 'relative', borderTop: '1px solid var(--glass-border)', background: 'var(--glass-bg-light)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)' }}>
      {/* Holographic top hairline */}
      <div aria-hidden="true" style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 2, background: 'var(--grad-holo)', backgroundSize: '200% auto', animation: 'ds-holo-pan 6s ease infinite', opacity: 0.6 }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-12) var(--space-6) var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-10)' }}>
        {/* Brand + socials */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--grad-primary)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff', boxShadow: 'var(--shadow-glow)' }}>S</div>
            <span className="ds-holo-text" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-black)' }}>StudyAI</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-5)', maxWidth: 320 }}>
            Turn study material into smart, personalised quizzes — powered by OCR and Gemini.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 var(--space-3)' }}>Connect</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {SOCIALS.map((s) => (
              <Chip key={s.key} label={s.name} onClick={() => onSocial(s)}>{ICONS[s.key]}</Chip>
            ))}
            <Chip label="Email me" onClick={() => setMailOpen(true)}>{ICONS.mail}</Chip>
          </div>
        </div>

        {/* Contact / feedback */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>Get in touch</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-4)' }}>Questions or feedback? Send me a message.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); setMailOpen(true); }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          >
            <input style={inputStyle} aria-label="Your name (optional)" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }} aria-label="Your message" placeholder="Your message…" value={message} onChange={(e) => setMessage(e.target.value)} required />
            <button
              type="submit"
              style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 'var(--weight-bold)', color: '#fff', background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)' }}
            >
              {ICONS.mail} Send message
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--glass-border)', padding: 'var(--space-5) var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
        © {new Date().getFullYear()} StudyAI · Ideated by Mridul & Designed by Neelkamal Gupta
      </div>

      {/* Mail-client chooser */}
      <Modal
        open={mailOpen}
        onClose={() => setMailOpen(false)}
        title="Send your message"
        footer={<button onClick={() => setMailOpen(false)} style={{ background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', padding: '10px 18px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>}
      >
        <p style={{ margin: '0 0 var(--space-4)' }}>Choose how to open your email to <strong style={{ color: 'var(--text-primary)' }}>{MAIL}</strong>:</p>
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {[
            ['gmail', 'Gmail', '✉️'],
            ['outlook', 'Outlook', '📨'],
            ['default', 'Default mail app', '💻'],
            ['copy', 'Copy email address', '📋'],
          ].map(([kind, label, emoji]) => (
            <button
              key={kind}
              onClick={() => handleChoice(kind)}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 'var(--text-base)', fontWeight: 600, transition: 'border-color var(--dur)' }}
            >
              <span style={{ fontSize: 20 }}>{emoji}</span> {label}
            </button>
          ))}
        </div>
      </Modal>
    </footer>
  );
}
