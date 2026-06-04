import React, { useState } from 'react';

// Interactive, collapsible project tree. Folders expand/collapse; every node
// shows a one-line description of what it is.
function Node({ node, depth }) {
  const isDir = node.type === 'dir';
  const [open, setOpen] = useState(depth < 1);
  const toggle = () => isDir && setOpen((o) => !o);

  return (
    <div>
      <div
        onClick={toggle}
        role={isDir ? 'button' : undefined}
        tabIndex={isDir ? 0 : undefined}
        aria-expanded={isDir ? open : undefined}
        onKeyDown={(e) => { if (isDir && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(); } }}
        style={{
          display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 8px',
          paddingLeft: 8 + depth * 18, borderRadius: 'var(--radius-sm)',
          cursor: isDir ? 'pointer' : 'default',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span aria-hidden="true" style={{ fontSize: 13, width: 16, flexShrink: 0, color: 'var(--accent-light)' }}>
          {isDir ? (open ? '▾' : '▸') : '·'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: isDir ? 700 : 500, color: isDir ? 'var(--text-primary)' : 'var(--text-secondary)', flexShrink: 0 }}>
          {node.name}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          — {node.desc}
        </span>
      </div>
      {isDir && open && node.children && (
        <div>
          {node.children.map((c) => <Node key={c.name} node={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ tree }) {
  return (
    <div style={{ background: 'var(--glass-bg-light)', border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
      <Node node={tree} depth={0} />
    </div>
  );
}
