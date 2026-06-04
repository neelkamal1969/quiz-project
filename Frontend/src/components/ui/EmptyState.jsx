import React from 'react';

// Consistent empty-state block: glyph, title, description, and an optional action.
export default function EmptyState({ icon = '✦', title, description, action, style }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-12) var(--space-6)',
        ...style,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 28,
          background: 'var(--grad-holo-soft)',
          border: '1.5px solid var(--glass-border)',
        }}
      >
        {icon}
      </div>
      {title && (
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{ margin: 0, maxWidth: 360, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 'var(--space-2)' }}>{action}</div>}
    </div>
  );
}
