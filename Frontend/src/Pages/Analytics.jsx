import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { getToken, getUser } from '../lib/auth';
import { ENDPOINTS, ROUTES } from '../lib/constants';
import GlassCard from '../components/ui/GlassCard';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Icon3D from '../components/ui/Icon3D';

const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','have','has','had','do','does','did','will','would','what','which','how','why','when','where','who','that','this','these','those','it','its','as','if','not','your','you','their','they']);

// ── Tiny SVG donut ──────────────────────────────────────────────────────────
function Donut({ segments, centerTop, centerSub, size = 190 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size / 2 - 16, stroke = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      {segments.map((s, i) => {
        if (s.value <= 0) return null;
        const dash = (s.value / total) * circ;
        const node = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        );
        offset += dash;
        return node;
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fill="#f1f5f9" fontSize="28" fontWeight="900" style={{ fontFamily: 'var(--font-display)' }}>{centerTop}</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill="#94a3b8" fontSize="11">{centerSub}</text>
    </svg>
  );
}

// ── Tiny bar chart ──────────────────────────────────────────────────────────
function Bars({ data, height = 150, accent = 'var(--grad-primary)' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, padding: '8px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6, height: '100%' }}>
          <span style={{ fontSize: 11, color: 'var(--accent-light)', fontWeight: 700, minHeight: 14 }}>{d.value || ''}</span>
          <div style={{ width: '100%', maxWidth: 42, height: `${(d.value / max) * 100}%`, minHeight: d.value ? 4 : 0, background: accent, borderRadius: '6px 6px 0 0', transition: 'height var(--dur-slow) var(--ease-out)' }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const kpiCard = {
  background: 'var(--glass-bg-light)', border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center',
};
const sectionTitle = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: '0 0 var(--space-4)' };

export default function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [vault, setVault] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!getToken() || !user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    Promise.all([
      api.get(ENDPOINTS.STATS).catch(() => null),
      api.get(ENDPOINTS.VAULT(user.id)).catch(() => []),
    ])
      .then(([s, v]) => {
        setStats(s);
        setVault(Array.isArray(v) ? v : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--grad-bg)', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size={40} color="var(--accent-indigo)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Crunching your study data…</p>
        </div>
      </div>
    );
  }

  const s = stats || {};
  const m = s.mastery || { new: 0, learning: 0, young: 0, mature: 0 };

  // 7-day due forecast (fill all days)
  const forecastMap = {};
  (s.forecast || []).forEach((f) => { forecastMap[f.day] = f.count; });
  const forecastBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }), value: forecastMap[key] || 0 };
  });

  // Cards saved per week (last 8 weeks) from the vault.
  const now = Date.now();
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const weekBuckets = Array(8).fill(0);
  vault.forEach((c) => {
    const t = new Date(c.created_at).getTime();
    if (Number.isNaN(t)) return;
    const w = Math.floor((now - t) / WEEK);
    if (w >= 0 && w < 8) weekBuckets[7 - w] += 1;
  });
  const activityBars = weekBuckets.map((v, i) => ({ label: i === 7 ? 'Now' : `${8 - i}w`, value: v }));

  // Top topics (keywords from saved questions).
  const freq = {};
  vault.forEach((c) => {
    (c.question || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
      .forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  });
  const topics = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15)
    .map(([word, count]) => ({ word, size: Math.max(13, 13 + count * 4) }));

  const masterySegments = [
    { label: 'New', value: m.new, color: '#64748b' },
    { label: 'Learning', value: m.learning, color: '#fb923c' },
    { label: 'Young', value: m.young, color: '#38bdf8' },
    { label: 'Mature', value: m.mature, color: '#34d399' },
  ];

  const KPIS = [
    { icon: '📚', label: 'Saved cards', value: s.totalCards ?? 0 },
    { icon: '🧠', label: 'Due now', value: s.dueNow ?? 0 },
    { icon: '🔁', label: 'Total reviews', value: s.totalReviews ?? 0 },
    { icon: '🔥', label: 'Day streak', value: s.currentStreak ?? 0, sub: `best ${s.longestStreak ?? 0}` },
    { icon: '🎯', label: 'Avg recall', value: `${s.avgQuality ?? 0}/5` },
    { icon: '😎', label: 'Mastered', value: m.mature },
  ];

  const hasAnyData = (s.totalCards ?? 0) > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grad-bg)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-black)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Icon3D code="📊" size={28} /> Study Analytics
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0' }}>
              {s.lastStudied ? `Last studied ${new Date(s.lastStudied).toLocaleDateString('en-IN')}` : 'Your learning, visualized'}
            </p>
          </div>
          {(s.dueNow ?? 0) > 0 && (
            <Link to={ROUTES.REVIEW} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: '#fff', background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)', fontWeight: 'var(--weight-bold)' }}>
              <Icon3D code="🧠" size={18} /> Review {s.dueNow} due
            </Link>
          )}
        </div>

        {!hasAnyData ? (
          <GlassCard holo>
            <EmptyState
              icon={<Icon3D code="📊" size={32} />}
              title="No study data yet"
              description="Save a few questions to your vault and start reviewing — your streaks, mastery, and forecast will appear here."
              action={<Link to={ROUTES.VALUE_INPUT} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: '#fff', background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)', fontWeight: 'var(--weight-bold)' }}>Generate questions</Link>}
            />
          </GlassCard>
        ) : (
          <>
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              {KPIS.map((k) => (
                <div key={k.label} style={kpiCard}>
                  <div style={{ marginBottom: 6 }}><Icon3D code={k.icon} size={26} /></div>
                  <div className="ds-holo-text" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-black)' }}>{k.value}</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '2px 0 0' }}>{k.label}</p>
                  {k.sub && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: '2px 0 0' }}>{k.sub}</p>}
                </div>
              ))}
            </div>

            {/* Charts grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              {/* Mastery donut */}
              <GlassCard>
                <h3 style={sectionTitle}>Mastery distribution</h3>
                <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Donut segments={masterySegments} centerTop={s.totalCards ?? 0} centerSub="cards" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {masterySegments.map((seg) => (
                      <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{seg.label}</span>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>{seg.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* 7-day forecast */}
              <GlassCard>
                <h3 style={sectionTitle}>Due in the next 7 days</h3>
                <Bars data={forecastBars} />
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
                  Cards SM-2 has scheduled for review each day
                </p>
              </GlassCard>
            </div>

            {/* Activity + topics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
              <GlassCard>
                <h3 style={sectionTitle}>Cards saved per week</h3>
                <Bars data={activityBars} accent="linear-gradient(180deg, #34d399, #0ea5e9)" />
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>Last 8 weeks</p>
              </GlassCard>

              <GlassCard>
                <h3 style={sectionTitle}>Your top topics</h3>
                {topics.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-3) 0' }}>
                    {topics.map((t) => (
                      <span key={t.word} style={{ fontSize: t.size, fontWeight: t.size > 22 ? 800 : 600, color: 'var(--accent-light)', lineHeight: 1.2 }}>{t.word}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>Save more cards to see your topics.</p>
                )}
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
