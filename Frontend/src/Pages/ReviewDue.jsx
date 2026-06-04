import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { getToken, getUser } from '../lib/auth';
import { ENDPOINTS, ROUTES } from '../lib/constants';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/ui/GlassCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Icon3D from '../components/ui/Icon3D';

// Recall ratings → SM-2 quality (handled server-side via `confidence`).
const LEVELS = [
  { label: 'Forgot', emoji: '😶', score: 1, color: '#fb7185' },
  { label: 'Hard', emoji: '😅', score: 2, color: '#fb923c' },
  { label: 'Good', emoji: '🙂', score: 3, color: '#fbbf24' },
  { label: 'Easy', emoji: '😎', score: 4, color: '#34d399' },
];

const cta = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px',
  borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 'var(--weight-bold)',
  color: '#fff', background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)', textDecoration: 'none',
};

export default function ReviewDue() {
  const navigate = useNavigate();
  const toast = useToast();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getToken() || !getUser()) {
      navigate(ROUTES.LOGIN);
      return;
    }
    api
      .get(ENDPOINTS.REVIEWS_DUE)
      .then((data) => setCards(Array.isArray(data) ? data : []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const total = cards.length;
  const current = cards[idx];
  const done = !loading && total > 0 && idx >= total;

  const rate = async (level) => {
    if (submitting || !current) return;
    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.REVIEWS, { cardId: current.id, confidence: level.score });
      setReviewed((n) => n + 1);
    } catch {
      toast.error('Could not save your review — try again.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setFlipped(false);
    setTimeout(() => setIdx((i) => i + 1), 180);
  };

  const Shell = ({ children }) => (
    <div style={{ minHeight: '100vh', background: 'var(--grad-bg)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', display: 'grid', placeItems: 'center', padding: 'var(--space-6)' }}>
      <div style={{ width: '100%', maxWidth: 600 }}>{children}</div>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div style={{ textAlign: 'center' }}>
          <Spinner size={40} color="var(--accent-indigo)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your due cards…</p>
        </div>
      </Shell>
    );
  }

  if (total === 0) {
    return (
      <Shell>
        <GlassCard holo>
          <EmptyState
            icon={<Icon3D code="🧠" size={32} />}
            title="All caught up!"
            description="No cards are due for review right now. Save more questions to your vault, or come back later — spaced repetition will resurface them at the perfect time."
            action={<Link to={ROUTES.VAULT} style={cta}>Open vault</Link>}
          />
        </GlassCard>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <GlassCard holo style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}><Icon3D code="🎉" size={48} /></div>
          <h2 className="ds-holo-text" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-black)', margin: '0 0 var(--space-2)' }}>Review complete</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--space-6)' }}>You reviewed <strong style={{ color: 'var(--text-primary)' }}>{reviewed}</strong> {reviewed === 1 ? 'card' : 'cards'}. Each one is now rescheduled by SM-2.</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={ROUTES.HOME} style={cta}>Back to dashboard</Link>
            <Link to={ROUTES.VAULT} style={{ ...cta, background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1.5px solid var(--glass-border)', boxShadow: 'none' }}>Open vault</Link>
          </div>
        </GlassCard>
      </Shell>
    );
  }

  const progressPct = Math.round((idx / total) * 100);

  return (
    <Shell>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-black)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Icon3D code="🧠" size={26} /> Due for Review
        </h1>
        <Badge tone="indigo">{idx + 1} / {total}</Badge>
      </div>

      {/* Progress */}
      <div style={{ height: 5, borderRadius: 10, background: 'var(--glass-border)', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--grad-primary)', borderRadius: 10, transition: 'width var(--dur) var(--ease-out)' }} />
      </div>

      {/* Flip card */}
      <div
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label="Flip card to reveal the answer"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); } }}
        style={{ cursor: 'pointer', height: 320, perspective: '1200px', marginBottom: 'var(--space-5)' }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.55s var(--ease-out)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          {/* Front — question */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: 'linear-gradient(145deg, rgba(22,30,54,0.96) 0%, rgba(12,18,36,0.96) 100%)', border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', padding: 'var(--space-6)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 'var(--space-4)' }}>Question</span>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', lineHeight: 1.5, margin: 0, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{current.question}</p>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>Tap to reveal answer ↓</span>
          </div>
          {/* Back — answer */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(145deg, #4f46e5 0%, #4338ca 100%)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', padding: 'var(--space-6)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 'var(--space-4)' }}>Answer</span>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.6, margin: 0, color: 'rgba(255,255,255,0.95)', wordBreak: 'break-word' }}>{current.answer}</p>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)', marginTop: 'var(--space-3)' }}>How well did you recall it?</span>
          </div>
        </div>
      </div>

      {/* Rating buttons (active once the answer is revealed) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)', opacity: flipped ? 1 : 0.4, pointerEvents: flipped && !submitting ? 'auto' : 'none', transition: 'opacity var(--dur)' }}>
        {LEVELS.map((lvl) => (
          <button
            key={lvl.label}
            onClick={() => rate(lvl)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 6px', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--glass-bg)', border: `1.5px solid ${lvl.color}55`, color: lvl.color, fontWeight: 700, fontSize: 'var(--text-sm)', transition: 'transform var(--dur-fast), border-color var(--dur-fast)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = lvl.color; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${lvl.color}55`; }}
          >
            <Icon3D code={lvl.emoji} size={22} />
            {lvl.label}
          </button>
        ))}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-4)' }}>
        Reviewed {reviewed} · powered by SM-2 spaced repetition
      </p>
    </Shell>
  );
}
