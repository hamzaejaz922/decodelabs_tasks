/**
 * server.js
 * -------------------------------------------------------
 * Entry point of the application — the "brain stem" that
 * connects everything (slide: "API Gateway / Brain Stem").
 *
 * Flow of every request:
 *   1. Express receives the raw HTTP request
 *   2. express.json() parses the JSON body ("The Neurotransmitter: JSON")
 *   3. Request is routed to /api/users -> userRoutes.js
 *   4. validateUser middleware checks the data (if POST/PUT)
 *   5. Controller function runs the actual logic
 *   6. Response is sent back with correct status code + JSON
 *   7. If anything throws, errorHandler catches it (500)
 *   8. If no route matches, notFoundHandler responds (404)
 * -------------------------------------------------------
 */

const express = require("express");
const userRoutes = require("./routes/userRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Parses incoming JSON request bodies into req.body
app.use(express.json());

// Serves the optional demo frontend (public/index.html) as static files
app.use(express.static("public"));

// Simple request logger — helpful while developing/demoing
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Health check route — quick way to confirm the API is alive
// (Note: "/" now serves the demo frontend from public/index.html instead)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DecodeLabs User API is running.",
    docs: "See README.md for full endpoint documentation.",
  });
});

// Mount all /api/users routes
app.use("/api/users", userRoutes);

// 404 handler — must come after all real routes
app.use(notFoundHandler);

// Central error handler — must be the LAST app.use()
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
