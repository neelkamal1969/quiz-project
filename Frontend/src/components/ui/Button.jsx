import React from 'react';
import Spinner from './Spinner';

const VARIANTS = {
  primary: { background: 'var(--grad-primary)', color: 'var(--text-on-accent)', border: 'none', boxShadow: 'var(--shadow-glow)' },
  ghost: { background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1.5px solid var(--glass-border)' },
  danger: { background: 'rgba(251,113,133,0.12)', color: 'var(--accent-rose)', border: '1.5px solid rgba(251,113,133,0.4)' },
  subtle: { background: 'transparent', color: 'var(--text-secondary)', border: 'none' },
};

const SIZES = {
  sm: { padding: '8px 14px', fontSize: 'var(--text-sm)' },
  md: { padding: '12px 20px', fontSize: 'var(--text-base)' },
  lg: { padding: '15px 26px', fontSize: 'var(--text-lg)' },
};

// Primary action button with variants, sizes, and a loading state.
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  style,
  type = 'button',
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--weight-bold)',
        borderRadius: 'var(--radius-md)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast), opacity var(--dur-fast)',
        ...v,
        ...s,
        ...style,
      }}
      onMouseDown={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
