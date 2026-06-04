import React, { useState, useEffect } from 'react';

// Floating "back to top" button — appears after scrolling down, smooth-scrolls
// to the top. Sits above the theme button in the bottom-right FAB stack.
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
      style={{
        position: 'fixed', bottom: 80, right: 20, zIndex: 'var(--z-nav)',
        width: 46, height: 46, borderRadius: '50%', cursor: 'pointer',
        background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--shadow-md)', display: 'grid', placeItems: 'center',
        color: 'var(--accent-light)',
        animation: 'ds-pop-in var(--dur) var(--ease-spring) both',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>↑</span>
    </button>
  );
}
