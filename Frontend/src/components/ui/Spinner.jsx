import React from 'react';

// Inline loading spinner. `size` in px; inherits color by default.
export default function Spinner({ size = 18, color = 'currentColor', style }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `${Math.max(2, Math.round(size / 9))}px solid rgba(255,255,255,0.25)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'ds-spin 0.7s linear infinite',
        ...style,
      }}
    />
  );
}
