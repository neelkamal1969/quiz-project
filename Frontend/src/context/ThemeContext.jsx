import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Each theme remaps the core color tokens. Because the entire app styles via
// var(--token), overriding these on :root re-themes everything consistently.
export const THEMES = {
  holographic: {
    name: 'Holographic',
    swatch: ['#6366f1', '#0ea5e9', '#d946ef'],
    vars: {
      '--accent-indigo': '#6366f1', '--accent-light': '#a5b4fc', '--accent-rgb': '99, 102, 241', '--accent-sky': '#0ea5e9', '--accent-violet': '#8b5cf6', '--accent-fuchsia': '#d946ef',
      '--grad-primary': 'linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #0ea5e9 100%)',
      '--grad-holo': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%, #0ea5e9 60%, #d946ef 100%)',
      '--grad-holo-soft': 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12), rgba(14,165,233,0.14), rgba(217,70,239,0.12))',
      '--grad-bg': 'radial-gradient(ellipse 80% 70% at 20% 10%, #1e3a8a22 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, #4f46e520 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 55% 40%, #0ea5e912 0%, transparent 55%), linear-gradient(160deg, #0a0f1e 0%, #0c1428 40%, #0f1729 100%)',
      '--shadow-glow': '0 4px 24px rgba(79,70,229,0.4)', '--shadow-glow-strong': '0 8px 36px rgba(79,70,229,0.55)', '--focus-ring': '0 0 0 3px rgba(99,102,241,0.45)',
    },
  },
  aurora: {
    name: 'Aurora',
    swatch: ['#10b981', '#22d3ee', '#38bdf8'],
    vars: {
      '--accent-indigo': '#10b981', '--accent-light': '#6ee7b7', '--accent-rgb': '16, 185, 129', '--accent-sky': '#22d3ee', '--accent-violet': '#14b8a6', '--accent-fuchsia': '#38bdf8',
      '--grad-primary': 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0ea5e9 100%)',
      '--grad-holo': 'linear-gradient(135deg, #10b981 0%, #14b8a6 30%, #22d3ee 60%, #38bdf8 100%)',
      '--grad-holo-soft': 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(20,184,166,0.12), rgba(34,211,238,0.14), rgba(56,189,248,0.12))',
      '--grad-bg': 'radial-gradient(ellipse 80% 70% at 20% 10%, #06402822 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, #0d948820 0%, transparent 60%), linear-gradient(160deg, #07120f 0%, #0a1614 40%, #0b1a18 100%)',
      '--shadow-glow': '0 4px 24px rgba(16,185,129,0.4)', '--shadow-glow-strong': '0 8px 36px rgba(16,185,129,0.55)', '--focus-ring': '0 0 0 3px rgba(16,185,129,0.45)',
    },
  },
  sunset: {
    name: 'Sunset',
    swatch: ['#fb7185', '#fb923c', '#d946ef'],
    vars: {
      '--accent-indigo': '#fb7185', '--accent-light': '#fda4af', '--accent-rgb': '244, 63, 94', '--accent-sky': '#fb923c', '--accent-violet': '#f43f5e', '--accent-fuchsia': '#d946ef',
      '--grad-primary': 'linear-gradient(135deg, #e11d48 0%, #f97316 50%, #f59e0b 100%)',
      '--grad-holo': 'linear-gradient(135deg, #fb7185 0%, #fb923c 35%, #f59e0b 65%, #d946ef 100%)',
      '--grad-holo-soft': 'linear-gradient(135deg, rgba(251,113,133,0.18), rgba(251,146,60,0.12), rgba(245,158,11,0.14), rgba(217,70,239,0.12))',
      '--grad-bg': 'radial-gradient(ellipse 80% 70% at 20% 10%, #7c2d1222 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, #be123c20 0%, transparent 60%), linear-gradient(160deg, #1a0e0a 0%, #1c100c 40%, #1a0f12 100%)',
      '--shadow-glow': '0 4px 24px rgba(244,63,94,0.4)', '--shadow-glow-strong': '0 8px 36px rgba(244,63,94,0.55)', '--focus-ring': '0 0 0 3px rgba(251,113,133,0.45)',
    },
  },
  cyber: {
    name: 'Cyber Neon',
    swatch: ['#22d3ee', '#a855f7', '#d946ef'],
    vars: {
      '--accent-indigo': '#22d3ee', '--accent-light': '#67e8f9', '--accent-rgb': '168, 85, 247', '--accent-sky': '#06b6d4', '--accent-violet': '#a855f7', '--accent-fuchsia': '#d946ef',
      '--grad-primary': 'linear-gradient(135deg, #0891b2 0%, #7c3aed 50%, #c026d3 100%)',
      '--grad-holo': 'linear-gradient(135deg, #22d3ee 0%, #a855f7 40%, #d946ef 70%, #f0abfc 100%)',
      '--grad-holo-soft': 'linear-gradient(135deg, rgba(34,211,238,0.18), rgba(168,85,247,0.14), rgba(217,70,239,0.14))',
      '--grad-bg': 'radial-gradient(ellipse 80% 70% at 20% 10%, #0e749022 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, #86198f20 0%, transparent 60%), linear-gradient(160deg, #08101a 0%, #0c0a1e 40%, #100a1c 100%)',
      '--shadow-glow': '0 4px 24px rgba(168,85,247,0.45)', '--shadow-glow-strong': '0 8px 36px rgba(217,70,239,0.55)', '--focus-ring': '0 0 0 3px rgba(34,211,238,0.45)',
    },
  },
  royal: {
    name: 'Royal',
    swatch: ['#8b5cf6', '#6366f1', '#f59e0b'],
    vars: {
      '--accent-indigo': '#8b5cf6', '--accent-light': '#c4b5fd', '--accent-rgb': '124, 58, 237', '--accent-sky': '#a78bfa', '--accent-violet': '#7c3aed', '--accent-fuchsia': '#f59e0b',
      '--grad-primary': 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #4f46e5 100%)',
      '--grad-holo': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 35%, #a78bfa 65%, #f59e0b 100%)',
      '--grad-holo-soft': 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(99,102,241,0.12), rgba(245,158,11,0.12))',
      '--grad-bg': 'radial-gradient(ellipse 80% 70% at 20% 10%, #4c1d9522 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, #5b21b620 0%, transparent 60%), linear-gradient(160deg, #0e0a1a 0%, #120b20 40%, #140d22 100%)',
      '--shadow-glow': '0 4px 24px rgba(124,58,237,0.4)', '--shadow-glow-strong': '0 8px 36px rgba(124,58,237,0.55)', '--focus-ring': '0 0 0 3px rgba(139,92,246,0.45)',
    },
  },
  crimson: {
    name: 'Crimson',
    swatch: ['#f43f5e', '#fb7185', '#f472b6'],
    vars: {
      '--accent-indigo': '#f43f5e', '--accent-light': '#fda4af', '--accent-rgb': '244, 63, 94', '--accent-sky': '#fb7185', '--accent-violet': '#e11d48', '--accent-fuchsia': '#f472b6',
      '--grad-primary': 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
      '--grad-holo': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 35%, #f472b6 65%, #e11d48 100%)',
      '--grad-holo-soft': 'linear-gradient(135deg, rgba(244,63,94,0.18), rgba(251,113,133,0.12), rgba(244,114,182,0.14), rgba(225,29,72,0.12))',
      '--grad-bg': 'radial-gradient(ellipse 80% 70% at 20% 10%, #88133722 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, #9f123920 0%, transparent 60%), linear-gradient(160deg, #160a0e 0%, #1a0b10 40%, #1c0d12 100%)',
      '--shadow-glow': '0 4px 24px rgba(244,63,94,0.42)', '--shadow-glow-strong': '0 8px 36px rgba(244,63,94,0.55)', '--focus-ring': '0 0 0 3px rgba(244,63,94,0.45)',
    },
  },
  ocean: {
    name: 'Ocean',
    swatch: ['#3b82f6', '#0ea5e9', '#22d3ee'],
    vars: {
      '--accent-indigo': '#3b82f6', '--accent-light': '#93c5fd', '--accent-rgb': '59, 130, 246', '--accent-sky': '#0ea5e9', '--accent-violet': '#2563eb', '--accent-fuchsia': '#06b6d4',
      '--grad-primary': 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0ea5e9 100%)',
      '--grad-holo': 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 40%, #22d3ee 70%, #38bdf8 100%)',
      '--grad-holo-soft': 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(14,165,233,0.12), rgba(34,211,238,0.14), rgba(56,189,248,0.12))',
      '--grad-bg': 'radial-gradient(ellipse 80% 70% at 20% 10%, #0c388122 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, #0e749020 0%, transparent 60%), linear-gradient(160deg, #07101e 0%, #08152a 40%, #0a1830 100%)',
      '--shadow-glow': '0 4px 24px rgba(59,130,246,0.42)', '--shadow-glow-strong': '0 8px 36px rgba(59,130,246,0.55)', '--focus-ring': '0 0 0 3px rgba(59,130,246,0.45)',
    },
  },
  mono: {
    name: 'Monochrome',
    swatch: ['#cbd5e1', '#94a3b8', '#64748b'],
    vars: {
      '--accent-indigo': '#94a3b8', '--accent-light': '#cbd5e1', '--accent-rgb': '148, 163, 184', '--accent-sky': '#cbd5e1', '--accent-violet': '#64748b', '--accent-fuchsia': '#e2e8f0',
      '--grad-primary': 'linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%)',
      '--grad-holo': 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 40%, #e2e8f0 70%, #64748b 100%)',
      '--grad-holo-soft': 'linear-gradient(135deg, rgba(148,163,184,0.16), rgba(100,116,139,0.12), rgba(203,213,225,0.14), rgba(226,232,240,0.10))',
      '--grad-bg': 'radial-gradient(ellipse 80% 70% at 20% 10%, #1e293b22 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, #33415520 0%, transparent 60%), linear-gradient(160deg, #0a0e16 0%, #0d121c 40%, #0f1420 100%)',
      '--shadow-glow': '0 4px 24px rgba(148,163,184,0.32)', '--shadow-glow-strong': '0 8px 36px rgba(148,163,184,0.42)', '--focus-ring': '0 0 0 3px rgba(148,163,184,0.45)',
    },
  },
};

// Font choices use already-available / system stacks (no extra network loads → reliable).
export const FONTS = {
  default: { name: 'Default', vars: { '--font-sans': "'DM Sans', 'Segoe UI', system-ui, sans-serif", '--font-display': "'Syne', 'DM Sans', sans-serif" } },
  system: { name: 'System', vars: { '--font-sans': "system-ui, -apple-system, 'Segoe UI', sans-serif", '--font-display': "system-ui, -apple-system, sans-serif" } },
  elegant: { name: 'Elegant', vars: { '--font-sans': "Georgia, 'Times New Roman', serif", '--font-display': "Georgia, serif" } },
  rounded: { name: 'Rounded', vars: { '--font-sans': "'Trebuchet MS', 'Segoe UI', system-ui, sans-serif", '--font-display': "'Trebuchet MS', system-ui, sans-serif" } },
};

// Text size scales the root font-size; rem-based type across the app follows.
export const TEXT_SIZES = {
  compact: { name: 'Compact', value: '93.75%' },
  default: { name: 'Default', value: '100%' },
  large: { name: 'Large', value: '112.5%' },
};

const STORAGE_KEY = 'studyai_appearance';
const DEFAULT_PREF = { theme: 'holographic', font: 'default', textSize: 'default', reduceMotion: false };
const ThemeContext = createContext(null);

// Apply the full appearance preference by writing CSS variables / attributes
// onto :root. Everything is token-driven, so this re-themes the whole app.
export function applyAppearance(pref) {
  const root = document.documentElement;
  const t = THEMES[pref.theme] || THEMES.holographic;
  const f = FONTS[pref.font] || FONTS.default;
  Object.entries({ ...t.vars, ...f.vars }).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.fontSize = (TEXT_SIZES[pref.textSize] || TEXT_SIZES.default).value;
  // Force-reduce motion regardless of OS setting when the user opts in.
  if (pref.reduceMotion) root.setAttribute('data-motion', 'reduced');
  else root.removeAttribute('data-motion');
}

export function ThemeProvider({ children }) {
  const [pref, setPref] = useState(() => {
    try {
      return { ...DEFAULT_PREF, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
    } catch {
      return DEFAULT_PREF;
    }
  });

  useEffect(() => {
    applyAppearance(pref);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pref)); } catch { /* storage disabled */ }
  }, [pref]);

  const setTheme = useCallback((theme) => setPref((p) => ({ ...p, theme })), []);
  const setFont = useCallback((font) => setPref((p) => ({ ...p, font })), []);
  const setTextSize = useCallback((textSize) => setPref((p) => ({ ...p, textSize })), []);
  const toggleReduceMotion = useCallback(() => setPref((p) => ({ ...p, reduceMotion: !p.reduceMotion })), []);
  const reset = useCallback(() => setPref(DEFAULT_PREF), []);

  return (
    <ThemeContext.Provider value={{ ...pref, setTheme, setFont, setTextSize, toggleReduceMotion, reset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
