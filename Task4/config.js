/**
 * config.js — single source of truth for environment settings.
 * Change API_BASE_URL if you deploy the backend somewhere other than
 * localhost (e.g. Render, Railway, a VPS).
 */
const CONFIG = Object.freeze({
  API_BASE_URL: 'http://localhost:5000/api',
  REQUEST_TIMEOUT_MS: 8000,
});
