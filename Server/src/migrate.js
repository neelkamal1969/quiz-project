// Code-driven schema setup.
// Every statement uses CREATE TABLE IF NOT EXISTS, which NEVER alters or drops an
// existing table — so running this on every startup is safe for live data and only
// creates anything on a fresh database. New feature tables get added here.
const sql = require('./db');
const logger = require('./logger');

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id             SERIAL PRIMARY KEY,
      email          TEXT UNIQUE NOT NULL,
      password       TEXT NOT NULL,
      age            TEXT,
      gender         TEXT,
      degree         TEXT,
      difficulty     TEXT,
      question_level TEXT,
      goal           TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS saved_cards (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id),
      question   TEXT NOT NULL,
      answer     TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_searches (
      id          SERIAL PRIMARY KEY,
      email       TEXT NOT NULL,
      topic       TEXT NOT NULL,
      search_time TIMESTAMPTZ DEFAULT now()
    )
  `;

  // ── Phase 3: spaced-repetition + analytics tables ──
  await sql`
    CREATE TABLE IF NOT EXISTS card_reviews (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      card_id       INTEGER NOT NULL REFERENCES saved_cards(id) ON DELETE CASCADE,
      ease_factor   REAL NOT NULL DEFAULT 2.5,
      interval_days INTEGER NOT NULL DEFAULT 0,
      repetitions   INTEGER NOT NULL DEFAULT 0,
      due_date      TIMESTAMPTZ,
      last_reviewed TIMESTAMPTZ,
      last_quality  INTEGER,
      UNIQUE (user_id, card_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id),
      kind       TEXT,
      topic      TEXT,
      total      INTEGER DEFAULT 0,
      score      INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id        INTEGER PRIMARY KEY REFERENCES users(id),
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_studied   DATE,
      total_reviews  INTEGER DEFAULT 0
    )
  `;

  // Vault organisation: an optional deck/tag label per saved card.
  // ADD COLUMN IF NOT EXISTS is idempotent and never touches existing data.
  await sql`ALTER TABLE saved_cards ADD COLUMN IF NOT EXISTS deck TEXT`;

  logger.info('Database schema verified (migrations applied).');
}

module.exports = { run };
