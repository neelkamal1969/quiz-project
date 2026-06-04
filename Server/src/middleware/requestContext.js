// Request context & correlation.
//
// Assigns every incoming request a short correlation id and threads it through
// the whole request lifecycle via AsyncLocalStorage, so the logger can tag every
// line — including deep inside route handlers — without any call site passing it
// explicitly. The same id is:
//   • echoed back as the `X-Request-Id` response header, and
//   • injected into every JSON error body ({ error, requestId }),
// so a user-reported failure can be traced straight to its server logs.
const crypto = require('crypto');
const { AsyncLocalStorage } = require('async_hooks');

// Shared store; logger.js reads from it to prefix log lines.
const als = new AsyncLocalStorage();

function requestContext(req, res, next) {
  const id = crypto.randomBytes(4).toString('hex');
  req.id = id;
  res.setHeader('X-Request-Id', id);

  // Keep a consistent error shape across all routes without touching each one:
  // any response body carrying an `error` field gets the request id added.
  const sendJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === 'object' && body.error !== undefined && body.requestId === undefined) {
      body.requestId = id;
    }
    return sendJson(body);
  };

  // Run the remainder of the request inside the ALS context.
  als.run({ id }, () => next());
}

module.exports = { requestContext, als };
