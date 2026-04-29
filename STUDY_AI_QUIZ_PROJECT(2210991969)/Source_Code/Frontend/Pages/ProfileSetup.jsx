// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function ProfileSetup() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [profile, setProfile] = useState({
//     age: '',
//     gender: '',
//     degree: '',
//     difficulty: 'intermediate',
//     question_level: 'conceptual',
//     goal: ''
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) navigate('/login');
    
//     // Optional: Pre-fill form if user data exists in localStorage
//     const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
//     if (savedUser.age) {
//         setProfile(prev => ({...prev, ...savedUser}));
//     }
//   }, [navigate]);

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();
//     setLoading(true);

//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     const apiUrl = import.meta.env.VITE_API_URL;

//     // Filter out empty strings so we only update what the user typed
//     const payload = Object.fromEntries(
//         Object.entries(profile).filter(([_, value]) => value !== '')
//     );

//     try {
//       const response = await fetch(`${apiUrl}/info`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           ...payload, 
//           userId: user.id 
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('user', JSON.stringify(data.user));
//         navigate('/');
//       } else {
//         alert(data.error || "Failed to update profile");
//       }
//     } catch (err) {
//       console.error("Profile Error:", err);
//       alert("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-12">
//       <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100">
//         <div className="mb-10 text-center">
//           <div className="inline-block p-4 bg-indigo-50 rounded-2xl mb-4 text-3xl">🤖</div>
//           <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Refine Your AI Tutor</h2>
//           <p className="text-slate-500 font-medium">All fields are optional. Fill what you want, skip the rest.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Age</label>
//               <input 
//                 type="number" 
//                 value={profile.age}
//                 placeholder="e.g. 20"
//                 className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
//                 onChange={(e) => setProfile({...profile, age: e.target.value})}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
//               <select 
//                 value={profile.gender}
//                 className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none"
//                 onChange={(e) => setProfile({...profile, gender: e.target.value})}
//               >
//                 <option value="">Select Gender</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Degree / Major</label>
//               <input 
//                 type="text" 
//                 value={profile.degree}
//                 placeholder="e.g. Computer Science"
//                 className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
//                 onChange={(e) => setProfile({...profile, degree: e.target.value})}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Question Style</label>
//               <select 
//                 value={profile.question_level}
//                 className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none"
//                 onChange={(e) => setProfile({...profile, question_level: e.target.value})}
//               >
//                 <option value="conceptual">Conceptual (Why?)</option>
//                 <option value="analytical">Analytical (How?)</option>
//                 <option value="factual">Factual (What?)</option>
//               </select>
//             </div>
//           </div>

//           <div className="pt-6 space-y-4">
//             <button 
//                 type="submit" 
//                 disabled={loading} 
//                 className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
//             >
//               {loading ? "Personalizing..." : "Save Preferences"}
//             </button>
            
//             <button 
//                 type="button"
//                 onClick={() => navigate('/')}
//                 className="w-full py-2 text-slate-400 font-bold hover:text-indigo-600 transition-colors text-sm"
//             >
//               Skip and go to Dashboard
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

// ─── Constellation canvas background ────────────────────────────────────────
const ConstellationBg = () => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const nodesRef  = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = Math.min(50, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    nodesRef.current = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r:  1.2 + Math.random() * 1.8,
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
            ctx.strokeStyle = `rgba(79,70,229,${0.11 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 2.5);
        grad.addColorStop(0, 'rgba(79,70,229,0.5)');
        grad.addColorStop(1, 'rgba(79,70,229,0)');
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

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.85 }}
    />
  );
};

// ─── Degree AutoSuggest ──────────────────────────────────────────────────────
const DegreeInput = ({ value, onChange }) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState(safe(value));
  const wrapRef           = useRef(null);

  const suggestions = query.length > 0
    ? DEGREE_SUGGESTIONS.filter(d => d.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => { setQuery(safe(value)); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        placeholder="e.g. Computer Science"
        autoComplete="off"
        className="ps-input"
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
          background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(99,102,241,0.18)', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(79,70,229,0.15)',
          animation: 'psPopIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {suggestions.map((s) => (
            <button
              key={s} type="button"
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '11px 16px', border: 'none', background: 'transparent',
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
                color: '#374151', cursor: 'pointer',
                borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
  { value: 'beginner',     label: 'Beginner',     desc: 'Foundational concepts' },
  { value: 'intermediate', label: 'Intermediate',  desc: 'Applied understanding' },
  { value: 'advanced',     label: 'Advanced',      desc: 'Deep mastery' },
  { value: 'expert',       label: 'Expert',        desc: 'Research-level depth' },
];

const DifficultyPicker = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
    {DIFFICULTY_LEVELS.map((d) => {
      const active = value === d.value;
      return (
        <button
          key={d.value} type="button"
          onClick={() => onChange(d.value)}
          style={{
            padding: '12px 8px', borderRadius: 14, cursor: 'pointer',
            background: active
              ? 'linear-gradient(135deg, #4f46e5 0%, #2563eb 60%, #0ea5e9 100%)'
              : 'rgba(248,250,255,0.9)',
            border: `1.5px solid ${active ? 'transparent' : 'rgba(99,102,241,0.12)'}`,
            boxShadow: active ? '0 4px 18px rgba(79,70,229,0.3)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
            transform: active ? 'translateY(-2px)' : 'none',
          }}
        >
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12,
            color: active ? 'white' : '#374151', marginBottom: 3 }}>{d.label}</div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10,
            color: active ? 'rgba(255,255,255,0.75)' : '#94a3b8', lineHeight: 1.3 }}>{d.desc}</div>
        </button>
      );
    })}
  </div>
);

// ─── Question Style Picker ───────────────────────────────────────────────────
const Q_LEVELS = [
  { value: 'factual',    label: 'Factual',    icon: '▦', desc: 'What? definitions & facts' },
  { value: 'conceptual', label: 'Conceptual', icon: '◈', desc: 'Why? deep understanding' },
  { value: 'analytical', label: 'Analytical', icon: '◉', desc: 'How? applied reasoning' },
];

const QuestionStylePicker = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
    {Q_LEVELS.map((q) => {
      const active = value === q.value;
      return (
        <button
          key={q.value} type="button"
          onClick={() => onChange(q.value)}
          style={{
            padding: '14px 10px', borderRadius: 16, cursor: 'pointer',
            background: active
              ? 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(14,165,233,0.07))'
              : 'rgba(248,250,255,0.9)',
            border: `1.5px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)'}`,
            boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 6, color: active ? '#4f46e5' : '#94a3b8' }}>
            {q.icon}
          </div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12,
            color: active ? '#4f46e5' : '#374151', marginBottom: 3 }}>{q.label}</div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10,
            color: '#94a3b8', lineHeight: 1.3 }}>{q.desc}</div>
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
        <div style={{
          flex: 1, height: 4, borderRadius: 4,
          background: i < step
            ? 'linear-gradient(90deg, #4f46e5, #0ea5e9)'
            : 'rgba(99,102,241,0.12)',
          transition: 'background 0.4s ease',
        }} />
        {i < total - 1 && (
          <div style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: i < step - 1 ? '#4f46e5' : 'rgba(99,102,241,0.15)',
            transition: 'background 0.3s',
          }} />
        )}
      </React.Fragment>
    ))}
    <span style={{
      fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#94a3b8',
      fontWeight: 600, flexShrink: 0, marginLeft: 6,
    }}>
      {step}/{total}
    </span>
  </div>
);

// ─── Profile completion % (null-safe) ────────────────────────────────────────
const completionPct = (profile) => {
  const fields = ['age', 'gender', 'degree', 'difficulty', 'question_level', 'goal'];
  const filled = fields.filter(f => safe(profile[f]) !== '').length;
  return Math.round((filled / fields.length) * 100);
};

// ════════════════════════════════════════════════════════════════════════════
export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1);
  const [error, setError]     = useState('');

  // All fields initialised to '' — never null — so .length is always safe
  const [profile, setProfile] = useState({
    age:            '',
    gender:         '',
    degree:         '',
    difficulty:     'intermediate',
    question_level: 'conceptual',
    goal:           '',
  });

  const TOTAL_STEPS = 3;
  const pct = completionPct(profile);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser.age) {
      // safe() converts every field to string, never null — this is the root-cause fix
      setProfile(prev => ({
        ...prev,
        age:            safe(savedUser.age),
        gender:         safe(savedUser.gender),
        degree:         safe(savedUser.degree),
        difficulty:     safe(savedUser.difficulty)     || 'intermediate',
        question_level: safe(savedUser.question_level) || 'conceptual',
        goal:           safe(savedUser.goal),
      }));
    }
  }, [navigate]);

  const set = useCallback((key, val) =>
    setProfile(p => ({ ...p, [key]: safe(val) })),
  []);

  // ── Submit — original logic preserved, alert → setError ──────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const user   = JSON.parse(localStorage.getItem('user') || '{}');
    const apiUrl = import.meta.env.VITE_API_URL;

    const payload = Object.fromEntries(
      Object.entries(profile).filter(([_, value]) => safe(value) !== '')
    );

    try {
      const response = await fetch(`${apiUrl}/info`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...payload, userId: user.id }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile Error:', err);
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step content as render functions — reads live profile state every time ─
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="ps-grid-2">
        <div>
          <label className="ps-label">Age</label>
          <input
            type="number" min="10" max="100"
            value={safe(profile.age)}
            placeholder="e.g. 20"
            className="ps-input"
            onChange={(e) => set('age', e.target.value)}
          />
        </div>
        <div>
          <label className="ps-label">Gender</label>
          <div style={{ position: 'relative' }}>
            <select
              value={safe(profile.gender)}
              className="ps-input ps-select"
              onChange={(e) => set('gender', e.target.value)}
            >
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
        <DifficultyPicker
          value={safe(profile.difficulty) || 'intermediate'}
          onChange={(v) => set('difficulty', v)}
        />
      </div>
      <div>
        <label className="ps-label">Question Style</label>
        <QuestionStylePicker
          value={safe(profile.question_level) || 'conceptual'}
          onChange={(v) => set('question_level', v)}
        />
      </div>
    </div>
  );

  const renderStep3 = () => {
    const goalVal = safe(profile.goal); // guaranteed string, never null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="ps-label">Study Goal</label>
          <textarea
            value={goalVal}
            placeholder="e.g. Preparing for GATE 2026, revising for semester exams, self-learning ML…"
            rows={4}
            className="ps-input"
            style={{ resize: 'vertical', minHeight: 110 }}
            onChange={(e) => set('goal', e.target.value)}
          />
          <div style={{
            textAlign: 'right', marginTop: 6,
            fontFamily: "'DM Sans',sans-serif", fontSize: 11,
            color: goalVal.length > 220 ? '#ef4444' : '#94a3b8',
          }}>
            {goalVal.length}/250
          </div>
        </div>

        {/* Profile completion widget */}
        <div style={{
          padding: '16px 18px', borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(14,165,233,0.04))',
          border: '1.5px solid rgba(99,102,241,0.12)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700,
              color: '#374151' }}>Profile Completion</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 800,
              color: '#4f46e5' }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: 'rgba(99,102,241,0.1)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4, width: `${pct}%`,
              background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)',
              transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#94a3b8',
            marginTop: 8, marginBottom: 0 }}>
            {pct < 50  && 'Fill more fields to get a better-personalised AI tutor.'}
            {pct >= 50 && pct < 100 && 'Looking good! A few more fields will sharpen the AI.'}
            {pct === 100 && '✓ Fully calibrated — your AI tutor is ready.'}
          </p>
        </div>
      </div>
    );
  };

  const STEP_META = [
    { title: 'About You',      subtitle: "Help your AI tutor understand who it's working with.", icon: '◉' },
    { title: 'Learning Style', subtitle: "Tune the AI's question generation to match how you think.", icon: '◈' },
    { title: 'Your Goal',      subtitle: 'What are you studying for? The AI will personalise accordingly.', icon: '▦' },
  ];
  const renderStepContent = [renderStep1, renderStep2, renderStep3];
  const meta = STEP_META[step - 1];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .ps-page {
          min-height: 100vh;
          background: linear-gradient(160deg, #f0f4ff 0%, #fafbff 50%, #ffffff 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px; position: relative;
        }

        .ps-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 560px;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(28px) saturate(1.6);
          -webkit-backdrop-filter: blur(28px) saturate(1.6);
          border: 1.5px solid rgba(99,102,241,0.13);
          border-radius: 32px;
          padding: 40px 36px;
          box-shadow: 0 24px 72px rgba(79,70,229,0.12), 0 1px 0 rgba(255,255,255,0.9) inset;
          animation: psSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes psSlideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes psPopIn {
          from { opacity:0; transform:scale(0.92) translateY(-6px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes psStepIn {
          from { opacity:0; transform:translateX(22px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .ps-step-anim { animation: psStepIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        .ps-label {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.7px;
          margin-bottom: 8px;
        }

        .ps-input {
          width: 100%; padding: 13px 16px;
          background: rgba(248,250,255,0.85);
          border: 1.5px solid rgba(99,102,241,0.12);
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          color: #1e1b4b; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .ps-input::placeholder { color: #94a3b8; font-weight: 400; }
        .ps-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .ps-select { appearance: none; -webkit-appearance: none; padding-right: 36px; cursor: pointer; }
        .ps-select-arrow {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          font-size: 12px; color: #94a3b8; pointer-events: none;
        }

        .ps-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .ps-btn-primary {
          width: 100%; padding: 15px; border-radius: 16px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
          color: white; letter-spacing: 0.2px;
          background: linear-gradient(135deg, #4f46e5 0%, #2563eb 55%, #0ea5e9 100%);
          box-shadow: 0 6px 28px rgba(79,70,229,0.35);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .ps-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(79,70,229,0.45);
        }
        .ps-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .ps-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .ps-btn-secondary {
          width: 100%; padding: 12px; border-radius: 14px;
          border: 1.5px solid rgba(99,102,241,0.15);
          background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          color: #64748b; transition: all 0.15s;
        }
        .ps-btn-secondary:hover {
          border-color: rgba(99,102,241,0.35); color: #4f46e5;
          background: rgba(99,102,241,0.04);
        }

        .ps-btn-ghost {
          width: 100%; padding: 10px; border: none; background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          color: #94a3b8; transition: color 0.15s;
        }
        .ps-btn-ghost:hover { color: #4f46e5; }

        .ps-error {
          padding: 12px 16px; border-radius: 12px; margin-top: 16px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.2);
          color: #b91c1c;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          display: flex; align-items: center; gap: 8px;
        }

        .ps-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 520px) {
          .ps-card { padding: 28px 20px; border-radius: 24px; }
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
              <div style={{
                width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'white',
              }}>
                {meta.icon}
              </div>
              <div>
                <h2 style={{
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 20,
                  color: '#1e1b4b', margin: 0, letterSpacing: '-0.4px',
                }}>
                  {meta.title}
                </h2>
                <p style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#64748b',
                  margin: '2px 0 0',
                }}>
                  {meta.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Step body — called as function, reads live profile state every render */}
          <div className="ps-step-anim" key={`body-${step}`}>
            {renderStepContent[step - 1]()}
          </div>

          {/* Error banner */}
          {error && (
            <div className="ps-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
            {step < TOTAL_STEPS ? (
              <>
                <button type="button" className="ps-btn-primary"
                  onClick={() => setStep(s => s + 1)}>
                  Continue →
                </button>
                {step > 1 && (
                  <button type="button" className="ps-btn-secondary"
                    onClick={() => setStep(s => s - 1)}>
                    ← Back
                  </button>
                )}
              </>
            ) : (
              <>
                <button type="button" className="ps-btn-primary"
                  disabled={loading} onClick={handleSubmit}>
                  {loading
                    ? <><span className="ps-spinner" /> Personalising…</>
                    : '✓ Save & Launch →'
                  }
                </button>
                <button type="button" className="ps-btn-secondary"
                  onClick={() => setStep(s => s - 1)}>
                  ← Back
                </button>
              </>
            )}
            <button type="button" className="ps-btn-ghost" onClick={() => navigate('/')}>
              Skip — go to dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}