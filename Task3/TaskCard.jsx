import './TaskCard.css';

const priorityLabel = { high: 'High', medium: 'Medium', low: 'Low' };

function isOverdue(task) {
  if (!task.due_date || task.status === 'done') return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TaskCard({ task, onClick, onDragStart, onQuickMove }) {
  const overdue = isOverdue(task);

  return (
    <div
      className="task-card"
      style={{ '--priority-color': `var(--priority-${task.priority})` }}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(task); }}
    >
      <div className="task-card__top">
        <span className="task-card__id">#{String(task.id).padStart(3, '0')}</span>
        <span className={`task-card__priority task-card__priority--${task.priority}`}>
          {priorityLabel[task.priority]}
        </span>
      </div>

      <h4 className="task-card__title">{task.title}</h4>

      {task.description && <p className="task-card__desc">{task.description}</p>}

      {task.tags?.length > 0 && (
        <div className="task-card__tags">
          {task.tags.map((tag) => (
            <span key={tag.id} className="task-card__tag" style={{ '--tag-color': tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="task-card__footer">
        {task.due_date ? (
          <span className={`task-card__due ${overdue ? 'task-card__due--overdue' : ''}`}>
            {overdue ? 'Overdue · ' : 'Due '}
            {formatDate(task.due_date)}
          </span>
        ) : <span />}

        <div className="task-card__move">
          {task.status !== 'todo' && (
            <button
              className="task-card__move-btn"
              onClick={(e) => { e.stopPropagation(); onQuickMove(task, task.status === 'done' ? 'in_progress' : 'todo'); }}
              aria-label="Move back a stage"
              title="Move back"
            >
              ←
            </button>
          )}
          {task.status !== 'done' && (
            <button
              className="task-card__move-btn"
              onClick={(e) => { e.stopPropagation(); onQuickMove(task, task.status === 'todo' ? 'in_progress' : 'done'); }}
              aria-label="Move forward a stage"
              title="Move forward"
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
