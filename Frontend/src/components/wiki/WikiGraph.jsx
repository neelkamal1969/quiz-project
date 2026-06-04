import React, { useMemo, useRef, useState, useCallback } from 'react';
import { GROUPS } from '../../lib/wikiData';

// Obsidian-style interactive dependency graph — hand-rolled, zero dependencies.
// A small force-directed layout (repulsion + link springs + centre gravity) is
// computed once; nodes are then draggable, hover highlights neighbours, and a
// click selects a node (surfaced to the parent for the detail panel).
const W = 1000;
const H = 720;

function computeLayout(nodes, links) {
  const pos = {};
  const n = nodes.length;
  nodes.forEach((nd, i) => {
    const a = (i / n) * 2 * Math.PI;
    pos[nd.id] = { x: W / 2 + Math.cos(a) * 280, y: H / 2 + Math.sin(a) * 240 };
  });
  for (let iter = 0; iter < 320; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pos[nodes[i].id], b = pos[nodes[j].id];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const rep = 2600 / (d * d);
        const fx = (dx / d) * rep, fy = (dy / d) * rep;
        a.x += fx; a.y += fy; b.x -= fx; b.y -= fy;
      }
    }
    links.forEach(([s, t]) => {
      const a = pos[s], b = pos[t];
      if (!a || !b) return;
      let dx = b.x - a.x, dy = b.y - a.y;
      let d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const att = (d - 95) * 0.012;
      const fx = (dx / d) * att, fy = (dy / d) * att;
      a.x += fx; a.y += fy; b.x -= fx; b.y -= fy;
    });
    nodes.forEach((nd) => {
      const p = pos[nd.id];
      p.x += (W / 2 - p.x) * 0.002;
      p.y += (H / 2 - p.y) * 0.002;
    });
  }
  // Clamp inside the viewBox with a margin.
  nodes.forEach((nd) => {
    const p = pos[nd.id];
    p.x = Math.max(40, Math.min(W - 40, p.x));
    p.y = Math.max(40, Math.min(H - 40, p.y));
  });
  return pos;
}

export default function WikiGraph({ nodes, links, onSelect, selectedId }) {
  const svgRef = useRef(null);
  const [pos, setPos] = useState(() => computeLayout(nodes, links));
  const [hoverId, setHoverId] = useState(null);
  const dragId = useRef(null);

  // Neighbour map for hover/selection highlighting.
  const neighbours = useMemo(() => {
    const m = {};
    nodes.forEach((nd) => { m[nd.id] = new Set([nd.id]); });
    links.forEach(([s, t]) => { m[s]?.add(t); m[t]?.add(s); });
    return m;
  }, [nodes, links]);

  const active = hoverId || selectedId;
  const isLit = (id) => !active || neighbours[active]?.has(id);

  const toSvg = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    };
  }, []);

  const onMove = useCallback((e) => {
    if (!dragId.current) return;
    const p = toSvg(e);
    setPos((prev) => ({ ...prev, [dragId.current]: { x: p.x, y: p.y } }));
  }, [toSvg]);

  const endDrag = useCallback(() => { dragId.current = null; }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', touchAction: 'none', display: 'block', borderRadius: 'var(--radius-lg)', background: 'var(--glass-bg-light)', border: '1.5px solid var(--glass-border)' }}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {/* Links */}
      {links.map(([s, t], i) => {
        const a = pos[s], b = pos[t];
        if (!a || !b) return null;
        const lit = !active || (neighbours[active]?.has(s) && neighbours[active]?.has(t));
        return (
          <line
            key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="var(--accent-light)"
            strokeOpacity={lit ? 0.35 : 0.06}
            strokeWidth={1}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map((nd) => {
        const p = pos[nd.id];
        if (!p) return null;
        const color = (GROUPS[nd.group] || {}).color || '#94a3b8';
        const lit = isLit(nd.id);
        const isSel = selectedId === nd.id;
        const r = isSel ? 11 : 7;
        return (
          <g
            key={nd.id}
            transform={`translate(${p.x}, ${p.y})`}
            style={{ cursor: 'pointer', opacity: lit ? 1 : 0.25, transition: 'opacity 0.2s' }}
            onPointerDown={(e) => { dragId.current = nd.id; e.target.setPointerCapture?.(e.pointerId); }}
            onClick={() => onSelect?.(nd)}
            onMouseEnter={() => setHoverId(nd.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            <circle r={r} fill={color} stroke={isSel ? '#fff' : 'rgba(0,0,0,0.4)'} strokeWidth={isSel ? 2 : 1} />
            <text
              x={r + 4} y={4}
              fontSize={12} fill="var(--text-secondary)" fontFamily="var(--font-sans)"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {nd.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
