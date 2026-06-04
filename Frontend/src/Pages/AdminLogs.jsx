import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ENDPOINTS, ROUTES } from '../lib/constants';

// ─── Utility: format IST time ────────────────────────────────────────────────
const fmtTime = (ts) =>
  new Date(ts).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

// ─── Export CSV ──────────────────────────────────────────────────────────────
const exportCSV = (logs) => {
  const header = ['Email', 'Topic', 'Time (IST)'];
  const rows = logs.map((l) => [`"${l.email}"`, `"${l.topic}"`, `"${fmtTime(l.search_time)}"`]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: `studyai_logs_${Date.now()}.csv` });
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

// ─── Export PDF via print ────────────────────────────────────────────────────
const exportPDF = () => window.print();

// ─── Compute analytics from logs ────────────────────────────────────────────
const computeAnalytics = (logs) => {
  const topicCount = {};
  const userCount = {};
  const hourBucket = Array(24).fill(0);
  const today = new Date().toDateString();
  let todayCount = 0;

  logs.forEach((l) => {
    const t = (l.topic || '').trim().toLowerCase();
    const e = (l.email || '').trim().toLowerCase();
    topicCount[t] = (topicCount[t] || 0) + 1;
    userCount[e] = (userCount[e] || 0) + 1;
    const h = new Date(l.search_time).getHours();
    hourBucket[h]++;
    if (new Date(l.search_time).toDateString() === today) todayCount++;
  });

  const topTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const topUsers = Object.entries(userCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return {
    totalSearches: logs.length,
    uniqueUsers: Object.keys(userCount).length,
    uniqueTopics: Object.keys(topicCount).length,
    todaySearches: todayCount,
    topTopics, topUsers, hourBucket,
  };
};

// ─── Word Cloud ──────────────────────────────────────────────────────────────
const WordCloud = ({ topTopics }) => {
  if (!topTopics.length) return null;
  const max = topTopics[0][1];
  const colors = ['#818cf8', '#60a5fa', '#38bdf8', '#a5b4fc', '#7dd3fc', '#c084fc', '#22d3ee'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
      {topTopics.map(([topic, count], i) => {
        const ratio = count / max;
        const size = Math.round(11 + ratio * 20);
        const opacity = 0.6 + ratio * 0.4;
        const color = colors[i % colors.length];
        return (
          <span key={topic} style={{
            fontSize: size, fontWeight: ratio > 0.6 ? 800 : ratio > 0.3 ? 700 : 600,
            color, opacity, fontFamily: 'var(--font-display)', lineHeight: 1.3, cursor: 'default',
            transition: 'transform 0.2s, opacity 0.2s', display: 'inline-block',
          }}
            onMouseEnter={(e) => { e.target.style.opacity = 1; e.target.style.transform = 'scale(1.15)'; }}
            onMouseLeave={(e) => { e.target.style.opacity = opacity; e.target.style.transform = 'scale(1)'; }}
            title={`${count} search${count !== 1 ? 'es' : ''}`}
          >
            {topic}
          </span>
        );
      })}
    </div>
  );
};

// ─── Sparkline chart (24-hour buckets) ──────────────────────────────────────
const HourlyChart = ({ hourBucket }) => {
  const max = Math.max(...hourBucket, 1);
  const W = 600, H = 80, barW = W / 24;
  const now = new Date().getHours();
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: '100%', minWidth: 320 }}>
        {hourBucket.map((v, h) => {
          const bh = Math.max(4, (v / max) * H);
          const x = h * barW + barW * 0.15;
          const y = H - bh;
          const isNow = h === now;
          const color = isNow ? '#a5b4fc' : v > 0 ? '#6366f1' : 'rgba(255,255,255,0.1)';
          return (
            <g key={h}>
              <rect x={x} y={y} width={barW * 0.7} height={bh} rx={3} fill={color} opacity={isNow ? 1 : 0.8}>
                <title>{`${h}:00 — ${v} search${v !== 1 ? 'es' : ''}`}</title>
              </rect>
              {(h % 6 === 0) && (
                <text x={x + barW * 0.35} y={H + 16} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="var(--font-mono)">{h}h</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Top Users bar chart ─────────────────────────────────────────────────────
const TopUsers = ({ topUsers }) => {
  if (!topUsers.length) return <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No user data yet.</p>;
  const max = topUsers[0][1];
  const colors = ['#6366f1', '#818cf8', '#38bdf8', '#a5b4fc', '#7dd3fc', '#c084fc', '#22d3ee', '#60a5fa'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {topUsers.map(([email, count], i) => {
        const pct = (count / max) * 100;
        const initials = email.slice(0, 2).toUpperCase();
        return (
          <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0a0f1e', fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-display)',
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{email}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: colors[i % colors.length], fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{count}</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[(i + 2) % colors.length]})`, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon, accent, sub }) => (
  <div style={{
    background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px',
    boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: 6, cursor: 'default',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</span>
      <span style={{ fontSize: 18, lineHeight: 1, background: accent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{icon}</span>
    </div>
    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
  </div>
);

// ─── Section Card wrapper ─────────────────────────────────────────────────────
const SectionCard = ({ title, icon, action, children, style }) => (
  <div style={{
    background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
    boxShadow: 'var(--shadow-md)', ...style,
  }}>
    <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {action}
    </div>
    <div style={{ padding: '18px 22px' }}>{children}</div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [filter, setFilter] = useState('');
  const [pulse, setPulse] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [sortField, setSortField] = useState('search_time');
  const [sortDir, setSortDir] = useState('desc');
  const refreshRef = useRef(null);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.get(ENDPOINTS.ADMIN_LOGS);
      setLogs(data);
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
    } catch (err) {
      console.error('Error loading logs:', err);
      if (err.status === 403) setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(false);
    refreshRef.current = setInterval(() => fetchLogs(true), 30000);
    return () => clearInterval(refreshRef.current);
  }, [fetchLogs]);

  const analytics = useMemo(() => computeAnalytics(logs), [logs]);

  const filteredLogs = useMemo(() => {
    const q = filter.toLowerCase();
    return logs
      .filter((l) => l.email.toLowerCase().includes(q) || l.topic.toLowerCase().includes(q))
      .sort((a, b) => {
        let va = a[sortField], vb = b[sortField];
        if (sortField === 'search_time') { va = new Date(va); vb = new Date(vb); }
        else { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [logs, filter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };
  const sortIcon = (field) => (sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ⇅');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--grad-bg)', fontFamily: 'var(--font-sans)', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', boxShadow: 'var(--shadow-glow)', animation: 'spinPulse 1.4s ease-in-out infinite' }}>▦</div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Accessing secure logs…</p>
      <style>{`@keyframes spinPulse { 0%,100%{transform:scale(1) rotate(0deg);opacity:1} 50%{transform:scale(1.1) rotate(15deg);opacity:0.8} }`}</style>
    </div>
  );

  if (accessDenied) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--grad-bg)', fontFamily: 'var(--font-sans)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">🔒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: '0 0 8px' }}>Admin access required</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>This activity dashboard is restricted to administrators.</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'var(--font-sans)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <style>{`
        .al-page { min-height: 100vh; background: var(--grad-bg); padding: 32px 24px 64px; }

        @media print {
          .al-no-print { display: none !important; }
          .al-page { background: #fff !important; padding: 16px !important; color: #000 !important; }
          .al-table-wrap { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }

        .al-tab { padding: 8px 18px; border-radius: var(--radius-full); border: none; cursor: pointer; font-family: var(--font-sans); font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .al-tab.active { background: var(--grad-primary); color: #fff; box-shadow: var(--shadow-glow); }
        .al-tab:not(.active) { background: var(--glass-bg); color: var(--text-secondary); border: 1px solid var(--glass-border); }
        .al-tab:not(.active):hover { background: rgba(var(--accent-rgb),0.15); }

        .al-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: var(--radius-md); border: none; cursor: pointer; font-family: var(--font-sans); font-size: 12px; font-weight: 700; transition: transform 0.15s, box-shadow 0.15s; }
        .al-btn-primary { background: var(--grad-primary); color: #fff; box-shadow: var(--shadow-glow); }
        .al-btn-primary:hover { transform: translateY(-1px); box-shadow: var(--shadow-glow-strong); }
        .al-btn-outline { background: var(--glass-bg); color: var(--text-secondary); border: 1.5px solid var(--glass-border); }
        .al-btn-outline:hover { border-color: rgba(var(--accent-rgb),0.4); color: var(--text-primary); }

        .al-search { padding: 10px 18px; border-radius: var(--radius-md); border: 1.5px solid var(--glass-border); background: var(--glass-bg); font-family: var(--font-sans); font-size: 13px; color: var(--text-primary); outline: none; width: 100%; max-width: 280px; transition: border-color 0.2s, box-shadow 0.2s; }
        .al-search::placeholder { color: var(--text-muted); }
        .al-search:focus { border-color: rgba(var(--accent-rgb),0.6); box-shadow: var(--focus-ring); }

        .al-th { padding: 14px 18px; font-family: var(--font-sans); font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; background: rgba(255,255,255,0.04); cursor: pointer; user-select: none; white-space: nowrap; transition: color 0.15s; }
        .al-th:hover { color: var(--accent-light); }

        .al-tr { border-bottom: 1px solid var(--glass-border); transition: background 0.15s; }
        .al-tr:hover { background: rgba(var(--accent-rgb),0.08); }
        .al-tr:last-child { border-bottom: none; }
        .al-td { padding: 14px 18px; vertical-align: middle; }

        @media (max-width: 640px) {
          .al-thead { display: none; }
          .al-tr { display: block; border-radius: var(--radius-md); margin-bottom: 10px; border: 1.5px solid var(--glass-border) !important; background: var(--glass-bg) !important; }
          .al-td { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--glass-border); }
          .al-td:last-child { border-bottom: none; }
          .al-td::before { content: attr(data-label); font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-family: var(--font-sans); flex-shrink: 0; margin-right: 8px; }
          .al-search { max-width: 100%; }
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .insights-grid { grid-template-columns: 1fr !important; }
          .al-header-actions { flex-wrap: wrap; gap: 8px !important; }
        }

        .al-fade { animation: ds-fade-up 0.4s var(--ease-out) both; }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.7); } }
        .pulse-dot { animation: pulseDot 1.2s ease-in-out; }
      `}</style>

      <div className="al-page">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div className="al-fade" style={{ marginBottom: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <div style={{ padding: '6px 12px', borderRadius: 10, background: 'var(--grad-primary)', color: '#fff', fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Activity Intelligence</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div className={pulse ? 'pulse-dot' : ''} style={{ width: 8, height: 8, borderRadius: '50%', background: pulse ? 'var(--accent-emerald)' : 'var(--text-muted)', transition: 'background 0.3s' }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>LIVE</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Real-time user search tracking · auto-refreshes every 30s</p>
            </div>

            <div className="al-no-print al-header-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link to={ROUTES.WIKI} className="al-btn al-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>📖 Project Wiki</Link>
              <button className="al-btn al-btn-outline" onClick={() => exportCSV(filteredLogs)}>↓ CSV</button>
              <button className="al-btn al-btn-outline" onClick={exportPDF}>↓ PDF</button>
              <button className="al-btn al-btn-primary" onClick={() => fetchLogs(true)}>↺ Refresh</button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="al-fade kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24, animationDelay: '0.06s' }}>
            <KpiCard label="Total Searches" value={analytics.totalSearches} icon="◈" accent="linear-gradient(135deg,#818cf8,#38bdf8)" sub="all time" />
            <KpiCard label="Unique Users" value={analytics.uniqueUsers} icon="◉" accent="linear-gradient(135deg,#60a5fa,#22d3ee)" sub="registered" />
            <KpiCard label="Unique Topics" value={analytics.uniqueTopics} icon="▦" accent="linear-gradient(135deg,#818cf8,#c084fc)" sub="searched" />
            <KpiCard label="Today" value={analytics.todaySearches} icon="◎" accent="linear-gradient(135deg,#38bdf8,#34d399)" sub="searches today (IST)" />
          </div>

          {/* Tabs */}
          <div className="al-no-print al-fade" style={{ display: 'flex', gap: 8, marginBottom: 20, animationDelay: '0.1s' }}>
            <button className={`al-tab${activeTab === 'logs' ? ' active' : ''}`} onClick={() => setActiveTab('logs')}>▦ Logs</button>
            <button className={`al-tab${activeTab === 'insights' ? ' active' : ''}`} onClick={() => setActiveTab('insights')}>◈ Insights</button>
          </div>

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="al-fade">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <input className="al-search" type="text" aria-label="Search logs by email or topic" placeholder="Search by email or topic…" onChange={(e) => setFilter(e.target.value)} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '5px 12px', borderRadius: 100 }}>
                  {filteredLogs.length} / {logs.length} entries
                </span>
              </div>

              <div className="al-table-wrap" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead className="al-thead">
                    <tr>
                      <th className="al-th" onClick={() => toggleSort('email')} style={{ textAlign: 'left' }}>User Email{sortIcon('email')}</th>
                      <th className="al-th" onClick={() => toggleSort('topic')} style={{ textAlign: 'left' }}>Topic{sortIcon('topic')}</th>
                      <th className="al-th" onClick={() => toggleSort('search_time')} style={{ textAlign: 'right' }}>Time (IST){sortIcon('search_time')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="al-tr">
                        <td className="al-td" data-label="Email">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                              {log.email[0].toUpperCase()}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{log.email}</span>
                          </div>
                        </td>
                        <td className="al-td" data-label="Topic">
                          <span style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(251,191,36,0.14)', border: '1px solid rgba(251,191,36,0.35)', color: 'var(--accent-amber)', fontSize: 12, fontWeight: 600 }}>{log.topic}</span>
                        </td>
                        <td className="al-td" data-label="Time" style={{ textAlign: 'right' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{fmtTime(log.search_time)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredLogs.length === 0 && (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, margin: 0 }}>
                      {logs.length === 0 ? 'No activity logs recorded yet.' : 'No logs match your search.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INSIGHTS TAB */}
          {activeTab === 'insights' && (
            <div className="al-fade insights-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <SectionCard title="Topic Cloud" icon="◈" style={{ gridColumn: '1 / -1' }}>
                {analytics.topTopics.length ? <WordCloud topTopics={analytics.topTopics} /> : <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No topics yet.</p>}
              </SectionCard>

              <SectionCard title="Hourly Activity" icon="▬" action={<span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>24h · IST</span>}>
                <HourlyChart hourBucket={analytics.hourBucket} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>Current hour highlighted</p>
              </SectionCard>

              <SectionCard title="Most Active Users" icon="◉" action={<span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>top 8</span>}>
                <TopUsers topUsers={analytics.topUsers} />
              </SectionCard>

              <SectionCard title="Top Topics Ranked" icon="▦" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analytics.topTopics.slice(0, 10).map(([topic, count], i) => (
                    <div key={topic} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 'var(--radius-md)',
                      background: i < 3 ? 'var(--grad-holo-soft)' : 'var(--glass-bg-light)',
                      border: `1.5px solid ${i < 3 ? 'rgba(var(--accent-rgb),0.3)' : 'var(--glass-border)'}`,
                    }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: i < 3 ? 'var(--accent-light)' : 'var(--text-muted)' }}>#{i + 1}</span>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{topic}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', background: 'rgba(var(--accent-rgb),0.12)', padding: '2px 7px', borderRadius: 6 }}>{count}</span>
                    </div>
                  ))}
                  {analytics.topTopics.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No topics yet.</p>}
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
