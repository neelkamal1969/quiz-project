// Single shared Neon serverless SQL client.
// neon() is lazy — it only opens a connection when a query actually runs, so
// requiring this module has no side effects.
const { neon } = require('@neondatabase/serverless');
const config = require('./config');

const sql = neon(config.databaseUrl);

module.exports = sql;
