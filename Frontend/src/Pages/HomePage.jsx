import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { getToken, getUser } from '../lib/auth';
import { ENDPOINTS, ROUTES } from '../lib/constants';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/ui/GlassCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Icon3D from '../components/ui/Icon3D';
import Footer from '../components/Footer';
import InteractiveBackdrop from '../components/InteractiveBackdrop';

// ── Shared inline style helpers (token-driven) ──────────────────────────────
const ctaBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '14px 26px', borderRadius: 'var(--radius-md)', fontWeight: 'var(--weight-bold)',
  fontSize: 'var(--text-base)', textDecoration: 'none', cursor: 'pointer',
  transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast)',
};
const ctaPrimary = { ...ctaBase, background: 'var(--grad-primary)', color: '#fff', boxShadow: 'var(--shadow-glow)' };
const ctaGhost = { ...ctaBase, background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1.5px solid var(--glass-border)' };

const sectionStyle = { maxWidth: 1100, margin: '0 auto', padding: 'var(--space-16) var(--space-6)' };
const h2Style = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-black)', margin: 0, color: 'var(--text-primary)' };

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [vaultCards, setVaultCards] = useState([]); // preview (max 3)
  const [fullVaultCards, setFullVaultCards] = useState([]); // full data for analysis + export
  const [vaultLoading, setVaultLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = getToken();
    const parsedUser = getUser();
    if (!token || !parsedUser) return;

    setIsLoggedIn(true);
    setUser(parsedUser);

    // Study stats (streak / due count) for the dashboard — non-blocking.
    api.get(ENDPOINTS.STATS).then(setStats).catch(() => {});

    setVaultLoading(true);
    api
      .get(ENDPOINTS.VAULT(parsedUser.id))
      .then((data) => {
        setFullVaultCards(data);
        setVaultCards(data.slice(0, 3));
      })
      .catch(() => {
        setFullVaultCards([]);
        setVaultCards([]);
      })
      .finally(() => setVaultLoading(false));
  }, []);

  // ── Export: CSV (no external libs) ──
  const exportToCSV = () => {
    if (fullVaultCards.length === 0) return toast.error('Your vault is empty — nothing to export.');
    const headers = ['Question', 'Answer', 'Saved Date'];
    const rows = fullVaultCards.map((card) => [
      `"${card.question.replace(/"/g, '""')}"`,
      `"${card.answer.replace(/"/g, '""')}"`,
      new Date(card.created_at).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `StudyAI-Vault-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Export: PDF via print window ──
  const exportToPDF = () => {
    if (fullVaultCards.length === 0) return toast.error('Your vault is empty — nothing to export.');
    const printContent = `
      <style>
        @page { margin: 1cm; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e2937; }
        h1 { text-align: center; color: #1e40af; }
        .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
      </style>
      <h1>StudyAI • Your Private Vault</h1>
      <p style="text-align:center; margin-bottom:30px;">Exported on ${new Date().toLocaleString('en-IN')}</p>
      ${fullVaultCards
        .map(
          (card) => `
        <div class="card">
          <h3 style="margin:0 0 8px 0; color:#1e40af;">${card.question}</h3>
          <p style="margin:0; color:#334155;">${card.answer}</p>
          <p style="font-size:12px; color:#64748b; margin-top:12px;">Saved on ${new Date(card.created_at).toLocaleDateString('en-IN')}</p>
        </div>`
        )
        .join('')}
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>StudyAI Vault Export</title></head><body>${printContent}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // Real cards-saved-per-week over the last 4 weeks (oldest → most recent),
  // computed from each card's created_at timestamp.
  const getActivityBars = () => {
    const now = Date.now();
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    const buckets = [0, 0, 0, 0]; // index 0 = 3–4 weeks ago … index 3 = this week
    fullVaultCards.forEach((c) => {
      const t = new Date(c.created_at).getTime();
      if (Number.isNaN(t)) return;
      const weeksAgo = Math.floor((now - t) / WEEK);
      if (weeksAgo >= 0 && weeksAgo < 4) buckets[3 - weeksAgo] += 1;
    });
    return buckets;
  };

  const thisMonthCount = fullVaultCards.filter((c) => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const bars = getActivityBars();
  const maxBar = Math.max(...bars, 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grad-bg)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', position: 'relative', overflowX: 'clip' }}>
      <InteractiveBackdrop />
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* ── Hero ── */}
      <section style={{ ...sectionStyle, textAlign: 'center', paddingTop: 'var(--space-16)' }}>
        <Badge tone="indigo" style={{ marginBottom: 'var(--space-5)' }}>✦ AI-Powered · OCR + Gemini</Badge>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 'var(--weight-black)', letterSpacing: '-1.5px', lineHeight: 'var(--leading-tight)', margin: '0 0 var(--space-5)' }}>
          Turn your study material into
          <br />
          <span className="ds-holo-text">smart quizzes</span>
        </h1>
        <p style={{ maxWidth: 640, margin: '0 auto var(--space-8)', color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-relaxed)' }}>
          Upload photos of your textbooks or paste your lecture notes. Our AI extracts the core concepts and
          generates high-quality questions and answers instantly.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center' }}>
          <Link to={ROUTES.IMAGE_INPUT} style={ctaPrimary}>Try Image OCR</Link>
          <Link to={ROUTES.VALUE_INPUT} style={ctaGhost}>Topic Search</Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={sectionStyle}>
        <h2 style={{ ...h2Style, textAlign: 'center', marginBottom: 'var(--space-10)' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
          {[
            { n: 1, t: 'Capture', d: 'Snap a photo of your book or notes. JPG, PNG, and WebP supported.' },
            { n: 2, t: 'Extract', d: 'Tesseract.js reads the text locally in your browser for 100% privacy.' },
            { n: 3, t: 'Generate', d: 'Gemini analyzes the context to create relevant Q&A pairs.' },
          ].map((s) => (
            <GlassCard key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, margin: '0 auto var(--space-4)', borderRadius: 'var(--radius-md)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--accent-light)', background: 'var(--grad-holo-soft)', border: '1.5px solid var(--glass-border)' }}>{s.n}</div>
              <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>{s.t}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>{s.d}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={sectionStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-8)', alignItems: 'center' }}>
          <div>
            <h2 style={{ ...h2Style, marginBottom: 'var(--space-6)' }}>Built for modern students</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                ['Privacy first', 'Text extraction happens on your device, not our servers.'],
                ['AI accuracy', 'Powered by Google Gemini.'],
                ['Lightning fast', 'Get your study guide in seconds.'],
              ].map(([t, d]) => (
                <li key={t} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent-emerald)', fontSize: 20, lineHeight: 1.2 }}>✓</span>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>{t}:</strong> {d}</p>
                </li>
              ))}
            </ul>
          </div>
          <GlassCard holo style={{ padding: 'var(--space-6)' }}>
            <pre style={{ margin: 0, overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: '#7dd3fc', background: 'var(--bg-900)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', lineHeight: 'var(--leading-relaxed)' }}>
              <code>{`// Your AI prompt in action
const prompt = "Generate a JSON array...";
const result = await model.generate(pageText);
return result.response.json();`}</code>
            </pre>
          </GlassCard>
        </div>
      </section>

      {/* ── Logged-in dashboard OR guest teaser ── */}
      {isLoggedIn ? (
        <section style={sectionStyle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <div>
              <h2 style={h2Style}>Your private vault</h2>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>
                {user?.email ? `Signed in as ${user.email} · ` : ''}Recently saved Q&amp;A · ready for revision
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
              <Link to={ROUTES.REVIEW} style={ctaPrimary}>
                <Icon3D code="🧠" size={18} /> Review{stats?.dueNow ? ` · ${stats.dueNow} due` : ''}
              </Link>
              <Link to={ROUTES.ANALYTICS} style={ctaGhost}><Icon3D code="📊" size={18} /> Analytics</Link>
              <Link to={ROUTES.QUIZ} style={ctaGhost}><Icon3D code="🃏" size={18} /> Quiz</Link>
              <button onClick={exportToCSV} style={ctaGhost}><Icon3D code="📥" size={18} /> CSV</button>
              <button onClick={exportToPDF} style={ctaGhost}><Icon3D code="📄" size={18} /> PDF</button>
              <Link to={ROUTES.VAULT} style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>Open full vault →</Link>
            </div>
          </div>

          {/* Vault preview */}
          {vaultLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
              {[0, 1, 2].map((i) => (
                <GlassCard key={i}>
                  <Skeleton height={18} style={{ marginBottom: 12 }} />
                  <Skeleton height={12} width="90%" style={{ marginBottom: 8 }} />
                  <Skeleton height={12} width="75%" />
                </GlassCard>
              ))}
            </div>
          ) : vaultCards.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
              {vaultCards.map((card) => (
                <GlassCard key={card.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', margin: '0 0 var(--space-3)' }}>{card.question}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', margin: 0, flex: 1 }}>{card.answer}</p>
                  <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--glass-border)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Saved {new Date(card.created_at).toLocaleDateString('en-IN')}
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard style={{ marginBottom: 'var(--space-12)' }}>
              <EmptyState
                icon={<Icon3D code="🗂" size={30} />}
                title="Your vault is empty"
                description="Generate your first quiz from Image OCR or Topic Search and save it here."
                action={<Link to={ROUTES.VALUE_INPUT} style={ctaPrimary}>Generate a quiz</Link>}
              />
            </GlassCard>
          )}

          {/* Insights */}
          <GlassCard>
            <h3 style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)', margin: '0 0 var(--space-6)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
              Vault insights <Badge tone="success">Live · real data</Badge>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
              {[
                [fullVaultCards.length, 'Total saved'],
                [thisMonthCount, 'This month'],
                ['100%', 'Privacy protected'],
                [fullVaultCards.length > 0 ? 'Ready' : '—', 'For revision'],
              ].map(([val, label], i) => (
                <div key={i} style={{ background: 'var(--glass-bg-light)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center' }}>
                  <div className="ds-holo-text" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-black)', marginBottom: 4 }}>{val}</div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{label}</p>
                </div>
              ))}
            </div>

            <h4 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>Study activity</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', height: 200, background: 'var(--glass-bg-light)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              {bars.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-2)', height: '100%' }}>
                  <div style={{ width: '100%', height: `${Math.max((h / maxBar) * 100, 2)}%`, background: 'var(--grad-primary)', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', transition: 'height var(--dur-slow) var(--ease-out)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{['4w', '3w', '2w', 'Now'][i]}</span>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)' }}>
              Cards saved per week — last 4 weeks (live, from your vault)
            </p>
          </GlassCard>
        </section>
      ) : (
        <section style={{ ...sectionStyle, textAlign: 'center' }}>
          <GlassCard holo style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ ...h2Style, fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Make StudyAI your personal AI tutor</h2>
            <p style={{ maxWidth: 460, margin: '0 auto var(--space-8)', color: 'var(--text-secondary)' }}>
              Create a free account for quizzes tailored to your age, degree, difficulty, and preferred question style.
              Your data stays private and your vault grows with every session.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center' }}>
              <Link to={ROUTES.SIGNUP} style={ctaPrimary}>Create free account</Link>
              <Link to={ROUTES.LOGIN} style={ctaGhost}>Log in</Link>
            </div>
          </GlassCard>
        </section>
      )}

      {/* ── Footer ── */}
      <Footer />
      </div>
    </div>
  );
}
