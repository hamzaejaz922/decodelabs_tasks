/**
 * ============================================================================
 * ui.js — DOM Injection & Presentation Layer (Stage 3 of the I-P-O model)
 * ============================================================================
 * Rule followed throughout: build elements with document.createElement() and
 * write user-supplied text with .textContent, never .innerHTML. This is the
 * "Safe Data Injection" pattern — it prevents XSS even if an intern's name
 * or role ever contained '<script>' style input.
 * ============================================================================
 */

const els = {
  apiStatus: document.getElementById('apiStatus'),
  themeToggle: document.getElementById('themeToggle'),

  statTotal: document.getElementById('statTotal'),
  statActive: document.getElementById('statActive'),
  statLeave: document.getElementById('statLeave'),
  statDepts: document.getElementById('statDepts'),

  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  emptyState: document.getElementById('emptyState'),
  internGrid: document.getElementById('internGrid'),

  toastContainer: document.getElementById('toastContainer'),
};

/* ------------------------------- Theme -------------------------------- */

const Theme = {
  KEY: 'teampulse-theme',
  init() {
    const saved = localStorage.getItem(this.KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(this.KEY, next);
  },
};

/* ---------------------------- Status pill ------------------------------ */

function setApiStatus(state) {
  // state: 'pending' | 'online' | 'offline'
  els.apiStatus.className = `status-pill status-pill--${state}`;
  const label =
    state === 'online' ? 'Backend connected' : state === 'offline' ? 'Backend unreachable' : 'Checking backend…';
  els.apiStatus.replaceChildren();
  const dot = document.createElement('span');
  dot.className = 'status-dot';
  els.apiStatus.append(dot, document.createTextNode(' ' + label));
}

/* ------------------------------- Toasts --------------------------------- */

function showToast(message, type = 'success', timeout = 3800) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const icon = document.createElement('span');
  icon.textContent = type === 'error' ? '⚠' : '✓';

  const text = document.createElement('span');
  text.textContent = message; // safe: textContent, never innerHTML

  toast.append(icon, text);
  els.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .2s ease';
    setTimeout(() => toast.remove(), 200);
  }, timeout);
}

/* --------------------------- View state toggles -------------------------- */

function showView(view) {
  // view: 'loading' | 'error' | 'empty' | 'data'
  els.loadingState.hidden = view !== 'loading';
  els.errorState.hidden = view !== 'error';
  els.emptyState.hidden = view !== 'empty';
  els.internGrid.hidden = view !== 'data';
}

/* ------------------------------- Stats ---------------------------------- */

function renderStats(stats) {
  els.statTotal.textContent = stats.total;
  els.statActive.textContent = stats.active;
  els.statLeave.textContent = stats.onLeave;
  els.statDepts.textContent = Object.keys(stats.byDepartment).length;
}

function resetStats() {
  [els.statTotal, els.statActive, els.statLeave, els.statDepts].forEach((el) => (el.textContent = '—'));
}

/* --------------------------- Intern card builder -------------------------- */

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function buildInternCard(intern, { onEdit, onDelete }) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = intern.id;

  // --- top row: avatar + name/role + status badge ---
  const top = document.createElement('div');
  top.className = 'card__top';

  const left = document.createElement('div');
  left.style.display = 'flex';
  left.style.gap = '12px';
  left.style.alignItems = 'flex-start';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = initials(intern.name); // safe textContent injection

  const nameBlock = document.createElement('div');
  const nameEl = document.createElement('h3');
  nameEl.className = 'card__name';
  nameEl.textContent = intern.name;
  const roleEl = document.createElement('p');
  roleEl.className = 'card__role';
  roleEl.textContent = intern.role;
  nameBlock.append(nameEl, roleEl);

  left.append(avatar, nameBlock);

  const badge = document.createElement('span');
  badge.className = `badge ${intern.status === 'active' ? 'badge--active' : 'badge--leave'}`;
  badge.textContent = intern.status === 'active' ? 'Active' : 'On leave';

  top.append(left, badge);

  // --- meta block ---
  const meta = document.createElement('div');
  meta.className = 'card__meta';
  meta.append(
    metaLine('Department', intern.department),
    metaLine('Email', intern.email),
    metaLine('Joined', intern.joined)
  );

  // --- footer actions ---
  const footer = document.createElement('div');
  footer.className = 'card__footer';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn--ghost';
  editBtn.type = 'button';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => onEdit(intern));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn--danger';
  deleteBtn.type = 'button';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => onDelete(intern));

  footer.append(editBtn, deleteBtn);

  card.append(top, meta, footer);
  return card;
}

function metaLine(label, value) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = label + ': ';
  p.appendChild(strong);
  p.appendChild(document.createTextNode(value));
  return p;
}

/**
 * Renders the full list into #internGrid using a single DocumentFragment
 * (batches DOM writes into one reflow instead of N).
 */
function renderInterns(interns, handlers) {
  els.internGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  interns.forEach((intern) => fragment.appendChild(buildInternCard(intern, handlers)));
  els.internGrid.appendChild(fragment);
}
