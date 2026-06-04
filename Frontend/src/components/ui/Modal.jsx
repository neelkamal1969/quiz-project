import React, { useEffect, useRef } from 'react';

// Accessible modal: backdrop-click + ESC to close, focus moves in, role=dialog.
export default function Modal({ open, onClose, title, children, footer, maxWidth = 440 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-4)',
        background: 'rgba(3,7,18,0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'ds-fade-in var(--dur) var(--ease-out) both',
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        tabIndex={-1}
        style={{
          width: '100%',
          maxWidth,
          outline: 'none',
          background: 'var(--bg-700)',
          border: '1.5px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-6)',
          animation: 'ds-pop-in var(--dur) var(--ease-spring) both',
        }}
      >
        {title && (
          <h2 style={{ margin: '0 0 var(--space-3)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
            {title}
          </h2>
        )}
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)' }}>
          {children}
        </div>
        {footer && (
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
