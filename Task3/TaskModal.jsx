import { useState, useEffect } from 'react';
import './TaskModal.css';

const empty = { title: '', description: '', status: 'todo', priority: 'medium', due_date: '' };

export default function TaskModal({ task, onClose, onSave, onDelete, allTags, onToggleTag, onCreateTag }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const isEdit = Boolean(task);
  const taskTagIds = new Set((task?.tags || []).map((t) => t.id));

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
      });
    } else {
      setForm(empty);
    }
  }, [task]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Give the task a title.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave({ ...form, due_date: form.due_date || null }, task?.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the task.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{isEdit ? `Edit #${String(task.id).padStart(3, '0')}` : 'New task'}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && <div className="modal__error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="What needs to get done?"
              autoFocus
              required
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Add any useful context (optional)"
              rows={3}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="status">Stage</label>
              <select id="status" value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="todo">Queued</option>
                <option value="in_progress">Running</option>
                <option value="done">Shipped</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select id="priority" value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="due_date">Due date</label>
            <input
              id="due_date"
              type="date"
              value={form.due_date || ''}
              onChange={(e) => update('due_date', e.target.value)}
            />
          </div>

          {isEdit && (
            <div className="field">
              <label>Tags</label>
              <div className="tag-picker">
                {allTags?.map((tag) => {
                  const active = taskTagIds.has(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      className={`tag-chip ${active ? 'tag-chip--active' : ''}`}
                      style={{ '--tag-color': tag.color }}
                      onClick={() => onToggleTag(task, tag, active)}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
              <div className="tag-create">
                <input
                  type="text"
                  placeholder="New tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTagName.trim()) {
                      e.preventDefault();
                      onCreateTag(newTagName.trim());
                      setNewTagName('');
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    if (newTagName.trim()) {
                      onCreateTag(newTagName.trim());
                      setNewTagName('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="modal__actions">
            {isEdit && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </button>
            )}
            <div className="modal__actions-right">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary-sm" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
