import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { getToken, getUser } from '../lib/auth';
import { ENDPOINTS, ROUTES } from '../lib/constants';
import GlassCard from '../components/ui/GlassCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Icon3D from '../components/ui/Icon3D';

const Shell = ({ children }) => (
  <div style={{ minHeight: '100vh', background: 'var(--grad-bg)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', display: 'grid', placeItems: 'center', padding: 'var(--space-6)' }}>
    <div style={{ width: '100%', maxWidth: 600 }}>{children}</div>
  </div>
);

const cta = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 'var(--radius-md)',
  border: 'none', cursor: 'pointer', fontWeight: 'var(--weight-bold)', color: '#fff',
  background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)', textDecoration: 'none', fontSize: 'var(--text-base)',
};
const ctaGhost = { ...cta, background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1.5px solid var(--glass-border)', boxShadow: 'none' };

export default function QuizMode() {
  const navigate = useNavigate();
  const [vault, setVault] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState('__all__');
  const [started, setStarted] = useState(false);
  const [quizCards, setQuizCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!getToken() || !user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    api
      .get(ENDPOINTS.VAULT(user.id))
      .then((data) => setVault(Array.isArray(data) ? data : []))
      .catch(() => setVault([]))
      .finally(() => setLoading(false));
  }, []);

  const decks = [...new Set(vault.map((c) => c.deck).filter(Boolean))];

  const start = () => {
    const pool = deck === '__all__' ? vault : vault.filter((c) => c.deck === deck);
    if (!pool.length) return;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuizCards(shuffled);
    setIdx(0);
    setRevealed(false);
    setScore(0);
    setDone(false);
    setStarted(true);
  };

  const grade = (correct) => {
    const nextScore = correct ? score + 1 : score;
    setScore(nextScore);
    if (idx < quizCards.length - 1) {
      setIdx((i) => i + 1);
      setRevealed(false);
    } else {
      setDone(true);
      // Persist the completed session (non-blocking).
      api.post(ENDPOINTS.SESSIONS, {
        kind: 'quiz',
        topic: deck === '__all__' ? 'All cards' : deck,
        total: quizCards.length,
        score: nextScore,
      }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <Shell>
        <div style={{ textAlign: 'center' }}>
          <Spinner size={40} color="var(--accent-indigo)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your vault…</p>
        </div>
      </Shell>
    );
  }

  // No cards at all
  if (vault.length === 0) {
    return (
      <Shell>
        <GlassCard holo>
          <EmptyState
            icon={<Icon3D code="🃏" size={32} />}
            title="No cards to quiz yet"
            description="Save some questions to your vault first, then come back to test yourself with a scored quiz."
            action={<Link to={ROUTES.VALUE_INPUT} style={cta}>Generate questions</Link>}
          />
        </GlassCard>
      </Shell>
    );
  }

  // Pre-quiz: pick a deck
  if (!started) {
    const pool = deck === '__all__' ? vault : vault.filter((c) => c.deck === deck);
    return (
      <Shell>
        <GlassCard holo style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}><Icon3D code="🃏" size={44} /></div>
          <h1 className="ds-holo-text" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-black)', margin: '0 0 var(--space-2)' }}>Quiz Mode</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--space-6)' }}>Test yourself on your saved cards. Reveal each answer, then mark whether you got it right — you'll get a score at the end.</p>

          <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>Deck</label>
          <select
            value={deck}
            onChange={(e) => setDeck(e.target.value)}
            style={{ width: '100%', maxWidth: 280, padding: '11px 16px', borderRadius: 'var(--radius-md)', background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', outline: 'none', marginBottom: 'var(--space-5)' }}
          >
            <option value="__all__">All cards ({vault.length})</option>
            {decks.map((d) => (
              <option key={d} value={d}>{d} ({vault.filter((c) => c.deck === d).length})</option>
            ))}
          </select>

          <div>
            <button onClick={start} disabled={!pool.length} style={{ ...cta, opacity: pool.length ? 1 : 0.5, cursor: pool.length ? 'pointer' : 'not-allowed' }}>
              Start quiz · {pool.length} {pool.length === 1 ? 'card' : 'cards'} →
            </button>
          </div>
        </GlassCard>
      </Shell>
    );
  }

  // Results
  if (done) {
    const pct = quizCards.length ? Math.round((score / quizCards.length) * 100) : 0;
    const tone = pct >= 80 ? '🎉' : pct >= 50 ? '🙂' : '😅';
    return (
      <Shell>
        <GlassCard holo style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}><Icon3D code={tone} size={48} /></div>
          <h2 className="ds-holo-text" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-black)', margin: '0 0 var(--space-2)' }}>{score} / {quizCards.length}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--space-6)' }}>You scored <strong style={{ color: 'var(--text-primary)' }}>{pct}%</strong>. This session was saved to your study history.</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setStarted(false)} style={cta}>New quiz</button>
            <Link to={ROUTES.ANALYTICS} style={ctaGhost}>View analytics</Link>
          </div>
        </GlassCard>
      </Shell>
    );
  }

  // Active quiz
  const card = quizCards[idx];
  const progressPct = Math.round((idx / quizCards.length) * 100);
  return (
    <Shell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-black)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Icon3D code="🃏" size={22} /> Quiz
        </h1>
        <Badge tone="indigo">{idx + 1} / {quizCards.length} · score {score}</Badge>
      </div>

      <div style={{ height: 5, borderRadius: 10, background: 'var(--glass-border)', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--grad-primary)', borderRadius: 10, transition: 'width var(--dur) var(--ease-out)' }} />
      </div>

      <GlassCard style={{ minHeight: 220, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-3)' }}>Question</span>
        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', lineHeight: 1.5, margin: '0 0 var(--space-4)', color: 'var(--text-primary)' }}>{card.question}</p>

        {revealed && (
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-4)', animation: 'ds-fade-up var(--dur) var(--ease-out) both' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Answer</span>
            <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.7, margin: '6px 0 0', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{card.answer}</p>
          </div>
        )}
      </GlassCard>

      <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
        {!revealed ? (
          <button onClick={() => setRevealed(true)} style={{ ...cta, width: '100%', maxWidth: 320, justifyContent: 'center' }}>Reveal answer</button>
        ) : (
          <>
            <button onClick={() => grade(false)} style={{ ...ctaGhost, flex: 1, justifyContent: 'center', borderColor: 'rgba(251,113,133,0.5)', color: '#fb7185' }}>
              <Icon3D code="❌" size={18} /> Missed
            </button>
            <button onClick={() => grade(true)} style={{ ...cta, flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <Icon3D code="✅" size={18} /> Got it
            </button>
          </>
        )}
      </div>
    </Shell>
  );
}
