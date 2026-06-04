// Shared express-validator result handler.
// Replaces the identical `validationResult(req)` block that was repeated in every
// route handler. Place it after the validation chain on any route.
const { validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

module.exports = { handleValidation };
