import React, { useState } from 'react';
import ResultSection from '../components/ResultSection';
import { api } from '../lib/api';
import { getUser } from '../lib/auth';
import { ENDPOINTS } from '../lib/constants';
import { useToast } from '../context/ToastContext';

export default function ValueToQuestions() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const toast = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (count > 20) {
      setCount(20);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Safe user read — returns {} for guests
    const userData = getUser() || {};

    try {
      // Only include userId when logged in. The backend's userId validator is not
      // `.exists()`, so omitting it passes validation and falls back to an empty
      // profile — perfectly safe for guests.
      const payload = { count: Number(count) };
      if (userData.id) payload.userId = userData.id;

      // Log search only when logged in — non-blocking, fire-and-forget
      if (userData.email) {
        api.post(ENDPOINTS.LOG_SEARCH, { email: userData.email, topic }).catch(() => {});
      }

      const data = await api.post(ENDPOINTS.SEARCH(topic), payload);
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching study materials:', err);
      toast.error('Failed to generate questions. Please check your connection and try again.');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <style>{`
        .vtq-bg { min-height: 100vh; background: var(--grad-bg); }

        .orb-1 {
          position: absolute; top: -80px; left: -60px; width: 340px; height: 340px; border-radius: 50%;
          background: radial-gradient(circle, rgba(var(--accent-rgb),0.18) 0%, transparent 70%);
          filter: blur(50px); pointer-events: none; animation: ds-float-a 10s ease-in-out infinite;
        }
        .orb-2 {
          position: absolute; top: 20px; right: -80px; width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(14,165,233,0.16) 0%, transparent 70%);
          filter: blur(40px); pointer-events: none; animation: ds-float-b 13s ease-in-out infinite;
        }

        .hero-section {
          position: relative; overflow: hidden; padding: 72px 24px 80px; text-align: center;
          border-bottom: 1px solid var(--glass-border);
        }

        .ai-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(var(--accent-rgb),0.15); border: 1px solid rgba(var(--accent-rgb),0.35);
          color: var(--accent-light); font-size: 12px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
          padding: 6px 14px; border-radius: var(--radius-full); margin-bottom: 20px;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: var(--text-4xl); font-weight: 800; letter-spacing: -1px; line-height: 1.1; margin: 0 0 16px;
          background: var(--grad-holo); background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: ds-holo-pan 6s ease infinite;
        }
        .hero-subtitle { color: var(--text-secondary); font-size: var(--text-lg); font-weight: 500; max-width: 480px; margin: 0 auto 40px; line-height: 1.7; }

        .search-card {
          max-width: 700px; margin: 0 auto; position: relative; z-index: 1;
          background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
          border: 1.5px solid var(--glass-border); border-radius: var(--radius-xl);
          padding: 10px; box-shadow: var(--shadow-lg);
        }
        .search-inner { display: flex; flex-direction: row; gap: 8px; align-items: stretch; }

        .topic-input {
          flex: 1; padding: 16px 20px; background: var(--glass-bg-light);
          border: 1.5px solid var(--glass-border); border-radius: var(--radius-md);
          color: var(--text-primary); font-size: 15px; font-weight: 500; font-family: inherit; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; min-width: 0;
        }
        .topic-input::placeholder { color: var(--text-muted); font-weight: 400; }
        .topic-input:focus { border-color: rgba(var(--accent-rgb),0.6); box-shadow: var(--focus-ring); }

        .count-wrapper {
          display: flex; align-items: center; gap: 8px; padding: 0 16px;
          background: var(--glass-bg-light); border: 1.5px solid var(--glass-border);
          border-radius: var(--radius-md); transition: border-color 0.2s; flex-shrink: 0;
        }
        .count-wrapper:focus-within { border-color: rgba(var(--accent-rgb),0.6); box-shadow: var(--focus-ring); }
        .count-label { color: var(--text-muted); font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; white-space: nowrap; }
        .count-input {
          width: 44px; padding: 8px 4px; background: transparent; border: none; text-align: center;
          font-size: 16px; font-weight: 800; color: var(--accent-light); font-family: inherit; outline: none;
        }
        .count-input::-webkit-inner-spin-button, .count-input::-webkit-outer-spin-button { opacity: 0; }

        .search-btn {
          padding: 0 28px; border-radius: var(--radius-md); border: none; cursor: pointer;
          font-size: 14px; font-weight: 700; letter-spacing: 0.3px; color: #fff;
          background: var(--grad-primary); box-shadow: var(--shadow-glow);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          white-space: nowrap; flex-shrink: 0; min-height: 54px;
        }
        .search-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-glow-strong); }
        .search-btn:active:not(:disabled) { transform: scale(0.97); }
        .search-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: ds-spin 0.7s linear infinite; }

        .warn-pill {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 14px;
          padding: 7px 14px; border-radius: var(--radius-full);
          background: rgba(251,191,36,0.14); border: 1px solid rgba(251,191,36,0.35); color: var(--accent-amber);
          font-size: 12px; font-weight: 600;
        }

        .stats-bar { max-width: 700px; margin: 28px auto 0; display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; }
        .stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .stat-value { font-size: 18px; font-weight: 800; color: var(--accent-light); }
        .stat-label { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

        .main-content { max-width: 900px; margin: 0 auto; padding: 48px 24px 64px; }

        @media (max-width: 600px) {
          .search-inner { flex-direction: column; }
          .count-wrapper { justify-content: space-between; padding: 12px 16px; }
          .search-btn { min-height: 50px; }
          .stats-bar { gap: 20px; }
        }
      `}</style>

      <div className="vtq-bg">
        <header className="hero-section">
          <div className="orb-1" aria-hidden="true" />
          <div className="orb-2" aria-hidden="true" />

          <div className="ai-badge"><span>✦</span> AI-Powered</div>

          <h1 className="hero-title">Your Personal<br />Study Assistant</h1>
          <p className="hero-subtitle">Enter any topic and instantly generate a tailored set of study questions powered by AI.</p>

          <form onSubmit={handleSearch} className="search-card">
            <div className="search-inner">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="Topic to generate questions about"
                placeholder="Enter a topic  (e.g. Photosynthesis, WW2, Calculus...)"
                className="topic-input"
                autoComplete="off"
                spellCheck="false"
              />
              <div className="count-wrapper">
                <span className="count-label">Q's</span>
                <input
                  type="number"
                  value={count}
                  min="1"
                  max="20"
                  onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 5)))}
                  className="count-input"
                  aria-label="Number of questions"
                />
              </div>
              <button type="submit" disabled={loading || !topic.trim()} className="search-btn">
                {loading ? (<><span className="spinner" /> Generating…</>) : (<><span>✦</span> Generate</>)}
              </button>
            </div>
          </form>

          {count >= 20 && (
            <div><span className="warn-pill">⚠ Free Tier: Max 20 questions</span></div>
          )}

          {!hasSearched && (
            <div className="stats-bar" aria-hidden="true">
              {[
                { value: '20', label: 'Max Questions' },
                { value: 'AI', label: 'Gemini Powered' },
                { value: '∞', label: 'Topics Covered' },
              ].map(({ value, label }) => (
                <div className="stat-item" key={label}>
                  <span className="stat-value">{value}</span>
                  <span className="stat-label">{label}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        <main className="main-content">
          <ResultSection loading={loading} items={materials} topic={topic} />
        </main>
      </div>
    </div>
  );
}
