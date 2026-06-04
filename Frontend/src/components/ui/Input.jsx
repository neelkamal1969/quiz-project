import React, { useId } from 'react';

// Glass text input with label, error/hint text, and an optional right adornment.
export default function Input({
  label,
  error,
  hint,
  id,
  type = 'text',
  rightAdornment,
  style,
  containerStyle,
  ...rest
}) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...containerStyle }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          type={type}
          aria-invalid={!!error}
          style={{
            width: '100%',
            padding: '13px 16px',
            paddingRight: rightAdornment ? 46 : 16,
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            border: `1.5px solid ${error ? 'rgba(251,113,133,0.6)' : 'var(--glass-border)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            transition: 'border-color var(--dur), box-shadow var(--dur)',
            boxSizing: 'border-box',
            ...style,
          }}
          {...rest}
        />
        {rightAdornment && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightAdornment}
          </span>
        )}
      </div>
      {error ? (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-rose)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</span>
      ) : null}
    </div>
  );
}
