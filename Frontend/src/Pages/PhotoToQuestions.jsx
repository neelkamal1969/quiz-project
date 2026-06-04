import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { getToken, getUser } from '../lib/auth';
import { ENDPOINTS, ROUTES } from '../lib/constants';
import { useToast } from '../context/ToastContext';
import Icon3D from '../components/ui/Icon3D';

// ─────────────────────────────────────────────────────────────────────────────
// SAFE AUTH HELPER
// ─────────────────────────────────────────────────────────────────────────────

function isLoggedIn() {
  return !!(getToken() && getUser()?.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL ALGORITHMS
// ─────────────────────────────────────────────────────────────────────────────

const BLOOMS = [
  { level: 'Remember',   color: '#818cf8', bg: 'rgba(var(--accent-rgb),0.16)',  keywords: ['define','list','recall','name','identify','state','describe','recognize','repeat','locate','match','select'] },
  { level: 'Understand', color: '#38bdf8', bg: 'rgba(14,165,233,0.16)',  keywords: ['explain','summarize','paraphrase','classify','compare','interpret','predict','infer','translate','discuss','outline'] },
  { level: 'Apply',      color: '#34d399', bg: 'rgba(16,185,129,0.16)',  keywords: ['use','solve','demonstrate','calculate','operate','execute','implement','apply','show','illustrate','compute'] },
  { level: 'Analyze',    color: '#fbbf24', bg: 'rgba(245,158,11,0.16)', keywords: ['analyze','differentiate','examine','break','contrast','distinguish','question','test','inspect','deconstruct'] },
  { level: 'Evaluate',   color: '#fb7185', bg: 'rgba(239,68,68,0.16)',  keywords: ['evaluate','judge','justify','critique','assess','argue','defend','prioritize','rank','appraise','rate'] },
  { level: 'Create',     color: '#c084fc', bg: 'rgba(168,85,247,0.16)', keywords: ['create','design','compose','construct','plan','produce','generate','formulate','develop','invent','propose'] },
];

function classifyQuestion(q) {
  const lower = q.toLowerCase();
  for (const b of BLOOMS) if (b.keywords.some((k) => lower.includes(k))) return b;
  return BLOOMS[1];
}

function fleschKincaid(text) {
  const sentences = Math.max(1, text.split(/[.!?]+/).filter((s) => s.trim().length > 3).length);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wc = Math.max(1, words.length);
  const syllables = words.reduce((a, w) => a + cntSyl(w), 0);
  const score = Math.max(0, Math.min(100, 206.835 - 1.015 * (wc / sentences) - 84.6 * (syllables / wc)));
  const s = Math.round(score);
  const [label, color] =
    s >= 70 ? ['Easy', '#34d399'] :
    s >= 50 ? ['Moderate', '#fbbf24'] :
    s >= 30 ? ['Difficult', '#fb7185'] :
              ['Very Hard', '#c084fc'];
  return { score: s, label, color, wordCount: wc, sentenceCount: sentences };
}

function cntSyl(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

function extractKeywords(text, n = 20) {
  const stop = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','have','has','had','do','does','did','will','would','could','should','that','this','these','those','it','its','as','if','not','also','more','most','some','such','than','then','so','yet','their','there','they','them','we','our','your','my','his','her','he','she','i','you','any','all','when','where','which','who','how','what','just','into','about']);
  const words = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !stop.has(w));
  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(([word, count]) => ({ word, count }));
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN GATE — shown when user is not authenticated
// ─────────────────────────────────────────────────────────────────────────────

function LoginGate() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-sans)' }}>
      <div style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', padding: '48px 40px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ marginBottom: 16 }}><Icon3D code="🔐" size={48} /></div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px', fontFamily: 'var(--font-display)' }}>Login Required</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65, margin: '0 0 28px' }}>
          Image OCR and AI question generation requires a user account so your questions can be personalised and saved to your vault.
        </p>
        <Link to={ROUTES.LOGIN} style={{ display: 'inline-block', background: 'var(--grad-primary)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '12px 32px', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: 'var(--shadow-glow)' }}>
          Sign in →
        </Link>
        <p style={{ margin: '16px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
          No account? <Link to={ROUTES.SIGNUP} style={{ color: 'var(--accent-light)', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG CHARTS
// ─────────────────────────────────────────────────────────────────────────────

function BloomSunburst({ data }) {
  const [hov, setHov] = useState(null);
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const cx = 100, cy = 100, r1 = 34, r2 = 82;
  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.count / total) * 2 * Math.PI;
    const a1 = angle, a2 = angle + sweep;
    angle = a2;
    const lg = sweep > Math.PI ? 1 : 0;
    const mk = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x1, y1] = mk(r2, a1), [x2, y2] = mk(r2, a2), [x3, y3] = mk(r1, a2), [x4, y4] = mk(r1, a1);
    const mid = a1 + sweep / 2;
    const [lx, ly] = mk((r1 + r2) / 2, mid);
    return { ...d, path: `M${x1},${y1} A${r2},${r2} 0 ${lg} 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 ${lg} 0 ${x4},${y4} Z`, mid, sweep, lx, ly };
  });
  return (
    <svg width="200" height="220" viewBox="0 0 200 220" style={{ overflow: 'visible', flexShrink: 0 }}>
      {slices.map((s, i) => (
        <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'pointer' }}>
          <path d={s.path} fill={s.color} opacity={hov === null ? 0.85 : hov === i ? 1 : 0.25} stroke="#0a0f1e" strokeWidth="2"
            style={{ transition: 'opacity 0.18s', transformOrigin: `${cx}px ${cy}px`, transform: hov === i ? 'scale(1.05)' : 'scale(1)' }} />
          {s.sweep > 0.45 && <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>{s.count}</text>}
        </g>
      ))}
      <circle cx={cx} cy={cy} r={r1 - 1} fill="#0f172a" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="700">TOTAL</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#f1f5f9" fontSize="17" fontWeight="900">{total}</text>
      {hov !== null && (
        <g>
          <rect x={cx - 50} y={cy + r2 + 8} width="100" height="32" rx="7" fill={slices[hov].color} />
          <text x={cx} y={cy + r2 + 20} textAnchor="middle" fill="#0a0f1e" fontSize="10" fontWeight="800">{slices[hov].level}</text>
          <text x={cx} y={cy + r2 + 32} textAnchor="middle" fill="rgba(10,15,30,.7)" fontSize="9">{slices[hov].count} question{slices[hov].count !== 1 ? 's' : ''}</text>
        </g>
      )}
    </svg>
  );
}

function WordCloud({ keywords }) {
  if (!keywords.length) return null;
  const max = keywords[0].count;
  const COLS = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#c084fc', '#22d3ee', '#fb923c'];
  const W = 480, H = 160;
  const placed = [];
  keywords.forEach(({ word, count }, i) => {
    const fs = 11 + Math.round((count / max) * 20);
    const aw = word.length * fs * 0.55;
    let x = W / 2, y = H / 2, t = 0;
    while (t < 250) {
      x = W / 2 + t * 1.8 * Math.cos(t * 0.44) - aw / 2;
      y = H / 2 + t * 0.78 * Math.sin(t * 0.44);
      if (x > 4 && x + aw < W - 4 && y > fs && y < H - 4 && !placed.some((p) => Math.abs(p.x - x) < (p.w + aw) / 2 + 2 && Math.abs(p.y - y) < p.fs + 2)) break;
      t += 0.55;
    }
    placed.push({ word, fs, x, y, w: aw, color: COLS[i % COLS.length] });
  });
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {placed.map(({ word, fs, x, y, color }, i) => (
        <text key={word} x={x} y={y} fontSize={fs} fill={color} fontWeight={fs > 26 ? '800' : '600'}
          style={{ fontFamily: 'var(--font-sans)', opacity: 0, animation: `wcFade 0.4s ${i * 0.03}s forwards` }}>
          {word}
        </text>
      ))}
    </svg>
  );
}

function ReadabilityGauge({ score, label, color }) {
  const cx = 80, cy = 72, r = 54;
  const rad = ((score / 100 * 180 - 90) * Math.PI / 180);
  const fx = cx + r * Math.cos(rad), fy = cy + r * Math.sin(rad);
  const lg = score / 100 * 180 > 180 ? 1 : 0;
  return (
    <svg width="160" height="96" viewBox="0 0 160 96">
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="11" strokeLinecap="round" />
      <path d={`M${cx - r},${cy} A${r},${r} 0 ${lg} 1 ${fx},${fy}`} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={fx} y2={fy} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4.5" fill={color} />
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#f1f5f9" fontSize="20" fontWeight="900">{score}</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill={color} fontSize="8" fontWeight="800" letterSpacing="1">{label.toUpperCase()}</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRACTICE MODE — flip cards overlay (already dark-friendly: white flashcards)
// ─────────────────────────────────────────────────────────────────────────────

function PracticeMode({ cards, onClose }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const total = cards.length;
  const next = () => { setFlipped(false); setTimeout(() => setIdx((i) => (i + 1) % total), 130); };
  const prev = () => { setFlipped(false); setTimeout(() => setIdx((i) => (i - 1 + total) % total), 130); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', background: 'rgba(6,9,18,0.88)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Practice Mode</span>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>{idx + 1} / {total}</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', borderRadius: 8, padding: '5px 13px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✕ Exit</button>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,.1)', borderRadius: 99, marginBottom: 22, overflow: 'hidden' }}>
          <div style={{ height: 3, width: `${((idx + 1) / total) * 100}%`, background: 'var(--grad-primary)', borderRadius: 99, transition: 'width 0.3s ease' }} />
        </div>
        <div
          onClick={() => setFlipped((v) => !v)}
          role="button"
          tabIndex={0}
          aria-label="Flip card to reveal the answer"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((v) => !v); } }}
          style={{ cursor: 'pointer', height: 290, marginBottom: 22, perspective: '1000px' }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.52s cubic-bezier(0.22,1,0.36,1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: 'linear-gradient(145deg, rgba(22,30,54,0.98) 0%, rgba(12,18,36,0.98) 100%)', border: '1.5px solid var(--glass-border)', borderRadius: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 18 }}>Question</span>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.65, margin: 0, maxHeight: 180, overflowY: 'auto' }}>{cards[idx]?.question}</p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 20, fontWeight: 600 }}>tap to reveal answer ▼</span>
            </div>
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(12,18,36,0.96))', border: '2px solid rgba(52,211,153,0.4)', borderRadius: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 18 }}>Answer</span>
              <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.78, margin: 0, maxHeight: 180, overflowY: 'auto' }}>{cards[idx]?.answer}</p>
              <span style={{ fontSize: 11, color: '#6ee7b7', marginTop: 16, fontWeight: 600 }}>tap to flip back ▲</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={prev} style={{ flex: 1, padding: '12px 0', background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.14)', color: '#fff', borderRadius: 13, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>← Prev</button>
          <button onClick={next} style={{ flex: 1, padding: '12px 0', background: 'var(--grad-primary)', border: 'none', color: '#fff', borderRadius: 13, fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}>Next →</button>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.25)', fontSize: 11, marginTop: 13 }}>Click card to flip · arrows to navigate</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS WIDGET — collapsed by default
// ─────────────────────────────────────────────────────────────────────────────

function AnalyticsWidget({ questions, ocrText }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('bloom');

  const enriched = useMemo(() => questions.map((q) => ({ ...q, bloom: classifyQuestion(q.question) })), [questions]);
  const bloomCounts = useMemo(() => {
    const map = {};
    BLOOMS.forEach((b) => { map[b.level] = 0; });
    enriched.forEach((q) => { map[q.bloom.level]++; });
    return BLOOMS.map((b) => ({ ...b, count: map[b.level] || 0 })).filter((b) => b.count > 0);
  }, [enriched]);
  const readability = useMemo(() => (ocrText ? fleschKincaid(ocrText) : null), [ocrText]);
  const keywords = useMemo(() => (ocrText ? extractKeywords(ocrText) : []), [ocrText]);

  return (
    <div className="glass-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      <div onClick={() => setOpen((v) => !v)} role="button" tabIndex={0} aria-expanded={open} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); } }} style={{ padding: '11px 17px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon3D code="📊" size={16} /> Analytics</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {bloomCounts.map((b) => <div key={b.level} title={`${b.level}: ${b.count}`} style={{ width: 9, height: 9, borderRadius: '50%', background: b.color, opacity: 0.85 }} />)}
          </div>
          {readability && <span style={{ fontSize: 11, fontWeight: 800, color: readability.color, background: `${readability.color}22`, padding: '2px 8px', borderRadius: 99 }}>{readability.label} read</span>}
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{questions.length} Qs · {open ? 'collapse' : 'expand'}</span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'inline-block', transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </div>

      <div style={{ maxHeight: open ? 600 : 0, overflow: 'hidden', transition: 'max-height .42s cubic-bezier(.22,1,.36,1)' }}>
        <div style={{ borderTop: '1px solid var(--glass-border)', padding: '14px 18px 18px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {[['bloom', "🎯 Bloom's"], ['cloud', '☁️ Keywords'], ['read', '📖 Readability']].map(([id, lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: '5px 13px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800,
                background: tab === id ? 'var(--grad-primary)' : 'var(--glass-bg)',
                color: tab === id ? '#fff' : 'var(--text-secondary)',
                boxShadow: tab === id ? 'var(--shadow-glow)' : 'none', transition: 'all .17s',
              }}>{lbl}</button>
            ))}
          </div>

          {tab === 'bloom' && (
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <BloomSunburst data={bloomCounts} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.1 }}>Cognitive breakdown</p>
                {bloomCounts.map((b) => (
                  <div key={b.level} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: b.color, fontWeight: 800 }}>{b.level}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.count}/{questions.length}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: 4, width: `${(b.count / questions.length) * 100}%`, background: b.color, borderRadius: 99, transition: 'width .7s cubic-bezier(.22,1,.36,1)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'cloud' && (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 10 }}>Top keywords from image text</p>
              <div style={{ background: 'var(--glass-bg-light)', borderRadius: 12, padding: '10px 6px', border: '1px solid var(--glass-border)' }}>
                <WordCloud keywords={keywords} />
              </div>
            </div>
          )}

          {tab === 'read' && readability && (
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              <ReadabilityGauge {...readability} />
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 10 }}>Flesch-Kincaid</p>
                {[['Words', readability.wordCount], ['Sentences', readability.sentenceCount], ['Avg words/sentence', Math.round(readability.wordCount / readability.sentenceCount)], ['Score', `${readability.score}/100`], ['Level', readability.label]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 14, marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 175 }}>{k}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 800 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION CARD
// ─────────────────────────────────────────────────────────────────────────────

function QuestionCard({ item, index, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const bloom = item.bloom || classifyQuestion(item.question);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saved || saving) return;
    const user = getUser();
    if (!user) { toast.error('Please log in to save cards to your vault.'); return; }
    setSaving(true);
    try {
      await api.post(ENDPOINTS.SAVE_CARD, { userId: user.id, question: item.question, answer: item.answer });
      setSaved(true);
    } catch { toast.error('Could not save to vault.'); }
    finally { setSaving(false); }
  };

  return (
    <div onClick={() => setOpen((v) => !v)} className="q-card" style={{
      background: saved ? 'linear-gradient(135deg,rgba(16,185,129,.16),var(--glass-bg))' : 'var(--glass-bg)',
      border: saved ? '1.5px solid rgba(52,211,153,.4)' : '1.5px solid var(--glass-border)',
      borderRadius: 17, padding: '14px 16px 11px', marginBottom: 10,
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      boxShadow: saved ? '0 3px 18px rgba(16,185,129,.12)' : 'var(--shadow-sm)',
      cursor: 'pointer', transition: 'box-shadow .22s, border-color .22s, background .3s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 9px', borderRadius: 99, background: bloom.bg, color: bloom.color, border: `1px solid ${bloom.color}40`, textTransform: 'uppercase', letterSpacing: 0.7 }}>{bloom.level}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>#{index + 1}</span>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <button onClick={handleSave} disabled={saved || saving} style={{
            padding: '4px 11px', borderRadius: 9, border: 'none',
            cursor: saved ? 'default' : saving ? 'wait' : 'pointer', fontSize: 12, fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: 4, transition: 'all .32s cubic-bezier(.22,1,.36,1)',
            background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(var(--accent-rgb),.18)',
            color: saved ? '#fff' : 'var(--accent-light)',
            boxShadow: saved ? '0 2px 10px rgba(16,185,129,.28)' : 'none',
            transform: saved ? 'scale(1.03)' : 'scale(1)',
          }}>
            {saving ? <><span className="mini-spin" />Saving…</> : saved ? <>✓ Saved</> : <><Icon3D code="🔒" size={13} /> Save</>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="icon-btn" title="Edit"><Icon3D code="✏" size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="icon-btn" title="Delete"><Icon3D code="🗑" size={14} /></button>
        </div>
      </div>

      <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, lineHeight: 1.62, margin: 0 }}>{item.question}</p>

      <div style={{ overflow: 'hidden', maxHeight: open ? 600 : 0, opacity: open ? 1 : 0, transition: 'max-height .34s cubic-bezier(.22,1,.36,1),opacity .22s ease' }}>
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${bloom.color}33` }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8, margin: 0, borderLeft: `3px solid ${bloom.color}`, paddingLeft: 11 }}>{item.answer}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.8 }}>
        {open ? '▲ COLLAPSE' : '▼ VIEW ANSWER'}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function EditModal({ item, onSave, onClose }) {
  const [q, setQ] = useState(item.question);
  const [a, setA] = useState(item.answer);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', background: 'rgba(6,9,18,.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--bg-700)', border: '1.5px solid var(--glass-border)', borderRadius: 22, padding: '28px 28px 24px', width: '100%', maxWidth: 540, boxShadow: 'var(--shadow-lg)' }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 17, fontWeight: 900, fontFamily: 'var(--font-display)' }}>Edit Question</h3>
        <label style={LBL}>Question</label>
        <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={3} className="edit-ta" />
        <label style={{ ...LBL, marginTop: 13 }}>Answer</label>
        <textarea value={a} onChange={(e) => setA(e.target.value)} rows={5} className="edit-ta" />
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button style={BTN_P} onClick={() => onSave(q, a)}>✓ Save Changes</button>
          <button style={BTN_G} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
const LBL = { display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 };
const BTN_P = { flex: 1, background: 'var(--grad-primary)', color: '#fff', border: 'none', borderRadius: 11, padding: '11px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-glow)' };
const BTN_G = { flex: 1, background: 'var(--glass-bg)', color: 'var(--text-secondary)', border: '1.5px solid var(--glass-border)', borderRadius: 11, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' };

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function PhotoToQuestions() {
  const loggedIn = isLoggedIn();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [showOcr, setShowOcr] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [practiceMode, setPracticeMode] = useState(false);
  const fileRef = useRef();

  const enriched = useMemo(() => questions.map((q) => ({ ...q, bloom: classifyQuestion(q.question) })), [questions]);
  const displayed = useMemo(() => {
    let list = enriched.filter((q) => {
      const ms = !searchQ || q.question.toLowerCase().includes(searchQ.toLowerCase()) || q.answer.toLowerCase().includes(searchQ.toLowerCase());
      const ml = filterLevel === 'All' || q.bloom.level === filterLevel;
      return ms && ml;
    });
    if (sortBy === 'asc') list = [...list].sort((a, b) => a.question.localeCompare(b.question));
    if (sortBy === 'desc') list = [...list].sort((a, b) => b.question.localeCompare(a.question));
    if (sortBy === 'level') list = [...list].sort((a, b) => BLOOMS.findIndex((bl) => bl.level === a.bloom.level) - BLOOMS.findIndex((bl) => bl.level === b.bloom.level));
    return list;
  }, [enriched, searchQ, filterLevel, sortBy]);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!isLoggedIn()) { toast.error('Please log in to generate questions from an image.'); return; }

    setLoading(true); setQuestions([]); setOcrText(''); setEditedText(''); setShowOcr(false);

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    const img = new Image();
    img.onload = () => setImageMeta({ name: file.name, size: (file.size / 1024).toFixed(1), width: img.width, height: img.height });
    img.src = url;

    const user = getUser();

    try {
      setProgress('Reading image text…'); setProgressPct(10);
      // Lazy-load the heavy OCR engine only when the user actually runs OCR.
      const { default: Tesseract } = await import('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => { if (m.status === 'recognizing text') setProgressPct(10 + Math.round(m.progress * 55)); },
      });

      if (!text.trim()) { toast.error('No text found in image. Try a clearer photo.'); setLoading(false); return; }

      setOcrText(text); setEditedText(text); setProgressPct(65);
      setProgress('AI is generating questions…');

      api.post(ENDPOINTS.LOG_SEARCH, { email: user.email, topic: 'Image text' }).catch(() => {});

      const data = await api.post(ENDPOINTS.PAGE, { pageText: text, userId: user.id });
      setProgressPct(95);
      setQuestions(data);
      setProgressPct(100);
    } catch (err) {
      console.error('Process Error:', err);
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false); setProgress(''); setProgressPct(0);
    }
  }, [toast]);

  const regenFromEdit = async () => {
    if (!editedText.trim() || !isLoggedIn()) return;
    setLoading(true); setQuestions([]); setProgress('Re-generating…'); setProgressPct(30);
    const user = getUser();
    try {
      const data = await api.post(ENDPOINTS.PAGE, { pageText: editedText, userId: user.id });
      setProgressPct(90);
      setQuestions(data);
    } catch (err) { toast.error('Error: ' + err.message); }
    finally { setLoading(false); setProgress(''); setProgressPct(0); }
  };

  const deleteQ = (i) => setQuestions(questions.filter((_, idx) => idx !== i));
  const saveEdit = (i, q, a) => { const u = [...questions]; u[i] = { ...u[i], question: q, answer: a }; setQuestions(u); setEditingIdx(null); };
  const hasQ = questions.length > 0;

  return (
    <>
      <style>{CSS}</style>

      <div aria-hidden="true" className="blob-bg">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
        <header style={{ padding: '20px 26px 16px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(10,15,30,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-.4px', fontFamily: 'var(--font-display)' }}><Icon3D code="📸" size={20} /> Image → Study Guide</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '3px 0 0' }}>Upload a textbook photo · OCR · AI questions · analysis</p>
            </div>
            {hasQ && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setPracticeMode(true)} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 15px', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 12px rgba(245,158,11,.28)' }}>
                  <Icon3D code="🃏" size={16} /> Practice ({questions.length})
                </button>
                <div style={{ background: 'var(--grad-primary)', color: '#fff', borderRadius: 99, padding: '5px 15px', fontSize: 13, fontWeight: 800, boxShadow: 'var(--shadow-glow)' }}>
                  {questions.length} questions
                </div>
              </div>
            )}
          </div>
        </header>

        {!loggedIn ? <LoginGate /> : (
          <div style={{ maxWidth: 840, margin: '0 auto', padding: '22px 20px 60px' }}>
            <div className={`drop-zone${dragOver ? ' dz-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
              onClick={() => !loading && fileRef.current.click()}
            >
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={(e) => processFile(e.target.files[0])} disabled={loading} accept="image/*" />

              {loading ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="big-spin" />
                  <p style={{ color: 'var(--accent-light)', fontWeight: 800, margin: '12px 0 8px', fontSize: 14 }}>{progress}</p>
                  <div style={{ height: 5, background: 'var(--glass-border)', borderRadius: 99, width: 240, margin: '0 auto', overflow: 'hidden' }}>
                    <div style={{ height: 5, width: `${progressPct}%`, background: 'var(--grad-primary)', borderRadius: 99, transition: 'width .35s ease' }} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 5 }}>{progressPct}%</p>
                </div>
              ) : imagePreview ? (
                <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <img src={imagePreview} alt="preview" style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }} />
                  <div>
                    {imageMeta && <>
                      <p style={{ fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', fontSize: 14 }}>{imageMeta.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '2px 0' }}>{imageMeta.width}×{imageMeta.height}px · {imageMeta.size} KB</p>
                    </>}
                    <span style={{ fontSize: 12, color: 'var(--accent-light)', fontWeight: 700, marginTop: 6, display: 'inline-block' }}>↻ Click or drop to replace</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: 8 }}><Icon3D code="📷" size={40} /></div>
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 700, margin: 0, fontSize: 14 }}>Drop image here or click to browse</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>JPG · PNG · WEBP · HEIC</p>
                </div>
              )}
            </div>

            {ocrText && (
              <div className="glass-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
                <div role="button" tabIndex={0} aria-expanded={showOcr} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowOcr((v) => !v); } }} style={{ padding: '11px 17px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowOcr((v) => !v)}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon3D code="📄" size={16} /> Extracted Text</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ocrText.trim().split(/\s+/).length} words</span>
                    <span style={{ color: 'var(--text-muted)', display: 'inline-block', transition: 'transform .3s', transform: showOcr ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                  </div>
                </div>
                <div style={{ maxHeight: showOcr ? 420 : 0, overflow: 'hidden', transition: 'max-height .38s cubic-bezier(.22,1,.36,1)' }}>
                  <div style={{ padding: '0 17px 17px', borderTop: '1px solid var(--glass-border)' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '10px 0 7px' }}>Edit if OCR was imperfect, then re-generate.</p>
                    <textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} rows={6} className="edit-ta" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <button style={BTN_P} onClick={regenFromEdit} disabled={loading}>↺ Re-generate with edits</button>
                      <button style={BTN_G} onClick={() => setEditedText(ocrText)}>Reset</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasQ && <AnalyticsWidget questions={questions} ocrText={ocrText} />}

            {hasQ && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <input aria-label="Search questions and answers" placeholder="Search questions & answers…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="filter-input" style={{ flex: 1, minWidth: 140 }} />
                <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="filter-select">
                  <option value="All">All Levels</option>
                  {BLOOMS.map((b) => <option key={b.level} value={b.level}>{b.level}</option>)}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                  <option value="default">Default</option>
                  <option value="asc">A → Z</option>
                  <option value="desc">Z → A</option>
                  <option value="level">By Level</option>
                </select>
                <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>{displayed.length}/{questions.length}</span>
              </div>
            )}

            {displayed.map((q) => {
              const realIdx = questions.findIndex((o) => o.question === q.question);
              return <QuestionCard key={realIdx + '-' + q.question.slice(0, 18)} item={q} index={realIdx} onDelete={() => deleteQ(realIdx)} onEdit={() => setEditingIdx(realIdx)} />;
            })}

            {hasQ && displayed.length === 0 && (
              <div style={{ textAlign: 'center', padding: '42px 0', color: 'var(--text-muted)', fontSize: 14 }}>No questions match your filter.</div>
            )}

            {loading && !hasQ && [1, 2, 3].map((i) => (
              <div key={i} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '15px 17px', marginBottom: 10, animation: 'shimmer 1.4s ease-in-out infinite' }}>
                <div style={{ height: 11, borderRadius: 6, background: 'rgba(255,255,255,.10)', width: '50%', marginBottom: 9 }} />
                <div style={{ height: 8, borderRadius: 6, background: 'rgba(255,255,255,.07)', width: '80%' }} />
                <div style={{ height: 8, borderRadius: 6, background: 'rgba(255,255,255,.05)', width: '62%', marginTop: 5 }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {practiceMode && hasQ && <PracticeMode cards={enriched} onClose={() => setPracticeMode(false)} />}
      {editingIdx !== null && <EditModal item={questions[editingIdx]} onSave={(q, a) => saveEdit(editingIdx, q, a)} onClose={() => setEditingIdx(null)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS — dark Holographic Glass (performance-safe blob layer)
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
.blob-bg {
  position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
  background: var(--grad-bg);
}
.blob { position: absolute; border-radius: 50%; will-change: transform; }
.b1 {
  width: 520px; height: 520px; top: -150px; left: -150px;
  background: radial-gradient(circle, rgba(var(--accent-rgb),.22) 0%, rgba(var(--accent-rgb),.05) 60%, transparent 100%);
  animation: blobA 10s ease-in-out infinite;
}
.b2 {
  width: 440px; height: 440px; bottom: 10px; right: -110px;
  background: radial-gradient(circle, rgba(14,165,233,.18) 0%, rgba(14,165,233,.04) 60%, transparent 100%);
  animation: blobB 13s ease-in-out infinite;
}
.b3 {
  width: 340px; height: 340px; top: 44%; left: 48%;
  background: radial-gradient(circle, rgba(168,85,247,.14) 0%, rgba(168,85,247,.03) 60%, transparent 100%);
  animation: blobC 16s ease-in-out infinite;
}
@keyframes blobA { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(22px,-18px) scale(1.07)} 66%{transform:translate(-13px,17px) scale(.94)} }
@keyframes blobB { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-20px,15px) scale(1.06)} 70%{transform:translate(14px,-12px) scale(.95)} }
@keyframes blobC { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.13)} }

.glass-card {
  background: var(--glass-bg);
  border: 1.5px solid var(--glass-border);
  border-radius: 17px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.drop-zone {
  border: 2px dashed rgba(var(--accent-rgb),.4);
  border-radius: 17px; padding: 32px 22px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color .2s, background .2s;
  min-height: 148px; margin-bottom: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  box-shadow: var(--shadow-sm);
}
.drop-zone:hover, .dz-over {
  border-color: var(--accent-indigo) !important;
  background: rgba(var(--accent-rgb),.1) !important;
}

.q-card:hover { box-shadow: 0 6px 24px rgba(var(--accent-rgb),.18) !important; transform: translateY(-1px); }

.filter-input, .filter-select {
  background: var(--glass-bg); border: 1.5px solid var(--glass-border);
  border-radius: 11px; color: var(--text-primary); font-size: 13px;
  padding: 8px 12px; outline: none;
}
.filter-select { color: var(--text-secondary); cursor: pointer; }
.filter-input::placeholder { color: var(--text-muted); }
.filter-input:focus, .filter-select:focus, .edit-ta:focus {
  border-color: rgba(var(--accent-rgb),.6) !important;
  box-shadow: var(--focus-ring) !important;
  outline: none;
}

.edit-ta {
  width: 100%; box-sizing: border-box;
  background: var(--glass-bg-light); border: 1.5px solid var(--glass-border);
  border-radius: 11px; color: var(--text-primary); font-size: 13px;
  padding: 10px 12px; resize: vertical; outline: none;
  font-family: var(--font-sans); line-height: 1.72;
}
.edit-ta::placeholder { color: var(--text-muted); }

.icon-btn { background: none; border: none; cursor: pointer; font-size: 14px; opacity: .55; padding: 3px 4px; transition: opacity .13s; }
.icon-btn:hover { opacity: 1; }

.big-spin { width: 35px; height: 35px; border: 3px solid rgba(var(--accent-rgb),.2); border-top-color: #818cf8; border-radius: 50%; animation: ds-spin .8s linear infinite; margin: 0 auto; }
.mini-spin { width: 10px; height: 10px; border: 2px solid rgba(165,180,252,.35); border-top-color: var(--accent-light); border-radius: 50%; display: inline-block; animation: ds-spin .7s linear infinite; }
@keyframes wcFade { from{opacity:0;transform:translateY(4px)} to{opacity:.92;transform:none} }
@keyframes shimmer { 0%,100%{opacity:.55} 50%{opacity:1} }

select.filter-select option { background:#0f172a; color:#f1f5f9; }
`;
