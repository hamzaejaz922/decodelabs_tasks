/**
 * middleware/validateUser.js
 * -------------------------------------------------------
 * Slide reference: "The Gatekeeper Rule - Never Trust the Client"
 *
 * Before any data from a request touches our "database", we run
 * it through two layers of checking, exactly like the slide
 * describes:
 *
 *   1. SYNTACTIC VALIDATION -> Is the format correct?
 *      (right fields, right types, not empty)
 *
 *   2. SEMANTIC VALIDATION  -> Is the logic valid?
 *      (e.g. email actually looks like an email, role is one
 *      of the allowed values)
 *
 * If validation fails, we immediately respond with a 400 Bad
 * Request and STOP the request from going any further — the
 * controller function never even runs.
 * -------------------------------------------------------
 */

const ALLOWED_ROLES = ["admin", "user"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUser(req, res, next) {
  const { name, email, role } = req.body;
  const errors = [];

  // ---- Syntactic validation: are the required fields present? ----
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("`name` is required and must be a non-empty string.");
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("`email` is required and must be a non-empty string.");
  }

  // ---- Semantic validation: does the data actually make sense? ----
  if (email && !EMAIL_REGEX.test(email)) {
    errors.push("`email` must be a valid email address (e.g. name@example.com).");
  }

  if (role && !ALLOWED_ROLES.includes(role)) {
    errors.push(`\`role\` must be one of: ${ALLOWED_ROLES.join(", ")}.`);
  }

  // ---- Gate: if anything failed, reject with 400 and explain why ----
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  // Data passed the barrier — let it through to the controller
  next();
}

module.exports = validateUser;
