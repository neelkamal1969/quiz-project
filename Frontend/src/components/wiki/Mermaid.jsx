import React, { useEffect, useRef, useState } from 'react';

// Lazily loads the (heavy) mermaid library only when a diagram first renders, so
// it never touches the main app bundle. If mermaid isn't installed/available, it
// falls back to showing the diagram source instead of crashing the page.
let mermaidPromise = null;
const loadMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mod) => {
      const mermaid = mod.default || mod;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      });
      return mermaid;
    });
  }
  return mermaidPromise;
};

let counter = 0;

export default function Mermaid({ chart }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const id = `mmd-${++counter}`;
    loadMermaid()
      .then((mermaid) => mermaid.render(id, chart))
      .then(({ svg }) => { if (alive && ref.current) ref.current.innerHTML = svg; })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [chart]);

  if (failed) {
    return (
      <pre style={{
        overflowX: 'auto', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
        background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)',
        color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)',
      }}>{chart}</pre>
    );
  }

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Diagram"
      style={{
        display: 'flex', justifyContent: 'center', padding: 'var(--space-4)',
        background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)', overflowX: 'auto',
      }}
    />
  );
}
