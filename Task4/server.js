/**
 * ============================================================================
 *  TeamPulse — Project 4: Frontend & Backend Integration
 *  BACKEND SERVER  ("The Cognitive Vault" — Stage 2 of the I-P-O Architecture)
 * ============================================================================
 *
 *  Responsibilities of this file (Backend Routing, per the I-P-O model):
 *    1. Receive HTTP requests from the frontend (Stage 1 -> Stage 2)
 *    2. Validate input, apply business rules
 *    3. Read / write the "database" (a JSON file acting as persistent storage)
 *    4. Package the result into a JSON response (Stage 2 -> Stage 3)
 *
 *  RESTful design notes:
 *    - Nouns over verbs in routes  -> /api/interns   (NOT /getInterns)
 *    - Statelessness                -> every request is self-contained
 *    - Correct HTTP verbs + codes   -> see HTTP_STATUS reference below
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'interns.json');

// ---------------------------------------------------------------------------
// 1. GLOBAL MIDDLEWARE
// ---------------------------------------------------------------------------

// Parse incoming JSON bodies (equivalent of JSON.parse on the server side)
app.use(express.json());

// CORS — "The Bridge" that lets the frontend (different origin/port) talk to
// this backend. Without this, the browser's Same-Origin Policy blocks the
// response before your frontend JS ever sees it.
app.use(
  cors({
    origin: '*', // In production, replace '*' with your deployed frontend URL
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Tiny request logger — helps you SEE the IPO cycle happening in real time
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ---------------------------------------------------------------------------
// 2. "DATABASE" HELPERS  (JSON file used as lightweight persistent storage)
// ---------------------------------------------------------------------------

function readInterns() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeInterns(interns) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(interns, null, 2), 'utf-8');
}

function notFound(res, id) {
  return res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `No intern found with id "${id}".`,
  });
}

function badRequest(res, message) {
  return res.status(400).json({
    success: false,
    error: 'BAD_REQUEST',
    message,
  });
}

// ---------------------------------------------------------------------------
// 3. ROUTES  — /api/interns  (RESTful resource)
// ---------------------------------------------------------------------------

/**
 * GET /api/health
 * Simple liveness check the frontend can ping to confirm the backend is up.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'TeamPulse API is online.' });
});

/**
 * GET /api/interns
 * Retrieve the full list of interns. Supports optional query filters:
 *   ?department=Engineering
 *   ?status=active
 *   ?search=ayesha
 * Idempotent, safe to retry (per REST diagnostic matrix).
 */
app.get('/api/interns', (req, res) => {
  let interns = readInterns();
  const { department, status, search } = req.query;

  if (department) {
    interns = interns.filter(
      (i) => i.department.toLowerCase() === department.toLowerCase()
    );
  }
  if (status) {
    interns = interns.filter((i) => i.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    interns = interns.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.role.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q)
    );
  }

  res.status(200).json({ success: true, count: interns.length, data: interns });
});

/**
 * GET /api/interns/stats
 * Aggregated dashboard numbers. Placed above /:id so Express doesn't treat
 * "stats" as an :id param.
 */
app.get('/api/interns/stats', (req, res) => {
  const interns = readInterns();
  const byDepartment = interns.reduce((acc, i) => {
    acc[i.department] = (acc[i.department] || 0) + 1;
    return acc;
  }, {});
  const active = interns.filter((i) => i.status === 'active').length;

  res.status(200).json({
    success: true,
    data: {
      total: interns.length,
      active,
      onLeave: interns.length - active,
      byDepartment,
    },
  });
});

/**
 * GET /api/interns/:id
 * Retrieve a single intern by id.
 */
app.get('/api/interns/:id', (req, res) => {
  const interns = readInterns();
  const intern = interns.find((i) => i.id === req.params.id);
  if (!intern) return notFound(res, req.params.id);
  res.status(200).json({ success: true, data: intern });
});

/**
 * POST /api/interns
 * Create a new intern. NOT idempotent (calling twice creates two records).
 * Returns 201 Created + the new resource.
 */
app.post('/api/interns', (req, res) => {
  const { name, role, department, email, status } = req.body;

  if (!name || !role || !department || !email) {
    return badRequest(res, 'Fields "name", "role", "department" and "email" are required.');
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return badRequest(res, 'Field "email" must be a valid email address.');
  }

  const interns = readInterns();
  const newIntern = {
    id: crypto.randomBytes(4).toString('hex'),
    name,
    role,
    department,
    email,
    status: status || 'active',
    joined: new Date().toISOString().slice(0, 10),
  };

  interns.push(newIntern);
  writeInterns(interns);

  res.status(201).json({ success: true, data: newIntern });
});

/**
 * PUT /api/interns/:id
 * Replace an entire intern record. Idempotent — calling it twice with the
 * same payload leaves the system in the same state.
 */
app.put('/api/interns/:id', (req, res) => {
  const interns = readInterns();
  const index = interns.findIndex((i) => i.id === req.params.id);
  if (index === -1) return notFound(res, req.params.id);

  const { name, role, department, email, status } = req.body;
  if (!name || !role || !department || !email) {
    return badRequest(res, 'A full replacement requires "name", "role", "department" and "email".');
  }

  interns[index] = {
    ...interns[index],
    name,
    role,
    department,
    email,
    status: status || interns[index].status,
  };
  writeInterns(interns);

  res.status(200).json({ success: true, data: interns[index] });
});

/**
 * PATCH /api/interns/:id
 * Partially update an intern (e.g. just the status). NOT idempotent in the
 * strict spec sense, since partial semantics can vary — treated here as a
 * targeted field merge.
 */
app.patch('/api/interns/:id', (req, res) => {
  const interns = readInterns();
  const index = interns.findIndex((i) => i.id === req.params.id);
  if (index === -1) return notFound(res, req.params.id);

  const allowedFields = ['name', 'role', 'department', 'email', 'status'];
  const updates = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) {
    return badRequest(res, 'Provide at least one field to update.');
  }

  interns[index] = { ...interns[index], ...updates };
  writeInterns(interns);

  res.status(200).json({ success: true, data: interns[index] });
});

/**
 * DELETE /api/interns/:id
 * Remove an intern record. Idempotent — deleting an already-deleted id
 * consistently results in "it does not exist" (404).
 */
app.delete('/api/interns/:id', (req, res) => {
  const interns = readInterns();
  const index = interns.findIndex((i) => i.id === req.params.id);
  if (index === -1) return notFound(res, req.params.id);

  const [removed] = interns.splice(index, 1);
  writeInterns(interns);

  res.status(200).json({ success: true, data: removed, message: 'Intern removed.' });
});

// ---------------------------------------------------------------------------
// 4. FALLBACKS & CENTRALIZED ERROR HANDLING
// ---------------------------------------------------------------------------

// 404 for any unmatched route
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'ROUTE_NOT_FOUND', message: 'Unknown endpoint.' });
});

// Centralized error handler — the server-side analog of the frontend's
// try/catch shield. Never let a raw stack trace leak to the client.
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong on our end. Please try again shortly.',
  });
});

app.listen(PORT, () => {
  console.log(`\nTeamPulse backend (Cognitive Layer) running on http://localhost:${PORT}`);
  console.log(`Try it:  GET http://localhost:${PORT}/api/interns\n`);
});
