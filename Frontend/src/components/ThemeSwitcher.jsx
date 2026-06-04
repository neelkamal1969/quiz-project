import React, { useState } from 'react';
import Modal from './ui/Modal';
import Icon3D from './ui/Icon3D';
import { useTheme, THEMES, FONTS, TEXT_SIZES } from '../context/ThemeContext';

const labelStyle = {
  fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em',
  color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 var(--space-3)',
};
const optionBtn = (active) => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 10px',
  borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--glass-bg)',
  border: `1.5px solid ${active ? 'var(--accent-indigo)' : 'var(--glass-border)'}`,
  boxShadow: active ? 'var(--shadow-glow)' : 'none', transition: 'all var(--dur)',
});
const segBtn = (active) => ({
  flex: 1, padding: '10px 8px', cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-sm)',
  color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
  background: active ? 'var(--grad-primary)' : 'transparent', border: 'none',
  transition: 'all var(--dur)',
});

// Floating appearance picker — color theme, font, text size, motion. Persists app-wide.
export default function ThemeSwitcher() {
  const { theme, font, textSize, reduceMotion, setTheme, setFont, setTextSize, toggleReduceMotion, reset } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Customize appearance"
        title="Theme & appearance"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 'var(--z-nav)',
          width: 50, height: 50, borderRadius: '50%', cursor: 'pointer',
          background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)',
          backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
          boxShadow: 'var(--shadow-md)', display: 'grid', placeItems: 'center',
        }}
      >
        <Icon3D code="🎨" size={22} pulse={false} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Customize appearance" maxWidth={480}>
        <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 4, margin: '0 -4px 0 0' }}>
          {/* Color theme */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <p style={labelStyle}>Color theme</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))', gap: 'var(--space-3)' }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => setTheme(key)} style={optionBtn(theme === key)} aria-pressed={theme === key}>
                  <span style={{ display: 'flex', gap: 4 }}>
                    {t.swatch.map((c, i) => <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c }} />)}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <p style={labelStyle}>Font</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))', gap: 'var(--space-3)' }}>
              {Object.entries(FONTS).map(([key, f]) => (
                <button key={key} onClick={() => setFont(key)} style={{ ...optionBtn(font === key), fontFamily: f.vars['--font-sans'] }} aria-pressed={font === key}>
                  <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', fontWeight: 800 }}>Aa</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text size — segmented control */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <p style={labelStyle}>Text size</p>
            <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--glass-border)' }}>
              {Object.entries(TEXT_SIZES).map(([key, s]) => (
                <button key={key} onClick={() => setTextSize(key)} style={segBtn(textSize === key)} aria-pressed={textSize === key}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reduce motion — toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
            <div>
              <p style={{ ...labelStyle, margin: 0 }}>Reduce motion</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '4px 0 0' }}>Minimize animations across the app</p>
            </div>
            <button
              onClick={toggleReduceMotion}
              role="switch"
              aria-checked={reduceMotion}
              aria-label="Reduce motion"
              style={{
                position: 'relative', width: 48, height: 28, flexShrink: 0, borderRadius: 'var(--radius-full)',
                cursor: 'pointer', border: '1.5px solid var(--glass-border)',
                background: reduceMotion ? 'var(--grad-primary)' : 'var(--glass-bg)', transition: 'all var(--dur)',
              }}
            >
              <span style={{
                position: 'absolute', top: 2, left: reduceMotion ? 22 : 2, width: 20, height: 20, borderRadius: '50%',
                background: '#fff', transition: 'left var(--dur) var(--ease-out)', boxShadow: 'var(--shadow-sm)',
              }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>Saved on this device, applies everywhere.</p>
            <button
              onClick={reset}
              style={{ background: 'none', border: 'none', color: 'var(--accent-light)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer', padding: '4px 6px' }}
            >
              Reset
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
