// ─────────────────────────────────────────────────────────────────────────────
// Project Wiki — content model.
// A single, curated source of truth describing the whole StudyAI codebase:
// the architecture graph, the file tree, the API surface, the database schema,
// and the Mermaid diagrams. The Wiki page renders this; keeping it as data keeps
// the page component clean and the docs easy to extend.
// ─────────────────────────────────────────────────────────────────────────────

// Colour per layer — consumed by both the graph and the legends/badges.
export const GROUPS = {
  frontend: { label: 'Frontend', color: '#818cf8' },
  backend:  { label: 'Backend',  color: '#34d399' },
  database: { label: 'Database', color: '#fbbf24' },
  config:   { label: 'Config / Infra', color: '#22d3ee' },
};

// ── Architecture graph (Obsidian-style). Nodes = modules, links = depends-on. ──
export const GRAPH = {
  nodes: [
    // Frontend
    { id: 'main', label: 'main.jsx', group: 'frontend', desc: 'React entry. Mounts <App>, imports global styles, registers the PWA service worker in production.' },
    { id: 'App', label: 'App.jsx', group: 'frontend', desc: 'Router + provider tree (Error→Theme→Auth→Toast→Confirm). Lazy-loads every route; mounts ThemeSwitcher, BackToTop, OfflineNotice.' },
    { id: 'ThemeContext', label: 'ThemeContext', group: 'frontend', desc: '8 colour themes, 4 fonts, text-size & reduce-motion. Writes CSS variables onto :root; persists to localStorage.' },
    { id: 'AuthContext', label: 'AuthContext', group: 'frontend', desc: 'Holds the logged-in user/token; exposes login/logout to the app.' },
    { id: 'ToastContext', label: 'ToastContext', group: 'frontend', desc: 'Global toast notifications (success/error/info).' },
    { id: 'ConfirmContext', label: 'ConfirmContext', group: 'frontend', desc: 'Promise-based confirm dialogs.' },
    { id: 'api', label: 'lib/api.js', group: 'frontend', desc: 'Fetch wrapper: VITE_API_URL guard, auto Bearer token, 401→clear session, errors carry status + requestId.' },
    { id: 'constants', label: 'lib/constants.js', group: 'frontend', desc: 'ROUTES, ENDPOINTS, STORAGE_KEYS — no magic strings.' },
    { id: 'Header', label: 'Header', group: 'frontend', desc: 'Shared nav chrome.' },
    { id: 'ThemeSwitcher', label: 'ThemeSwitcher', group: 'frontend', desc: 'Floating appearance panel (themes/font/size/motion).' },
    { id: 'Icon3D', label: 'Icon3D', group: 'frontend', desc: '3D emoji with graceful fallback; decorative icons aria-hidden.' },
    { id: 'HomePage', label: 'HomePage', group: 'frontend', desc: 'Landing: stats, CTAs, real weekly activity.' },
    { id: 'ValueToQuestions', label: 'ValueToQuestions', group: 'frontend', desc: 'Topic → AI quiz.' },
    { id: 'PhotoToQuestions', label: 'PhotoToQuestions', group: 'frontend', desc: 'Image → OCR (tesseract.js, lazy) → AI quiz.' },
    { id: 'ResultSection', label: 'ResultSection', group: 'frontend', desc: 'Flip-card quiz UI; records SM-2 confidence on saved cards.' },
    { id: 'Vault', label: 'Vault', group: 'frontend', desc: 'Saved cards: decks/tags, search, Anki export.' },
    { id: 'Analytics', label: 'Analytics', group: 'frontend', desc: 'Dashboard: donut, bars, KPIs, forecast, topic cloud.' },
    { id: 'ReviewDue', label: 'ReviewDue', group: 'frontend', desc: 'Spaced-repetition review of due cards.' },
    { id: 'QuizMode', label: 'QuizMode', group: 'frontend', desc: 'Scored quiz from a deck; logs a study session.' },
    { id: 'AdminLogs', label: 'AdminLogs', group: 'frontend', desc: 'Admin activity dashboard + the entry to this Wiki.' },
    { id: 'Wiki', label: 'Wiki', group: 'frontend', desc: 'This interactive documentation experience.' },
    { id: 'tokens', label: 'tokens.css', group: 'frontend', desc: 'Design tokens — the single styling source of truth.' },

    // Backend
    { id: 'index', label: 'index.js', group: 'backend', desc: 'Server entry: config → migrate → listen.' },
    { id: 'app', label: 'app.js', group: 'backend', desc: 'Express app: helmet, CORS, JSON cap, requestContext, logger, rate limit, routes, error handler.' },
    { id: 'r_auth', label: 'routes/auth', group: 'backend', desc: '/signup, /login (authLimiter + dummy-hash timing), /info (validated, no password leak).' },
    { id: 'r_ai', label: 'routes/ai', group: 'backend', desc: '/page, /search/:value — builds the personalised Gemini prompt (profile + goal + adaptive hint).' },
    { id: 'r_vault', label: 'routes/vault', group: 'backend', desc: '/save-card, /vault/:id (owner-scoped), deck PATCH.' },
    { id: 'r_reviews', label: 'routes/reviews', group: 'backend', desc: '/reviews (SM-2 upsert), /reviews/due, /stats, /sessions.' },
    { id: 'r_logs', label: 'routes/logs', group: 'backend', desc: '/log-search, /admin/logs (verifyToken + requireAdmin).' },
    { id: 'm_auth', label: 'middleware/auth', group: 'backend', desc: 'verifyToken, optionalAuth, requireAdmin.' },
    { id: 'm_rate', label: 'middleware/rateLimit', group: 'backend', desc: 'generalLimiter, aiLimiter, authLimiter.' },
    { id: 'm_validate', label: 'middleware/validate', group: 'backend', desc: 'express-validator result handler.' },
    { id: 'reqctx', label: 'middleware/requestContext', group: 'backend', desc: 'Correlation id via AsyncLocalStorage + consistent error shape.' },
    { id: 'gemini', label: 'gemini.js', group: 'backend', desc: 'Gemini client; structured JSON output + defensive parse.' },
    { id: 'sm2', label: 'sm2.js', group: 'backend', desc: 'SM-2 spaced-repetition algorithm.' },
    { id: 'adaptive', label: 'adaptive.js', group: 'backend', desc: 'Derives a difficulty hint from recent recall quality.' },
    { id: 'logger', label: 'logger.js', group: 'backend', desc: 'Levelled logger, auto-tagged with request id.' },
    { id: 'config', label: 'config.js', group: 'config', desc: 'Loads & validates env; warns on insecure defaults.' },
    { id: 'db', label: 'db.js', group: 'config', desc: 'Shared Neon serverless SQL client.' },
    { id: 'migrate', label: 'migrate.js', group: 'config', desc: 'Idempotent CREATE TABLE IF NOT EXISTS — safe on live data.' },

    // Database
    { id: 't_users', label: 'users', group: 'database', desc: 'Accounts + profile (age, degree, goal…). Password is bcrypt-hashed.' },
    { id: 't_cards', label: 'saved_cards', group: 'database', desc: 'Vault Q&A cards (+ optional deck).' },
    { id: 't_reviews', label: 'card_reviews', group: 'database', desc: 'SM-2 state per (user, card).' },
    { id: 't_sessions', label: 'study_sessions', group: 'database', desc: 'Completed quiz/study sessions.' },
    { id: 't_stats', label: 'user_stats', group: 'database', desc: 'Streaks + totals.' },
    { id: 't_searches', label: 'user_searches', group: 'database', desc: 'Search/activity log (admin view).' },
  ],
  links: [
    ['main', 'App'], ['main', 'tokens'],
    ['App', 'ThemeContext'], ['App', 'AuthContext'], ['App', 'ToastContext'], ['App', 'ConfirmContext'],
    ['App', 'Header'], ['App', 'ThemeSwitcher'], ['App', 'constants'],
    ['App', 'HomePage'], ['App', 'ValueToQuestions'], ['App', 'PhotoToQuestions'], ['App', 'Vault'],
    ['App', 'Analytics'], ['App', 'ReviewDue'], ['App', 'QuizMode'], ['App', 'AdminLogs'], ['App', 'Wiki'],
    ['ThemeSwitcher', 'ThemeContext'], ['Header', 'Icon3D'], ['ThemeContext', 'tokens'],
    ['HomePage', 'api'], ['ValueToQuestions', 'api'], ['PhotoToQuestions', 'api'], ['Vault', 'api'],
    ['Analytics', 'api'], ['ReviewDue', 'api'], ['QuizMode', 'api'], ['AdminLogs', 'api'], ['AdminLogs', 'Wiki'],
    ['ValueToQuestions', 'ResultSection'], ['PhotoToQuestions', 'ResultSection'], ['ResultSection', 'api'],
    ['api', 'constants'], ['api', 'AuthContext'],
    ['index', 'config'], ['index', 'migrate'], ['index', 'app'],
    ['app', 'r_auth'], ['app', 'r_ai'], ['app', 'r_vault'], ['app', 'r_reviews'], ['app', 'r_logs'],
    ['app', 'm_rate'], ['app', 'reqctx'], ['app', 'logger'],
    ['r_auth', 'm_auth'], ['r_auth', 'm_rate'], ['r_auth', 'm_validate'], ['r_auth', 'db'],
    ['r_ai', 'm_auth'], ['r_ai', 'm_rate'], ['r_ai', 'gemini'], ['r_ai', 'adaptive'], ['r_ai', 'db'],
    ['r_vault', 'm_auth'], ['r_vault', 'db'],
    ['r_reviews', 'm_auth'], ['r_reviews', 'sm2'], ['r_reviews', 'db'],
    ['r_logs', 'm_auth'], ['r_logs', 'db'],
    ['adaptive', 'db'], ['migrate', 'db'], ['db', 'config'], ['gemini', 'config'],
    ['logger', 'reqctx'],
    ['db', 't_users'], ['db', 't_cards'], ['db', 't_reviews'], ['db', 't_sessions'], ['db', 't_stats'], ['db', 't_searches'],
    ['t_cards', 't_users'], ['t_reviews', 't_cards'], ['t_sessions', 't_users'], ['t_stats', 't_users'],
  ],
};

// ── Interactive project tree ──────────────────────────────────────────────────
export const FILE_TREE = {
  name: 'quiz-project', type: 'dir', desc: 'Monorepo: a Vite/React frontend and an Express/Neon backend.',
  children: [
    {
      name: 'Frontend', type: 'dir', desc: 'Vite + React 19 + Tailwind 4 single-page app (deployed on Vercel).',
      children: [
        { name: 'index.html', type: 'file', desc: 'HTML shell: meta, theme-color, PWA manifest link.' },
        { name: 'vite.config.js', type: 'file', desc: 'Vite config (React + Tailwind plugins).' },
        { name: 'vercel.json', type: 'file', desc: 'SPA rewrite so client routes resolve on refresh.' },
        {
          name: 'public', type: 'dir', desc: 'Static assets served at the site root.',
          children: [
            { name: 'manifest.webmanifest', type: 'file', desc: 'PWA manifest (installability + theme).' },
            { name: 'sw.js', type: 'file', desc: 'Deploy-safe service worker — offline fallback only, never caches app bundles.' },
            { name: 'offline.html', type: 'file', desc: 'Offline fallback page.' },
            { name: 'icon.svg', type: 'file', desc: 'App / maskable icon.' },
            { name: 'emoji3d/', type: 'dir', desc: '33 bundled 3D emoji PNGs.' },
          ],
        },
        {
          name: 'src', type: 'dir', desc: 'Application source.',
          children: [
            { name: 'main.jsx', type: 'file', desc: 'Entry: render <App>, register service worker.' },
            { name: 'App.jsx', type: 'file', desc: 'Routers, providers, lazy routes, global widgets.' },
            { name: 'context/', type: 'dir', desc: 'ThemeContext, AuthContext, ToastContext, ConfirmContext.' },
            { name: 'lib/', type: 'dir', desc: 'api.js, auth.js, validation.js, constants.js, quotes.js, emoji3d.js, wikiData.js.' },
            { name: 'components/', type: 'dir', desc: 'Header, Footer, ErrorBoundary, ProtectedRoute, ThemeSwitcher, BackToTop, OfflineNotice, ResultSection, ui/*, wiki/*.' },
            { name: 'Pages/', type: 'dir', desc: 'HomePage, Login/SignUp, ProfileSetup, ValueToQuestions, PhotoToQuestions, Vault, Analytics, ReviewDue, QuizMode, AdminLogs, Wiki.' },
            { name: 'styles/tokens.css', type: 'file', desc: 'Design tokens — colours, type, spacing, motion, z-index.' },
            { name: 'index.css', type: 'file', desc: 'Global base, focus ring, reduced-motion, sr-only, skip-link.' },
          ],
        },
      ],
    },
    {
      name: 'Server', type: 'dir', desc: 'Express 5 + Neon Postgres + Gemini API (deployed on Render).',
      children: [
        { name: 'index.js', type: 'file', desc: 'Entry: config → migrate → app.listen.' },
        {
          name: 'src', type: 'dir', desc: 'Modular backend.',
          children: [
            { name: 'app.js', type: 'file', desc: 'Express middleware stack + route mounting + handlers.' },
            { name: 'config.js', type: 'file', desc: 'Env loading + validation.' },
            { name: 'db.js', type: 'file', desc: 'Neon serverless SQL client.' },
            { name: 'logger.js', type: 'file', desc: 'Request-id-aware structured logger.' },
            { name: 'migrate.js', type: 'file', desc: 'Idempotent schema setup.' },
            { name: 'gemini.js', type: 'file', desc: 'Gemini structured-output service.' },
            { name: 'sm2.js', type: 'file', desc: 'SM-2 spaced-repetition.' },
            { name: 'adaptive.js', type: 'file', desc: 'Adaptive difficulty hint.' },
            { name: 'middleware/', type: 'dir', desc: 'auth.js, rateLimit.js, validate.js, requestContext.js.' },
            { name: 'routes/', type: 'dir', desc: 'auth.js, ai.js, vault.js, reviews.js, logs.js.' },
          ],
        },
      ],
    },
  ],
};

// ── API reference ────────────────────────────────────────────────────────────
export const API = [
  { method: 'POST', path: '/signup', auth: 'public', desc: 'Create account (bcrypt-hashed password).' },
  { method: 'POST', path: '/login', auth: 'public', desc: 'Verify credentials → JWT (24h). Rate-limited; timing-equalised.' },
  { method: 'POST', path: '/info', auth: 'token', desc: 'Update profile (validated). Never returns the password.' },
  { method: 'POST', path: '/page', auth: 'token', desc: 'Generate Q&A from page/image text (personalised).' },
  { method: 'POST', path: '/search/:value', auth: 'optional', desc: 'Generate Q&A for a topic (guests allowed).' },
  { method: 'POST', path: '/save-card', auth: 'token', desc: 'Save a card to the vault.' },
  { method: 'GET', path: '/vault/:userId', auth: 'token', desc: 'List the caller’s saved cards (owner-scoped).' },
  { method: 'DELETE', path: '/vault/:cardId', auth: 'token', desc: 'Delete one of the caller’s cards.' },
  { method: 'PATCH', path: '/vault/:cardId', auth: 'token', desc: 'Set/clear a card’s deck label.' },
  { method: 'POST', path: '/reviews', auth: 'token', desc: 'Record a review; schedule next via SM-2.' },
  { method: 'GET', path: '/reviews/due', auth: 'token', desc: 'Cards due now (never-reviewed = due).' },
  { method: 'GET', path: '/stats', auth: 'token', desc: 'Aggregate study stats for analytics.' },
  { method: 'POST', path: '/sessions', auth: 'token', desc: 'Log a completed quiz/study session.' },
  { method: 'POST', path: '/log-search', auth: 'token', desc: 'Record a search event.' },
  { method: 'GET', path: '/admin/logs', auth: 'admin', desc: 'Recent activity (verifyToken + requireAdmin).' },
];

// ── Mermaid diagrams (rendered lazily on the client) ─────────────────────────
export const DIAGRAMS = {
  er: `erDiagram
    users ||--o{ saved_cards : owns
    users ||--o{ card_reviews : schedules
    users ||--o{ study_sessions : logs
    users ||--|| user_stats : has
    saved_cards ||--o{ card_reviews : reviewed_as
    users {
      serial id PK
      text email
      text password
      text age
      text degree
      text goal
    }
    saved_cards {
      serial id PK
      int user_id FK
      text question
      text answer
      text deck
    }
    card_reviews {
      int user_id FK
      int card_id FK
      real ease_factor
      int interval_days
      int repetitions
      timestamptz due_date
    }
    user_stats {
      int user_id PK
      int current_streak
      int longest_streak
    }`,
  request: `flowchart LR
    A[Browser] -->|HTTPS + Bearer| B[helmet + CORS]
    B --> C[express.json 1mb]
    C --> D[requestContext id]
    D --> E[logger]
    E --> F[rate limit]
    F --> G{Route}
    G --> H[verifyToken / requireAdmin]
    H --> I[express-validator]
    I --> J[Handler]
    J --> K[(Neon Postgres)]
    J --> L[Gemini API]
    J -->|error| M[Global handler + requestId]`,
  auth: `sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Server
    participant DB as Postgres
    U->>FE: email + password
    FE->>BE: POST /login
    BE->>DB: SELECT user by email
    DB-->>BE: row (or none)
    BE->>BE: bcrypt.compare (dummy hash if no user)
    BE-->>FE: JWT (24h) + { id, email }
    FE->>FE: store token, attach as Bearer
    FE->>BE: POST /page (Bearer)
    BE->>BE: verifyToken → req.user`,
  ai: `flowchart TD
    A[Topic or image] --> B{Image?}
    B -->|yes| C[tesseract.js OCR - lazy]
    B -->|no| D[Topic text]
    C --> E[Build prompt]
    D --> E
    E --> F[Load profile: age, degree, goal]
    F --> G[adaptive hint from recent recall]
    G --> H[Gemini structured JSON]
    H --> I[parse + repair]
    I --> J[Flashcards]`,
  sm2: `flowchart TD
    A[Confidence 1-4] --> B[quality 1,3,4,5]
    B --> C{quality < 3?}
    C -->|yes| D[reps=0, interval=1 day]
    C -->|no| E[reps++]
    E --> F{which rep?}
    F -->|1| G[interval = 1]
    F -->|2| H[interval = 6]
    F -->|3+| I[interval = round prev x EF]
    D --> J[update ease factor, min 1.3]
    G --> J
    H --> J
    I --> J
    J --> K[(card_reviews due_date)]`,
  providers: `flowchart TD
    EB[ErrorBoundary] --> TP[ThemeProvider]
    TP --> AP[AuthProvider]
    AP --> TO[ToastProvider]
    TO --> CO[ConfirmProvider]
    CO --> RT[RouterProvider - lazy routes]
    CO --> W[ThemeSwitcher / BackToTop / OfflineNotice]`,
  personalization: `flowchart LR
    P[users: age, degree, goal] --> PR[Prompt builder]
    R[card_reviews: last_quality] --> AH[adaptive hint]
    AH --> PR
    PR --> G[Gemini structured JSON]
    G --> Q[Personalised flashcards]`,
};

// ── Code reference: every key module and its exported API ────────────────────
// kind: 'fn' (function) · 'hook' · 'comp' (component) · 'const' (data/value)
// · 'mw' (Express middleware) · 'svc' (service) · 'route'
export const MODULES = [
  // FRONTEND ──────────────────────────────────────────────────────────────────
  {
    file: 'lib/api.js', group: 'frontend', summary: 'The single gateway to the backend.',
    items: [
      { kind: 'fn', name: 'request', sig: 'request(path, { method, body, auth, headers })', desc: 'Core fetch wrapper: guards VITE_API_URL, attaches the Bearer token, clears the session on 401, parses JSON defensively, and throws an Error carrying .status and .requestId.' },
      { kind: 'const', name: 'api', sig: 'api.get / api.post / api.patch / api.del', desc: 'Thin method helpers over request().' },
    ],
  },
  {
    file: 'lib/auth.js', group: 'frontend', summary: 'Crash-safe localStorage session helpers.',
    items: [
      { kind: 'fn', name: 'getToken', sig: 'getToken() → string | null', desc: 'Read the stored JWT.' },
      { kind: 'fn', name: 'getUser', sig: 'getUser() → object | null', desc: 'Read the stored user; corrupt JSON can never throw.' },
      { kind: 'fn', name: 'isAuthenticated', sig: 'isAuthenticated() → boolean', desc: 'True when a token is present.' },
      { kind: 'fn', name: 'setSession', sig: 'setSession(token, user)', desc: 'Persist a fresh login.' },
      { kind: 'fn', name: 'updateUser', sig: 'updateUser(user)', desc: 'Update only the stored user (after profile edits).' },
      { kind: 'fn', name: 'clearSession', sig: 'clearSession()', desc: 'Remove only the auth keys.' },
    ],
  },
  {
    file: 'lib/validation.js', group: 'frontend', summary: 'Shared form validators (return an error string or "").',
    items: [
      { kind: 'fn', name: 'validateEmail', sig: 'validateEmail(value) → string', desc: 'Email presence + format.' },
      { kind: 'fn', name: 'validatePassword', sig: 'validatePassword(value, { min = 6 }) → string', desc: 'Presence + minimum length.' },
      { kind: 'fn', name: 'validatePasswordConfirm', sig: 'validatePasswordConfirm(value, original) → string', desc: 'Confirmation matches.' },
    ],
  },
  {
    file: 'context/ThemeContext.jsx', group: 'frontend', summary: '8 themes · 4 fonts · text size · reduce-motion, persisted.',
    items: [
      { kind: 'const', name: 'THEMES / FONTS / TEXT_SIZES', sig: 'maps of CSS-variable overrides', desc: 'The data behind the appearance picker.' },
      { kind: 'fn', name: 'applyAppearance', sig: 'applyAppearance(pref)', desc: 'Writes the chosen theme/font/size vars onto :root and toggles data-motion.' },
      { kind: 'hook', name: 'useTheme', sig: 'useTheme() → { theme, font, textSize, reduceMotion, setTheme, setFont, setTextSize, toggleReduceMotion, reset }', desc: 'Read & change appearance from any component.' },
    ],
  },
  {
    file: 'context/AuthContext.jsx', group: 'frontend', summary: 'Reactive auth state (re-renders on login/logout).',
    items: [
      { kind: 'hook', name: 'useAuth', sig: 'useAuth() → { token, user, isAuthenticated, login(token, user), updateUser(user), logout() }', desc: 'Single source of truth for who is logged in.' },
    ],
  },
  {
    file: 'context/ToastContext.jsx', group: 'frontend', summary: 'Global toast notifications.',
    items: [
      { kind: 'hook', name: 'useToast', sig: 'useToast() → { show(msg, opts), success, error, info, dismiss(id) }', desc: 'Fire transient notifications (aria-live).' },
    ],
  },
  {
    file: 'context/ConfirmContext.jsx', group: 'frontend', summary: 'Promise-based confirm dialog.',
    items: [
      { kind: 'hook', name: 'useConfirm', sig: 'useConfirm() → confirm({ title, message, confirmText, tone }) → Promise<boolean>', desc: 'Await a yes/no decision without callback soup.' },
    ],
  },
  {
    file: 'components/ui/*', group: 'frontend', summary: 'The reusable kit.',
    items: [
      { kind: 'comp', name: 'Icon3D', sig: '<Icon3D code size pulse alt />', desc: '3D emoji with emoji fallback; decorative icons are aria-hidden.' },
      { kind: 'comp', name: 'Modal', sig: '<Modal open onClose title footer maxWidth />', desc: 'role=dialog, aria-modal, ESC + focus management.' },
      { kind: 'comp', name: 'Button / Input / GlassCard / Badge / Spinner / Skeleton / EmptyState', sig: 'themed primitives', desc: 'Glass-styled building blocks; Input wires label↔id + aria-invalid.' },
    ],
  },
  {
    file: 'components/wiki/*', group: 'frontend', summary: 'This wiki’s visual widgets.',
    items: [
      { kind: 'comp', name: 'WikiGraph', sig: '<WikiGraph nodes links onSelect selectedId />', desc: 'Hand-rolled force-directed SVG graph; draggable, hover-highlights neighbours.' },
      { kind: 'comp', name: 'Mermaid', sig: '<Mermaid chart={string} />', desc: 'Lazy-loads mermaid and renders a diagram; falls back to source on failure.' },
      { kind: 'comp', name: 'FileTree', sig: '<FileTree tree={node} />', desc: 'Collapsible, keyboard-accessible project tree.' },
    ],
  },

  // BACKEND ────────────────────────────────────────────────────────────────────
  {
    file: 'config.js', group: 'config', summary: 'Env loading + validation (warns on insecure defaults).',
    items: [
      { kind: 'const', name: 'config', sig: '{ port, databaseUrl, jwtSecret, geminiApiKey, geminiModel, corsOrigin, adminEmail }', desc: 'The only place process.env is read.' },
    ],
  },
  {
    file: 'db.js', group: 'config', summary: 'Shared Neon serverless SQL client.',
    items: [{ kind: 'const', name: 'sql', sig: 'sql`SELECT …`', desc: 'Tagged-template, parameterised queries (injection-safe).' }],
  },
  {
    file: 'logger.js', group: 'backend', summary: 'Request-id-aware structured logger.',
    items: [
      { kind: 'fn', name: 'info / warn / error', sig: 'logger.error(...args)', desc: 'Levelled console output, auto-prefixed with the active request id (via ALS).' },
      { kind: 'mw', name: 'requestLogger', sig: 'logger.requestLogger(req, res, next)', desc: 'Logs method, path, status, duration; escalates level for 5xx / slow responses.' },
    ],
  },
  {
    file: 'middleware/requestContext.js', group: 'backend', summary: 'Correlation id + consistent error shape.',
    items: [
      { kind: 'mw', name: 'requestContext', sig: 'requestContext(req, res, next)', desc: 'Assigns req.id, sets X-Request-Id, injects requestId into every error body, opens the ALS context.' },
      { kind: 'const', name: 'als', sig: 'AsyncLocalStorage', desc: 'Carries the request id so the logger can tag any line.' },
    ],
  },
  {
    file: 'middleware/auth.js', group: 'backend', summary: 'JWT + admin gating.',
    items: [
      { kind: 'mw', name: 'verifyToken', sig: 'verifyToken(req, res, next)', desc: 'Requires a valid Bearer token → req.user, else 401.' },
      { kind: 'mw', name: 'optionalAuth', sig: 'optionalAuth(req, res, next)', desc: 'Attaches req.user if a token is present; never blocks (guests allowed).' },
      { kind: 'mw', name: 'requireAdmin', sig: 'requireAdmin(req, res, next)', desc: 'Allows only config.adminEmail (after verifyToken); 403 otherwise.' },
    ],
  },
  {
    file: 'middleware/rateLimit.js', group: 'backend', summary: 'Three tuned limiters.',
    items: [
      { kind: 'mw', name: 'generalLimiter', sig: '100 req / 15 min', desc: 'Applied to all routes.' },
      { kind: 'mw', name: 'aiLimiter', sig: '10 req / min', desc: 'Protects the Gemini quota.' },
      { kind: 'mw', name: 'authLimiter', sig: '10 failed / 15 min', desc: 'Slows brute-force; successful logins do not count.' },
    ],
  },
  {
    file: 'middleware/validate.js', group: 'backend', summary: 'express-validator result handler.',
    items: [{ kind: 'mw', name: 'handleValidation', sig: 'handleValidation(req, res, next)', desc: 'Returns 400 with details if any validator failed; else continues.' }],
  },
  {
    file: 'gemini.js', group: 'backend', summary: 'Google Gemini service.',
    items: [
      { kind: 'svc', name: 'getModel', sig: 'getModel()', desc: 'Model handle configured for structured JSON output (responseSchema).' },
      { kind: 'fn', name: 'parseGeminiJSON', sig: 'parseGeminiJSON(text) → array', desc: 'Defensive parse with a backslash-repair retry for LaTeX answers.' },
      { kind: 'svc', name: 'generateQA', sig: 'generateQA(prompt) → Promise<array>', desc: 'Run a prompt and return the parsed Q&A array.' },
    ],
  },
  {
    file: 'sm2.js', group: 'backend', summary: 'SM-2 spaced-repetition algorithm.',
    items: [
      { kind: 'fn', name: 'sm2', sig: 'sm2(state, quality) → { easeFactor, intervalDays, repetitions, dueDate }', desc: 'Compute the next review schedule from current state + recall quality (0–5).' },
      { kind: 'fn', name: 'confidenceToQuality', sig: 'confidenceToQuality(score) → quality', desc: 'Map the app’s 1–4 confidence onto SM-2’s 0–5 quality.' },
    ],
  },
  {
    file: 'adaptive.js', group: 'backend', summary: 'Adaptive difficulty.',
    items: [{ kind: 'fn', name: 'getAdaptiveHint', sig: 'getAdaptiveHint(userId) → Promise<string>', desc: 'Averages the last 20 recall scores → a calibration sentence injected into the prompt ("" until enough history).' }],
  },
  {
    file: 'migrate.js', group: 'config', summary: 'Code-driven schema.',
    items: [{ kind: 'fn', name: 'run', sig: 'migrate.run()', desc: 'CREATE TABLE IF NOT EXISTS for all 6 tables + idempotent ALTERs — safe on every boot, never touches live data.' }],
  },
  {
    file: 'routes/*', group: 'backend', summary: 'Five routers mounted at /.',
    items: [
      { kind: 'route', name: 'auth', sig: '/signup · /login · /info', desc: 'Account + profile; authLimiter, validation, no password leak.' },
      { kind: 'route', name: 'ai', sig: '/page · /search/:value', desc: 'Builds the personalised prompt and calls Gemini.' },
      { kind: 'route', name: 'vault', sig: '/save-card · /vault/:id', desc: 'Owner-scoped saved cards + deck labels.' },
      { kind: 'route', name: 'reviews', sig: '/reviews · /reviews/due · /stats · /sessions', desc: 'SM-2 scheduling + analytics + streaks.' },
      { kind: 'route', name: 'logs', sig: '/log-search · /admin/logs', desc: 'Activity logging + the admin-gated dashboard.' },
    ],
  },
];

// ── Glossary — plain-language definitions ────────────────────────────────────
export const GLOSSARY = [
  { term: 'JWT', def: 'A signed token the server gives you at login. The browser sends it back on every request to prove who you are — the server never trusts the request body for identity.' },
  { term: 'bcrypt', def: 'A deliberately slow hashing algorithm for passwords. We store the hash, never the password; even we can’t read it.' },
  { term: 'SM-2', def: 'The SuperMemo-2 spaced-repetition formula. Based on how well you recalled a card, it decides how many days until you should see it again.' },
  { term: 'Idempotent migration', def: 'Schema setup written so running it many times has the same effect as running it once (CREATE TABLE IF NOT EXISTS) — safe on every server start.' },
  { term: 'Design token', def: 'A named CSS variable (e.g. --accent-indigo). Components use the name, not the value, so one change re-themes everything.' },
  { term: 'Code-splitting', def: 'Shipping each page as its own file that loads only when visited — keeping the first load small.' },
  { term: 'AsyncLocalStorage (ALS)', def: 'A Node feature that carries a value (here, the request id) through an entire async request, so logs can be tagged automatically.' },
  { term: 'Correlation / request id', def: 'A short id per request, shown in logs, the X-Request-Id header, and error responses — so one user-reported error can be traced to its exact server log line.' },
  { term: 'PWA', def: 'Progressive Web App — installable to the home screen, with an offline fallback page.' },
];
