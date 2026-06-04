import React from 'react';

// Frosted-glass surface. Set `holo` for an animated iridescent gradient border.
export default function GlassCard({ children, holo = false, padding = 'var(--space-6)', style, ...rest }) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1.5px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding,
        ...style,
      }}
      {...rest}
    >
      {holo && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            padding: '1.5px',
            background: 'var(--grad-holo)',
            backgroundSize: '200% auto',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: 0.5,
            animation: 'ds-holo-pan 6s ease infinite',
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </div>
  );
}
