import mongoose from 'mongoose';

/**
 * Validates that a route param is a valid MongoDB ObjectId (24 hex characters)
 * @param {string} paramName 
 */
export function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!value || !/^[a-f\d]{24}$/i.test(value)) {
      return res.status(400).json({
        error: `Invalid ${paramName} parameter. Must be a valid 24-character hexadecimal identifier.`,
        code: 'INVALID_OBJECT_ID'
      });
    }
    next();
  };
}

/**
 * Validates order reference identifiers (either MT-XXXXXXXX or 24 hex chars)
 */
export function validateOrderId(req, res, next) {
  const value = req.params.id;
  const isCustomId = /^MT-[A-Z0-9]{6,12}$/i.test(value);
  const isObjectId = /^[a-f\d]{24}$/i.test(value);

  if (!value || (!isCustomId && !isObjectId)) {
    return res.status(400).json({
      error: 'Invalid order reference identifier.',
      code: 'INVALID_ORDER_ID'
    });
  }
  next();
}

/**
 * Sanitizes incoming body string fields by trimming whitespace
 */
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const [key, val] of Object.entries(req.body)) {
      if (typeof val === 'string') {
        req.body[key] = val.trim();
      }
    }
  }
  next();
}
