import React from 'react';

const TONES = {
  default: { bg: 'var(--glass-bg)', color: 'var(--text-secondary)', border: 'var(--glass-border)' },
  indigo: { bg: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent-light)', border: 'rgba(var(--accent-rgb),0.35)' },
  success: { bg: 'rgba(52,211,153,0.14)', color: 'var(--accent-emerald)', border: 'rgba(52,211,153,0.35)' },
  warning: { bg: 'rgba(251,191,36,0.14)', color: 'var(--accent-amber)', border: 'rgba(251,191,36,0.35)' },
  danger: { bg: 'rgba(251,113,133,0.14)', color: 'var(--accent-rose)', border: 'rgba(251,113,133,0.35)' },
};

// Small status pill.
export default function Badge({ children, tone = 'default', style }) {
  const t = TONES[tone] || TONES.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
