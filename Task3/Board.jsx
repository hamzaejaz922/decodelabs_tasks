import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import './Board.css';

const COLUMNS = [
  { key: 'todo', label: 'Queued', var: '--stage-todo' },
  { key: 'in_progress', label: 'Running', var: '--stage-progress' },
  { key: 'done', label: 'Shipped', var: '--stage-done' },
];

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const loadTasks = useCallback(async () => {
    const { data } = await api.get('/tasks');
    setTasks(data);
    return data;
  }, []);

  const loadStats = useCallback(async () => {
    const { data } = await api.get('/tasks/stats');
    setStats(data);
  }, []);

  const loadTags = useCallback(async () => {
    const { data } = await api.get('/tags');
    setTags(data);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTasks(), loadStats(), loadTags()]).finally(() => setLoading(false));
  }, [loadTasks, loadStats, loadTags]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], done: [] };
    filtered.forEach((t) => g[t.status]?.push(t));
    return g;
  }, [filtered]);

  function openNewTask() {
    setActiveTask(null);
    setModalOpen(true);
  }

  function openTask(task) {
    setActiveTask(task);
    setModalOpen(true);
  }

  async function handleSave(form, id) {
    if (id) {
      const { data } = await api.put(`/tasks/${id}`, form);
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    } else {
      const { data } = await api.post('/tasks', form);
      setTasks((prev) => [data, ...prev]);
    }
    setModalOpen(false);
    loadStats();
  }

  async function handleDelete(id) {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setModalOpen(false);
    loadStats();
  }

  async function handleQuickMove(task, newStatus) {
    const { data } = await api.put(`/tasks/${task.id}`, { status: newStatus });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));
    loadStats();
  }

  async function handleCreateTag(name) {
    const { data } = await api.post('/tags', { name });
    setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleToggleTag(task, tag, isActive) {
    if (isActive) {
      await api.delete(`/tags/${tag.id}/tasks/${task.id}`);
    } else {
      await api.post(`/tags/${tag.id}/tasks/${task.id}`);
    }
    const refreshed = await loadTasks();
    setActiveTask(refreshed.find((t) => t.id === task.id) || null);
  }

  function handleDragStart(e, task) {
    e.dataTransfer.setData('text/plain', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e, colKey) {
    e.preventDefault();
    setDragOverCol(null);
    const id = Number(e.dataTransfer.getData('text/plain'));
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== colKey) {
      handleQuickMove(task, colKey);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar stats={stats} />

      <main className="board-main">
        <header className="board-topbar">
          <div>
            <h1>Board</h1>
            <p>Every task, one pipeline.</p>
          </div>
          <div className="board-topbar__actions">
            <input
              className="board-search"
              type="search"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn-new-task" onClick={openNewTask}>+ New task</button>
          </div>
        </header>

        {loading ? (
          <div className="board-loading">Loading your board…</div>
        ) : (
          <div className="board-columns">
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                className={`board-column ${dragOverCol === col.key ? 'board-column--over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="board-column__header">
                  <span className="board-column__dot" style={{ background: `var(${col.var})` }} />
                  <span className="board-column__label">{col.label}</span>
                  <span className="board-column__count">{grouped[col.key].length}</span>
                </div>

                <div className="board-column__body">
                  {grouped[col.key].length === 0 ? (
                    <div className="board-column__empty">
                      {search ? 'No matches here.' : 'Nothing in this stage yet.'}
                    </div>
                  ) : (
                    grouped[col.key].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={openTask}
                        onDragStart={handleDragStart}
                        onQuickMove={handleQuickMove}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal
          task={activeTask}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          allTags={tags}
          onToggleTag={handleToggleTag}
          onCreateTag={handleCreateTag}
        />
      )}
    </div>
  );
}
