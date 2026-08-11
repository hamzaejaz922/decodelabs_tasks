/**
 * ============================================================================
 * app.js — Application Controller
 * Wires user Events -> API calls -> State -> UI re-render (the unidirectional
 * data flow diagrammed in the Project 4 training deck: Event -> New State ->
 * UI -> Event...).
 * ============================================================================
 */

const state = {
  interns: [],
  filters: { search: '', department: '', status: '' },
  editingId: null,
  pendingDeleteId: null,
};

const dom = {
  searchInput: document.getElementById('searchInput'),
  departmentFilter: document.getElementById('departmentFilter'),
  statusFilter: document.getElementById('statusFilter'),
  refreshBtn: document.getElementById('refreshBtn'),
  addInternBtn: document.getElementById('addInternBtn'),
  retryBtn: document.getElementById('retryBtn'),

  internModal: document.getElementById('internModal'),
  modalTitle: document.getElementById('modalTitle'),
  internForm: document.getElementById('internForm'),
  internId: document.getElementById('internId'),
  fieldName: document.getElementById('fieldName'),
  fieldRole: document.getElementById('fieldRole'),
  fieldDepartment: document.getElementById('fieldDepartment'),
  fieldEmail: document.getElementById('fieldEmail'),
  fieldStatus: document.getElementById('fieldStatus'),
  deptSuggestions: document.getElementById('deptSuggestions'),
  formError: document.getElementById('formError'),
  submitBtn: document.getElementById('submitBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),

  confirmModal: document.getElementById('confirmModal'),
  confirmText: document.getElementById('confirmText'),
  confirmCancelBtn: document.getElementById('confirmCancelBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
};

/* ------------------------------ Utilities -------------------------------- */

function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function openModal(modalEl) {
  modalEl.hidden = false;
}
function closeModal(modalEl) {
  modalEl.hidden = true;
}

/* -------------------------- Initial parallel load ------------------------- */
/**
 * Demonstrates Promise.all(): the health check, the stats and the intern
 * list are three independent requests, so we fire them together instead of
 * awaiting them one-by-one (the "await inside a loop" anti-pattern from the
 * training deck, applied here to independent top-level calls instead).
 */
async function bootstrap() {
  Theme.init();
  showView('loading');
  setApiStatus('pending');

  try {
    const [health, stats, interns] = await Promise.all([
      InternsAPI.health(),
      InternsAPI.stats(),
      InternsAPI.list(),
    ]);

    setApiStatus(health.success ? 'online' : 'offline');
    renderStats(stats.data);
    state.interns = interns.data;
    populateDepartmentOptions(interns.data);
    applyFiltersAndRender();
  } catch (err) {
    handleLoadError(err);
  }
}

function handleLoadError(err) {
  console.error(err);
  setApiStatus('offline');
  resetStats();
  els.errorMessage.textContent =
    err instanceof ApiError ? err.message : 'An unexpected error occurred while loading data.';
  showView('error');
}

/* ------------------------------ Fetch + render ---------------------------- */

async function loadInterns() {
  showView('loading');
  try {
    const [stats, interns] = await Promise.all([InternsAPI.stats(), InternsAPI.list()]);
    setApiStatus('online');
    renderStats(stats.data);
    state.interns = interns.data;
    populateDepartmentOptions(interns.data);
    applyFiltersAndRender();
  } catch (err) {
    handleLoadError(err);
  }
}

function populateDepartmentOptions(interns) {
  const departments = [...new Set(interns.map((i) => i.department))].sort();

  const currentValue = dom.departmentFilter.value;
  dom.departmentFilter.replaceChildren();
  const allOpt = document.createElement('option');
  allOpt.value = '';
  allOpt.textContent = 'All departments';
  dom.departmentFilter.appendChild(allOpt);
  departments.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    dom.departmentFilter.appendChild(opt);
  });
  dom.departmentFilter.value = departments.includes(currentValue) ? currentValue : '';

  dom.deptSuggestions.replaceChildren();
  departments.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d;
    dom.deptSuggestions.appendChild(opt);
  });
}

function applyFiltersAndRender() {
  const { search, department, status } = state.filters;
  const filtered = state.interns.filter((i) => {
    const matchesSearch =
      !search ||
      i.name.toLowerCase().includes(search) ||
      i.role.toLowerCase().includes(search) ||
      i.email.toLowerCase().includes(search);
    const matchesDept = !department || i.department === department;
    const matchesStatus = !status || i.status === status;
    return matchesSearch && matchesDept && matchesStatus;
  });

  if (filtered.length === 0) {
    showView('empty');
    return;
  }

  renderInterns(filtered, { onEdit: openEditModal, onDelete: openDeleteConfirm });
  showView('data');
}

/* -------------------------------- Filters --------------------------------- */

dom.searchInput.addEventListener(
  'input',
  debounce((e) => {
    state.filters.search = e.target.value.trim().toLowerCase();
    applyFiltersAndRender();
  }, 300)
);

dom.departmentFilter.addEventListener('change', (e) => {
  state.filters.department = e.target.value;
  applyFiltersAndRender();
});

dom.statusFilter.addEventListener('change', (e) => {
  state.filters.status = e.target.value;
  applyFiltersAndRender();
});

dom.refreshBtn.addEventListener('click', loadInterns);
dom.retryBtn.addEventListener('click', loadInterns);

/* --------------------------------- Modal ----------------------------------- */

dom.addInternBtn.addEventListener('click', openCreateModal);
dom.closeModalBtn.addEventListener('click', () => closeModal(dom.internModal));
dom.cancelModalBtn.addEventListener('click', () => closeModal(dom.internModal));
dom.internModal.addEventListener('click', (e) => {
  if (e.target === dom.internModal) closeModal(dom.internModal);
});

function openCreateModal() {
  state.editingId = null;
  dom.modalTitle.textContent = 'Add Intern';
  dom.internForm.reset();
  dom.fieldStatus.value = 'active';
  dom.formError.hidden = true;
  openModal(dom.internModal);
  dom.fieldName.focus();
}

function openEditModal(intern) {
  state.editingId = intern.id;
  dom.modalTitle.textContent = 'Edit Intern';
  dom.fieldName.value = intern.name;
  dom.fieldRole.value = intern.role;
  dom.fieldDepartment.value = intern.department;
  dom.fieldEmail.value = intern.email;
  dom.fieldStatus.value = intern.status;
  dom.formError.hidden = true;
  openModal(dom.internModal);
  dom.fieldName.focus();
}

dom.internForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  dom.formError.hidden = true;

  const payload = {
    name: dom.fieldName.value.trim(),
    role: dom.fieldRole.value.trim(),
    department: dom.fieldDepartment.value.trim(),
    email: dom.fieldEmail.value.trim(),
    status: dom.fieldStatus.value,
  };

  if (!payload.name || !payload.role || !payload.department || !payload.email) {
    dom.formError.textContent = 'Please fill in every field before saving.';
    dom.formError.hidden = false;
    return;
  }

  dom.submitBtn.disabled = true;
  dom.submitBtn.textContent = state.editingId ? 'Saving…' : 'Adding…';

  try {
    if (state.editingId) {
      await InternsAPI.update(state.editingId, payload);
      showToast(`${payload.name} was updated.`, 'success');
    } else {
      await InternsAPI.create(payload);
      showToast(`${payload.name} was added to the team.`, 'success');
    }
    closeModal(dom.internModal);
    await loadInterns();
  } catch (err) {
    dom.formError.textContent = err instanceof ApiError ? err.message : 'Could not save this intern.';
    dom.formError.hidden = false;
  } finally {
    dom.submitBtn.disabled = false;
    dom.submitBtn.textContent = 'Save Intern';
  }
});

/* ------------------------------ Delete confirm ------------------------------ */

function openDeleteConfirm(intern) {
  state.pendingDeleteId = intern.id;
  dom.confirmText.textContent = `"${intern.name}" will be permanently removed from the roster.`;
  openModal(dom.confirmModal);
}

dom.confirmCancelBtn.addEventListener('click', () => closeModal(dom.confirmModal));
dom.confirmModal.addEventListener('click', (e) => {
  if (e.target === dom.confirmModal) closeModal(dom.confirmModal);
});

dom.confirmDeleteBtn.addEventListener('click', async () => {
  if (!state.pendingDeleteId) return;
  dom.confirmDeleteBtn.disabled = true;
  dom.confirmDeleteBtn.textContent = 'Deleting…';

  try {
    await InternsAPI.remove(state.pendingDeleteId);
    showToast('Intern removed.', 'success');
    closeModal(dom.confirmModal);
    await loadInterns();
  } catch (err) {
    showToast(err instanceof ApiError ? err.message : 'Could not delete this intern.', 'error');
  } finally {
    dom.confirmDeleteBtn.disabled = false;
    dom.confirmDeleteBtn.textContent = 'Delete';
    state.pendingDeleteId = null;
  }
});

/* -------------------------------- Theme toggle ------------------------------ */

els.themeToggle.addEventListener('click', () => Theme.toggle());

/* ---------------------------------- Boot ------------------------------------ */

document.addEventListener('DOMContentLoaded', bootstrap);
