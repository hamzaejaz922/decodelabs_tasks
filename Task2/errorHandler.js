/**
 * middleware/errorHandler.js
 * -------------------------------------------------------
 * Slide reference: "5xx = Server Error" and "Autonomic Defense:
 * Security & Resilience"
 *
 * This is our safety net. If anything throws an unexpected
 * error anywhere in the app, Express skips straight to this
 * function instead of crashing the whole server.
 *
 * This is what keeps one bad request from taking down the
 * entire API for every other user (resilience).
 * -------------------------------------------------------
 */

function errorHandler(err, req, res, next) {
  console.error("Unexpected error:", err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error. Something went wrong on our end.",
  });
}

/**
 * 404 handler for routes that don't exist at all
 * e.g. GET /api/banana
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

module.exports = { errorHandler, notFoundHandler };
