import React, { useEffect, useRef } from 'react';

// Interactive holographic particle constellation.
// A fixed full-screen canvas that sits behind page content: particles drift,
// link to nearby neighbours, and react to the cursor (soft attraction + glowing
// links near the mouse). GPU-light 2D canvas, capped particle count, DPR-capped,
// and fully static under prefers-reduced-motion. pointer-events:none so it never
// blocks clicks.
export default function InteractiveBackdrop() {
  const canvasRef = useRef(null);
  const raf = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, particles = [];
    const palette = ['99,102,241', '14,165,233', '139,92,246', '217,70,239'];

    const resize = () => {
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const count = Math.min(72, Math.floor((window.innerWidth * window.innerHeight) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
        r: (1 + Math.random() * 1.8) * dpr,
        c: palette[(Math.random() * palette.length) | 0],
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => { mouse.current = { x: e.clientX * dpr, y: e.clientY * dpr }; };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);

    const LINK = 140 * dpr;
    const MOUSE = 190 * dpr;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const ps = particles;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const mdx = mouse.current.x - p.x;
        const mdy = mouse.current.y - p.y;
        const md = Math.hypot(mdx, mdy);
        if (md < MOUSE && md > 0.01) {
          p.x += (mdx / md) * 0.4 * dpr;
          p.y += (mdy / md) * 0.4 * dpr;
        }

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        glow.addColorStop(0, `rgba(${p.c},0.7)`);
        glow.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${p.c},${0.12 * (1 - d / LINK)})`;
            ctx.lineWidth = 0.8 * dpr;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        if (md < MOUSE) {
          ctx.strokeStyle = `rgba(${p.c},${0.4 * (1 - md / MOUSE)})`;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.current.x, mouse.current.y);
          ctx.stroke();
        }
      }
      if (!reduce) raf.current = requestAnimationFrame(draw);
    };

    draw(); // one frame (static if reduced-motion), otherwise starts the loop

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.9 }}
    />
  );
}
