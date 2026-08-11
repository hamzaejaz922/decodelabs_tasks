/**
 * ============================================================================
 * api.js — The Bridge (Stage 1 -> Stage 2 -> Stage 3 of the I-P-O model)
 * ============================================================================
 * Every network call in this app funnels through `request()`. Centralizing
 * it here means:
 *   - one place enforces "always check response.ok before parsing JSON"
 *   - one place turns network failures into a consistent, typed error
 *   - the rest of the app (ui.js / app.js) never touches fetch() directly
 * ============================================================================
 */

/** Custom error so callers can distinguish network failure vs. API error vs. timeout. */
class ApiError extends Error {
  constructor(message, { status = null, kind = 'API_ERROR' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind; // 'NETWORK' | 'TIMEOUT' | 'API_ERROR' | 'PARSE_ERROR'
  }
}

/**
 * Wraps fetch() with a timeout using AbortController, since a hung request
 * should never freeze the UI forever.
 */
function fetchWithTimeout(url, options = {}, timeoutMs = CONFIG.REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Core request helper.
 * @param {string} path - e.g. '/interns' (appended to CONFIG.API_BASE_URL)
 * @param {object} options - standard fetch options (method, body, headers…)
 */
async function request(path, options = {}) {
  const url = `${CONFIG.API_BASE_URL}${path}`;

  let response;
  try {
    response = await fetchWithTimeout(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch (err) {
    // fetch() only throws for network-level failures (offline, DNS, CORS block, abort)
    if (err.name === 'AbortError') {
      throw new ApiError('The request took too long and was cancelled.', { kind: 'TIMEOUT' });
    }
    throw new ApiError('Could not reach the TeamPulse API. Is the backend running?', { kind: 'NETWORK' });
  }

  // Some endpoints (e.g. a future DELETE with 204) may return an empty body.
  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new ApiError('The server returned a response that was not valid JSON.', {
        status: response.status,
        kind: 'PARSE_ERROR',
      });
    }
  }

  // ---- THE GOLDEN RULE: check response.ok before trusting the payload ----
  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}.`;
    throw new ApiError(message, { status: response.status, kind: 'API_ERROR' });
  }

  return payload;
}

const InternsAPI = {
  health: () => request('/health'),
  stats: () => request('/interns/stats'),

  list: (query = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(query).filter(([, v]) => v))
    ).toString();
    return request(`/interns${params ? `?${params}` : ''}`);
  },

  get: (id) => request(`/interns/${encodeURIComponent(id)}`),

  create: (data) =>
    request('/interns', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/interns/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),

  patch: (id, data) =>
    request(`/interns/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),

  remove: (id) =>
    request(`/interns/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
