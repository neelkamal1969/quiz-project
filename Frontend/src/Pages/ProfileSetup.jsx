import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { getToken, getUser, updateUser } from '../lib/auth';
import { ENDPOINTS, ROUTES } from '../lib/constants';
import { useToast } from '../context/ToastContext';

// ─── Degree auto-suggest list ────────────────────────────────────────────────
const DEGREE_SUGGESTIONS = [
  'Computer Science', 'Computer Engineering', 'Data Science',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Biomedical Engineering',
  'Mathematics', 'Applied Mathematics', 'Statistics',
  'Physics', 'Chemistry', 'Biology', 'Biochemistry',
  'Medicine (MBBS)', 'Pharmacy', 'Nursing', 'Dentistry',
  'Business Administration (BBA/MBA)', 'Economics', 'Finance', 'Accounting',
  'Law (LLB)', 'Psychology', 'Sociology', 'Political Science',
  'Architecture', 'Graphic Design', 'Fine Arts',
  'English Literature', 'Journalism', 'Mass Communication',
  'History', 'Philosophy', 'Education',
];

// ─── Safe string helper — converts null/undefined → '' ───────────────────────
const safe = (v) => (v == null ? '' : String(v));

// ─── Constellation canvas background (recoloured for the dark theme) ─────────
const ConstellationBg = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = Math.min(50, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    nodesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 1.2 + Math.random() * 1.8,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const nodes = nodesRef.current;
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(129,140,248,${0.16 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 2.5);
        grad.addColorStop(0, 'rgba(129,140,248,0.6)');
        grad.addColorStop(1, 'rgba(129,140,248,0)');
        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.9 }} />;
};

// ─── Degree AutoSuggest ──────────────────────────────────────────────────────
const DegreeInput = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(safe(value));
  const wrapRef = useRef(null);

  const suggestions = query.length > 0
    ? DEGREE_SUGGESTIONS.filter((d) => d.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => { setQuery(safe(value)); }, [value]);
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        aria-label="Degree or field of study" placeholder="e.g. Computer Science"
        autoComplete="off"
        className="ps-input"
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 'var(--z-dropdown)',
            background: 'var(--bg-700)', backdropFilter: 'blur(16px)',
            border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden',
            boxShadow: 'var(--shadow-md)', animation: 'ds-pop-in 0.18s var(--ease-spring) both',
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', border: 'none',
                background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.14)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onMouseDown={() => { onChange(s); setQuery(s); setOpen(false); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Difficulty Picker ───────────────────────────────────────────────────────
const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Foundational concepts' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Applied understanding' },
  { value: 'advanced', label: 'Advanced', desc: 'Deep mastery' },
  { value: 'expert', label: 'Expert', desc: 'Research-level depth' },
];

const DifficultyPicker = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
    {DIFFICULTY_LEVELS.map((d) => {
      const active = value === d.value;
      return (
        <button
          key={d.value}
          type="button"
          onClick={() => onChange(d.value)}
          style={{
            padding: '12px 8px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            background: active ? 'var(--grad-primary)' : 'var(--glass-bg)',
            border: `1.5px solid ${active ? 'transparent' : 'var(--glass-border)'}`,
            boxShadow: active ? 'var(--shadow-glow)' : 'none',
            transition: 'all var(--dur) var(--ease-out)',
            transform: active ? 'translateY(-2px)' : 'none',
          }}
        >
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, color: active ? '#fff' : 'var(--text-primary)', marginBottom: 3 }}>{d.label}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: active ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', lineHeight: 1.3 }}>{d.desc}</div>
        </button>
      );
    })}
  </div>
);

// ─── Question Style Picker ───────────────────────────────────────────────────
const Q_LEVELS = [
  { value: 'factual', label: 'Factual', icon: '▦', desc: 'What? definitions & facts' },
  { value: 'conceptual', label: 'Conceptual', icon: '◈', desc: 'Why? deep understanding' },
  { value: 'analytical', label: 'Analytical', icon: '◉', desc: 'How? applied reasoning' },
];

const QuestionStylePicker = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
    {Q_LEVELS.map((q) => {
      const active = value === q.value;
      return (
        <button
          key={q.value}
          type="button"
          onClick={() => onChange(q.value)}
          style={{
            padding: '14px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            background: active ? 'var(--grad-holo-soft)' : 'var(--glass-bg)',
            border: `1.5px solid ${active ? 'rgba(var(--accent-rgb),0.4)' : 'var(--glass-border)'}`,
            boxShadow: active ? '0 0 0 3px rgba(var(--accent-rgb),0.12)' : 'none',
            transition: 'all var(--dur)',
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 6, color: active ? 'var(--accent-light)' : 'var(--text-muted)' }}>{q.icon}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, color: active ? 'var(--accent-light)' : 'var(--text-primary)', marginBottom: 3 }}>{q.label}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>{q.desc}</div>
        </button>
      );
    })}
  </div>
);

// ─── Step Progress Bar ───────────────────────────────────────────────────────
const StepBar = ({ step, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: i < step ? 'var(--grad-primary)' : 'var(--glass-border)', transition: 'background 0.4s ease' }} />
        {i < total - 1 && (
          <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: i < step - 1 ? 'var(--accent-indigo)' : 'var(--glass-border)', transition: 'background 0.3s' }} />
        )}
      </React.Fragment>
    ))}
    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0, marginLeft: 6 }}>
      {step}/{total}
    </span>
  </div>
);

// ─── Profile completion % (null-safe) ────────────────────────────────────────
const completionPct = (profile) => {
  const fields = ['age', 'gender', 'degree', 'difficulty', 'question_level', 'goal'];
  const filled = fields.filter((f) => safe(profile[f]) !== '').length;
  return Math.round((filled / fields.length) * 100);
};

// ════════════════════════════════════════════════════════════════════════════
export default function ProfileSetup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [profile, setProfile] = useState({
    age: '', gender: '', degree: '',
    difficulty: 'intermediate', question_level: 'conceptual', goal: '',
  });

  const TOTAL_STEPS = 3;
  const pct = completionPct(profile);

  useEffect(() => {
    if (!getToken()) { navigate(ROUTES.LOGIN); return; }
    const savedUser = getUser() || {};
    if (savedUser.age) {
      setProfile((prev) => ({
        ...prev,
        age: safe(savedUser.age),
        gender: safe(savedUser.gender),
        degree: safe(savedUser.degree),
        difficulty: safe(savedUser.difficulty) || 'intermediate',
        question_level: safe(savedUser.question_level) || 'conceptual',
        goal: safe(savedUser.goal),
      }));
    }
  }, [navigate]);

  const set = useCallback((key, val) => setProfile((p) => ({ ...p, [key]: safe(val) })), []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const user = getUser() || {};
    const payload = Object.fromEntries(Object.entries(profile).filter(([, value]) => safe(value) !== ''));
    try {
      const data = await api.post(ENDPOINTS.INFO, { ...payload, userId: user.id });
      updateUser(data.user);
      toast.success('Profile saved — your AI tutor is calibrated!');
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="ps-grid-2">
        <div>
          <label className="ps-label">Age</label>
          <input type="number" min="10" max="100" value={safe(profile.age)} aria-label="Age" placeholder="e.g. 20" className="ps-input" onChange={(e) => set('age', e.target.value)} />
        </div>
        <div>
          <label className="ps-label">Gender</label>
          <div style={{ position: 'relative' }}>
            <select value={safe(profile.gender)} className="ps-input ps-select" onChange={(e) => set('gender', e.target.value)}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Prefer not to say</option>
            </select>
            <span className="ps-select-arrow">▾</span>
          </div>
        </div>
      </div>
      <div>
        <label className="ps-label">Degree / Major</label>
        <DegreeInput value={safe(profile.degree)} onChange={(v) => set('degree', v)} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <label className="ps-label">Difficulty Level</label>
        <DifficultyPicker value={safe(profile.difficulty) || 'intermediate'} onChange={(v) => set('difficulty', v)} />
      </div>
      <div>
        <label className="ps-label">Question Style</label>
        <QuestionStylePicker value={safe(profile.question_level) || 'conceptual'} onChange={(v) => set('question_level', v)} />
      </div>
    </div>
  );

  const renderStep3 = () => {
    const goalVal = safe(profile.goal);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="ps-label">Study Goal</label>
          <textarea
            value={goalVal}
            aria-label="Your study goals" placeholder="e.g. Preparing for GATE 2026, revising for semester exams, self-learning ML…"
            rows={4}
            className="ps-input"
            style={{ resize: 'vertical', minHeight: 110 }}
            onChange={(e) => set('goal', e.target.value)}
          />
          <div style={{ textAlign: 'right', marginTop: 6, fontFamily: 'var(--font-sans)', fontSize: 11, color: goalVal.length > 220 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
            {goalVal.length}/250
          </div>
        </div>

        <div style={{ padding: '16px 18px', borderRadius: 'var(--radius-md)', background: 'var(--grad-holo-soft)', border: '1.5px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Profile Completion</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 800, color: 'var(--accent-light)' }}>{pct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: 'var(--glass-border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: 'var(--grad-primary)', transition: 'width 0.6s var(--ease-out)' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', marginTop: 8, marginBottom: 0 }}>
            {pct < 50 && 'Fill more fields to get a better-personalised AI tutor.'}
            {pct >= 50 && pct < 100 && 'Looking good! A few more fields will sharpen the AI.'}
            {pct === 100 && '✓ Fully calibrated — your AI tutor is ready.'}
          </p>
        </div>
      </div>
    );
  };

  const STEP_META = [
    { title: 'About You', subtitle: "Help your AI tutor understand who it's working with.", icon: '◉' },
    { title: 'Learning Style', subtitle: "Tune the AI's question generation to match how you think.", icon: '◈' },
    { title: 'Your Goal', subtitle: 'What are you studying for? The AI will personalise accordingly.', icon: '▦' },
  ];
  const renderStepContent = [renderStep1, renderStep2, renderStep3];
  const meta = STEP_META[step - 1];

  return (
    <>
      <style>{`
        .ps-page {
          min-height: 100vh;
          background: var(--grad-bg);
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px; position: relative;
          font-family: var(--font-sans);
        }
        .ps-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 560px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur-strong);
          -webkit-backdrop-filter: var(--glass-blur-strong);
          border: 1.5px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: clamp(28px, 5vw, 40px);
          box-shadow: var(--shadow-lg);
          animation: ds-fade-up 0.5s var(--ease-out) both;
        }
        .ps-step-anim { animation: ds-fade-up 0.3s var(--ease-out) both; }
        .ps-label {
          display: block; font-family: var(--font-sans);
          font-size: 11px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px;
        }
        .ps-input {
          width: 100%; padding: 13px 16px;
          background: var(--glass-bg);
          border: 1.5px solid var(--glass-border);
          border-radius: var(--radius-md);
          font-family: var(--font-sans); font-size: 14px; font-weight: 500;
          color: var(--text-primary); outline: none;
          transition: border-color var(--dur), box-shadow var(--dur);
          box-sizing: border-box;
        }
        .ps-input::placeholder { color: var(--text-muted); font-weight: 400; }
        .ps-input:focus {
          border-color: rgba(var(--accent-rgb),0.6);
          box-shadow: var(--focus-ring);
        }
        .ps-input option { color: #1e1b4b; }
        .ps-select { appearance: none; -webkit-appearance: none; padding-right: 36px; cursor: pointer; }
        .ps-select-arrow { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 12px; color: var(--text-muted); pointer-events: none; }
        .ps-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ps-btn-primary {
          width: 100%; padding: 15px; border-radius: var(--radius-md); border: none; cursor: pointer;
          font-family: var(--font-sans); font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.2px;
          background: var(--grad-primary); box-shadow: var(--shadow-glow);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .ps-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-glow-strong); }
        .ps-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .ps-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .ps-btn-secondary {
          width: 100%; padding: 12px; border-radius: var(--radius-md);
          border: 1.5px solid var(--glass-border); background: transparent; cursor: pointer;
          font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--text-secondary);
          transition: all 0.15s;
        }
        .ps-btn-secondary:hover { border-color: rgba(var(--accent-rgb),0.45); color: var(--accent-light); background: rgba(var(--accent-rgb),0.06); }
        .ps-btn-ghost {
          width: 100%; padding: 10px; border: none; background: transparent; cursor: pointer;
          font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--text-muted); transition: color 0.15s;
        }
        .ps-btn-ghost:hover { color: var(--accent-light); }
        .ps-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: ds-spin 0.7s linear infinite;
        }
        @media (max-width: 520px) {
          .ps-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ps-page">
        <ConstellationBg />

        <div className="ps-card">
          <StepBar step={step} total={TOTAL_STEPS} />

          {/* Step header */}
          <div className="ps-step-anim" key={`hdr-${step}`} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', boxShadow: 'var(--shadow-glow)' }}>
                {meta.icon}
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>{meta.title}</h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{meta.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Step body */}
          <div className="ps-step-anim" key={`body-${step}`}>
            {renderStepContent[step - 1]()}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
            {step < TOTAL_STEPS ? (
              <>
                <button type="button" className="ps-btn-primary" onClick={() => setStep((s) => s + 1)}>Continue →</button>
                {step > 1 && (
                  <button type="button" className="ps-btn-secondary" onClick={() => setStep((s) => s - 1)}>← Back</button>
                )}
              </>
            ) : (
              <>
                <button type="button" className="ps-btn-primary" disabled={loading} onClick={handleSubmit}>
                  {loading ? (<><span className="ps-spinner" /> Personalising…</>) : '✓ Save & Launch →'}
                </button>
                <button type="button" className="ps-btn-secondary" onClick={() => setStep((s) => s - 1)}>← Back</button>
              </>
            )}
            <button type="button" className="ps-btn-ghost" onClick={() => navigate(ROUTES.HOME)}>
              Skip — go to dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
