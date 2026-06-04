import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { GRAPH, FILE_TREE, API, DIAGRAMS, GROUPS, MODULES, GLOSSARY } from '../lib/wikiData';
import WikiGraph from '../components/wiki/WikiGraph';
import FileTree from '../components/wiki/FileTree';
import Mermaid from '../components/wiki/Mermaid';

// ─────────────────────────────────────────────────────────────────────────────
// Project Wiki — an interactive, full-screen documentation experience.
// Reached from AdminLogs; lazy-loaded so its weight (and Mermaid) never touches
// the main bundle. Content is data-driven from lib/wikiData.js.
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'overview', title: 'Overview', icon: '🌌' },
  { id: 'graph', title: 'Architecture graph', icon: '🕸️' },
  { id: 'tree', title: 'Project tree', icon: '🌳' },
  { id: 'frontend', title: 'Frontend', icon: '🎨' },
  { id: 'backend', title: 'Backend', icon: '⚙️' },
  { id: 'database', title: 'Database', icon: '🗄️' },
  { id: 'flows', title: 'Key flows', icon: '🔀' },
  { id: 'api', title: 'API reference', icon: '🔌' },
  { id: 'reference', title: 'Code reference', icon: '📚' },
  { id: 'security', title: 'Security & PII', icon: '🔐' },
  { id: 'admin', title: 'Protect admin logs', icon: '🛡️' },
  { id: 'deploy', title: 'Git & deploy', icon: '🚀' },
  { id: 'glossary', title: 'Glossary', icon: '📘' },
];

// kind → small coloured tag in the code reference.
const KIND_TONE = {
  fn: '#34d399', hook: '#818cf8', comp: '#22d3ee', const: '#fbbf24',
  mw: '#f472b6', svc: '#a78bfa', route: '#fb923c',
};

// ── small presentational helpers ─────────────────────────────────────────────
const H2 = ({ children }) => (
  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', margin: '0 0 var(--space-4)', color: 'var(--text-primary)' }}>{children}</h2>
);
const H3 = ({ children }) => (
  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', margin: 'var(--space-6) 0 var(--space-2)', color: 'var(--text-primary)' }}>{children}</h3>
);
const P = ({ children }) => (
  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-3)' }}>{children}</p>
);
const Card = ({ children }) => (
  <div style={{ background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>{children}</div>
);
const Code = ({ children }) => (
  <pre style={{ overflowX: 'auto', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-900)', border: '1.5px solid var(--glass-border)', color: 'var(--accent-light)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', margin: '0 0 var(--space-4)' }}>{children}</pre>
);

const TechBadge = ({ children }) => (
  <span style={{ display: 'inline-block', padding: '4px 12px', margin: '0 6px 6px 0', borderRadius: 'var(--radius-full)', background: 'var(--grad-holo-soft)', border: '1.5px solid var(--glass-border)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>{children}</span>
);

// ── section bodies ───────────────────────────────────────────────────────────
function Overview() {
  return (
    <>
      <H2>StudyAI — the whole project, end to end</H2>
      <P>StudyAI turns <strong>any topic, your notes, or a photo</strong> into AI-generated quizzes and spaced-repetition flashcards. A learner picks a topic (or uploads an image), the app reads it, asks Google Gemini for tailored question/answer pairs, and lets them study with flip-cards that schedule themselves using the proven <strong>SM-2</strong> algorithm.</P>
      <H3>The stack</H3>
      <div>
        <TechBadge>React 19</TechBadge><TechBadge>Vite 7</TechBadge><TechBadge>Tailwind 4</TechBadge><TechBadge>react-router 7</TechBadge><TechBadge>tesseract.js (OCR)</TechBadge>
        <TechBadge>Express 5</TechBadge><TechBadge>Neon Postgres</TechBadge><TechBadge>Google Gemini</TechBadge><TechBadge>JWT + bcrypt</TechBadge><TechBadge>helmet · rate-limit</TechBadge>
      </div>
      <H3>How it was built — 5 phases</H3>
      <Card>
        <P>① <strong>Foundation & safety</strong> — modular frontend/backend, a single API client, code-driven idempotent migrations, structured logging, JWT auth.</P>
        <P>② <strong>Premium design system</strong> — the "Holographic Glass" look: one set of CSS-variable tokens driving every surface, fully responsive, reduced-motion aware.</P>
        <P>③ <strong>Features & algorithms</strong> — SM-2 spaced repetition, an analytics dashboard, adaptive difficulty fed into the AI prompt, quiz mode, vault decks & Anki export.</P>
        <P>④ <strong>Performance & polish</strong> — an 8-theme selector, accent tokenization, an accessibility sweep, route code-splitting, security + PII hardening, request-id logging, and a PWA.</P>
        <P>⑤ <strong>This wiki</strong> — an interactive, visual map of the entire codebase.</P>
      </Card>
      <P style={{ color: 'var(--text-muted)' }}>Tip: open <strong>Architecture graph</strong> to explore how every module connects — drag the nodes, hover to highlight neighbours, click to inspect.</P>
    </>
  );
}

function GraphSection() {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <H2>Architecture graph</H2>
      <P>Every node is a module; every line is a "depends-on" relationship. <strong>Drag</strong> nodes around, <strong>hover</strong> to spotlight a module and its neighbours, and <strong>click</strong> a node to read what it does.</P>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        {Object.entries(GROUPS).map(([k, g]) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: g.color }} /> {g.label}
          </span>
        ))}
      </div>
      <WikiGraph nodes={GRAPH.nodes} links={GRAPH.links} onSelect={setSelected} selectedId={selected?.id} />
      <div style={{ marginTop: 'var(--space-4)', minHeight: 64 }}>
        {selected ? (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: (GROUPS[selected.group] || {}).color }} />
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{selected.label}</strong>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{(GROUPS[selected.group] || {}).label}</span>
            </div>
            <P>{selected.desc}</P>
          </Card>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>Click any node to inspect it.</p>
        )}
      </div>
    </>
  );
}

function TreeSection() {
  return (
    <>
      <H2>Project tree</H2>
      <P>The full layout of the repository. Folders are collapsible; every entry explains its role.</P>
      <FileTree tree={FILE_TREE} />
    </>
  );
}

function FrontendSection() {
  return (
    <>
      <H2>Frontend</H2>
      <P>A Vite + React 19 single-page app. <code>main.jsx</code> mounts <code>&lt;App&gt;</code>, which builds the router and nests the provider tree: <strong>ErrorBoundary → ThemeProvider → AuthProvider → ToastProvider → ConfirmProvider</strong>. Every page is <code>React.lazy</code>-loaded, so each route ships as its own chunk.</P>
      <H3>One styling source of truth</H3>
      <P>Every colour, font, space and motion value lives in <code>styles/tokens.css</code> as a CSS variable. Components only ever reference <code>var(--token)</code> — which is exactly why the theme selector can repaint the entire app instantly: <code>ThemeContext</code> just rewrites those variables on <code>:root</code> and persists the choice.</P>
      <H3>The API client</H3>
      <P><code>lib/api.js</code> is the single gateway to the backend: it guards a missing <code>VITE_API_URL</code>, automatically attaches the JWT as a Bearer header, clears the session on <code>401</code>, and normalises errors so each carries a <code>status</code> and the server <code>requestId</code>.</P>
      <H3>Provider tree</H3>
      <P>Global concerns are layered as nested providers, so any component can reach theme, auth, toasts and confirm dialogs:</P>
      <Mermaid chart={DIAGRAMS.providers} />
    </>
  );
}

function BackendSection() {
  return (
    <>
      <H2>Backend</H2>
      <P>An Express 5 app. <code>index.js</code> loads config, runs idempotent migrations, then listens. <code>app.js</code> wires the middleware stack in order, mounts the routers, and ends with a 404 and a global error handler.</P>
      <H3>Request lifecycle</H3>
      <P>Every request flows through the same hardened pipeline before reaching a handler:</P>
      <Mermaid chart={DIAGRAMS.request} />
      <H3>Services</H3>
      <P><code>gemini.js</code> talks to Google Gemini with a structured-output schema (guaranteeing valid JSON). <code>sm2.js</code> implements spaced repetition. <code>adaptive.js</code> reads recent recall quality to nudge the AI's difficulty. <code>logger.js</code> tags every line with a request id via <code>AsyncLocalStorage</code>.</P>
    </>
  );
}

function DatabaseSection() {
  return (
    <>
      <H2>Database</H2>
      <P>Neon serverless Postgres. The schema is created from code (<code>migrate.js</code>) using <code>CREATE TABLE IF NOT EXISTS</code> — so it runs safely on every boot and never touches existing data.</P>
      <Mermaid chart={DIAGRAMS.er} />
    </>
  );
}

function FlowsSection() {
  return (
    <>
      <H2>Key flows</H2>
      <H3>Authentication</H3>
      <Mermaid chart={DIAGRAMS.auth} />
      <H3>AI generation</H3>
      <Mermaid chart={DIAGRAMS.ai} />
      <H3>SM-2 spaced repetition</H3>
      <Mermaid chart={DIAGRAMS.sm2} />
      <H3>Personalisation</H3>
      <P>Profile (age, degree, goal) and recent recall scores both feed the prompt that Gemini receives:</P>
      <Mermaid chart={DIAGRAMS.personalization} />
    </>
  );
}

function ApiSection() {
  const tone = { public: '#94a3b8', optional: '#22d3ee', token: '#34d399', admin: '#fbbf24' };
  return (
    <>
      <H2>API reference</H2>
      <P>All endpoints are mounted at the server root. <code>token</code> = requires a valid JWT; <code>admin</code> = additionally gated by <code>ADMIN_EMAIL</code>.</P>
      <div style={{ overflowX: 'auto', border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--glass-bg)' }}>
              {['Method', 'Path', 'Auth', 'Purpose'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 'var(--text-xs)', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {API.map((e) => (
              <tr key={e.method + e.path} style={{ borderTop: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-light)' }}>{e.method}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{e.path}</td>
                <td style={{ padding: '10px 14px' }}><span style={{ color: tone[e.auth] || 'var(--text-secondary)', fontWeight: 700 }}>{e.auth}</span></td>
                <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SecuritySection() {
  return (
    <>
      <H2>Security & PII model</H2>
      <P>Defence in depth, with privacy by design:</P>
      <Card>
        <P>🔑 <strong>Passwords</strong> are bcrypt-hashed (salt rounds 10) and never returned — even profile updates select explicit columns, never <code>*</code>.</P>
        <P>🪪 <strong>Identity</strong> comes from the signed JWT (<code>req.user</code>), never the request body. Vault and reviews are owner-scoped by the token's user id.</P>
        <P>⏱️ <strong>Brute-force</strong> is slowed by a strict auth rate-limiter (failed attempts only) and a dummy bcrypt compare that equalises login timing against user enumeration.</P>
        <P>🛡️ <strong>Headers & input</strong>: helmet sets security headers; express-validator validates and bounds every input; the JSON body is capped at 1 MB.</P>
        <P>🙈 <strong>PII</strong>: the activity log contains other users' emails, so <code>/admin/logs</code> is gated by <code>requireAdmin</code>. Logs never record passwords or bodies — only method, path, status, and a correlation id.</P>
      </Card>
    </>
  );
}

function AdminSection() {
  return (
    <>
      <H2>Protect the admin logs</H2>
      <P>The activity dashboard exposes other users' emails (PII), so it must be restricted to you. The gate is already built — you just opt in by setting one environment variable on the server.</P>
      <H3>Lock it down</H3>
      <P>Add this to the backend environment (Render dashboard, or <code>Server/.env</code> locally):</P>
      <Code>ADMIN_EMAIL=your-login-email@example.com</Code>
      <P>With it set, only that account can open the logs (and this wiki's entry button) — everyone else gets a clean "Admin access required" screen. While it's <em>unset</em>, the server logs a startup warning and the gate stays open for backward compatibility.</P>
      <H3>How the gate works</H3>
      <P>The <code>requireAdmin</code> middleware runs after <code>verifyToken</code> and compares <code>req.user.email</code> to <code>config.adminEmail</code>. If they match, the request proceeds; otherwise it returns <code>403</code>.</P>
      <H3>Future hardening (optional)</H3>
      <P>For multiple admins, add an <code>is_admin BOOLEAN</code> column to <code>users</code> (via an idempotent <code>ALTER TABLE … ADD COLUMN IF NOT EXISTS</code> in <code>migrate.js</code>), include it in the JWT at login, and have <code>requireAdmin</code> check that flag instead of a single email.</P>
    </>
  );
}

function DeploySection() {
  return (
    <>
      <H2>Git & deployment</H2>
      <P>One branch (<code>origin/main</code>), no pull requests needed. A push auto-deploys: <strong>Vercel</strong> rebuilds the frontend, <strong>Render</strong> rebuilds the backend. A failed build never replaces the working live version.</P>
      <H3>Ship it</H3>
      <Code>{`git add .
git commit -m "your message"
git push          # → Vercel + Render auto-deploy`}</Code>
      <H3>Roll back instantly</H3>
      <P><strong>Fastest (no git):</strong> Vercel → Deployments → pick the last good one → "Promote to Production". Render → Deploys → "Rollback".</P>
      <P><strong>Via git (clean):</strong></P>
      <Code>{`git revert HEAD   # undoes the last commit as a new commit
git push          # redeploys the reverted code`}</Code>
      <H3>Required environment variables</H3>
      <Card>
        <P><strong>Vercel (frontend):</strong> <code>VITE_API_URL</code> → your Render backend URL.</P>
        <P><strong>Render (backend):</strong> <code>DATABASE_URL</code>, <code>JWT_SECRET</code>, <code>GEMINI_API_KEY</code> (required) · optional <code>MODEL</code>, <code>ADMIN_EMAIL</code>, <code>CORS_ORIGIN</code>.</P>
      </Card>
    </>
  );
}

function ReferenceSection() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const filtered = MODULES
    .map((m) => {
      if (!query) return m;
      const moduleMatch = m.file.toLowerCase().includes(query) || m.summary.toLowerCase().includes(query);
      const items = moduleMatch ? m.items : m.items.filter((it) => `${it.name} ${it.sig} ${it.desc}`.toLowerCase().includes(query));
      return { ...m, items };
    })
    .filter((m) => m.items.length > 0);

  return (
    <>
      <H2>Code reference</H2>
      <P>Every key module and its exported API — functions, hooks, components, middleware and services. Search by file, name or keyword.</P>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search the code reference"
        placeholder="Search functions, files, keywords…"
        style={{
          width: '100%', boxSizing: 'border-box', padding: '12px 16px', marginBottom: 'var(--space-5)',
          background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontFamily: 'var(--font-sans)', outline: 'none',
        }}
      />
      {filtered.map((m) => (
        <Card key={m.file}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>{m.file}</strong>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: (GROUPS[m.group] || {}).color }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{m.summary}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {m.items.map((it) => (
              <div key={it.name} style={{ paddingLeft: 'var(--space-3)', borderLeft: `2px solid ${KIND_TONE[it.kind] || 'var(--glass-border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: KIND_TONE[it.kind] || 'var(--text-muted)', letterSpacing: '0.06em' }}>{it.kind}</span>
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 700 }}>{it.name}</code>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent-light)', margin: '2px 0 3px' }}>{it.sig}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>{it.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      ))}
      {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No matches for “{q}”.</p>}
    </>
  );
}

function GlossarySection() {
  return (
    <>
      <H2>Glossary</H2>
      <P>Plain-language definitions — gentle for a newcomer, a quick refresher for everyone else.</P>
      {GLOSSARY.map((g) => (
        <Card key={g.term}>
          <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>{g.term}</strong>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', margin: 'var(--space-2) 0 0' }}>{g.def}</p>
        </Card>
      ))}
    </>
  );
}

const RENDER = {
  overview: Overview, graph: GraphSection, tree: TreeSection, frontend: FrontendSection,
  backend: BackendSection, database: DatabaseSection, flows: FlowsSection, api: ApiSection,
  reference: ReferenceSection, security: SecuritySection, admin: AdminSection, deploy: DeploySection,
  glossary: GlossarySection,
};

export default function Wiki() {
  const [active, setActive] = useState('overview');
  const Section = RENDER[active] || Overview;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grad-bg)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--space-6) var(--space-5) var(--space-12)', display: 'grid', gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)', gap: 'var(--space-6)' }}>
        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 'var(--space-6)', alignSelf: 'start', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <div className="ds-holo-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)' }}>Project Wiki</div>
            <Link to={ROUTES.ADMIN_LOGS} style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-light)', textDecoration: 'none' }}>← Back to Admin</Link>
          </div>
          <nav aria-label="Wiki sections" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTIONS.map((s) => {
              const on = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  aria-current={on ? 'page' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', cursor: 'pointer',
                    padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none',
                    fontSize: 'var(--text-sm)', fontWeight: on ? 700 : 500, fontFamily: 'var(--font-sans)',
                    color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: on ? 'var(--grad-holo-soft)' : 'transparent',
                    borderLeft: `2px solid ${on ? 'var(--accent-indigo)' : 'transparent'}`,
                  }}
                >
                  <span aria-hidden="true">{s.icon}</span> {s.title}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main style={{ minWidth: 0, animation: 'ds-fade-up var(--dur) var(--ease-out) both' }}>
          <Section />
        </main>
      </div>
    </div>
  );
}
