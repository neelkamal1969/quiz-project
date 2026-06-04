import React from 'react';

// Shimmer placeholder for loading states.
export default function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-sm)', style }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'block',
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 37%, rgba(255,255,255,0.04) 63%)',
        backgroundSize: '200% 100%',
        animation: 'ds-shimmer 1.4s ease infinite',
        ...style,
      }}
    />
  );
}
