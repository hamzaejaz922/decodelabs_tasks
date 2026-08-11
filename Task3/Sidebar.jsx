import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ stats }) {
  const { user, logout } = useAuth();

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__dots">
          <span /><span /><span />
        </div>
        TaskFlow
      </div>

      <div className="sidebar__section">
        <div className="sidebar__label">Pipeline</div>
        <ul className="sidebar__stages">
          <li>
            <span className="dot" style={{ background: 'var(--stage-todo)' }} />
            Queued
            <span className="count">{stats?.todo ?? '—'}</span>
          </li>
          <li>
            <span className="dot" style={{ background: 'var(--stage-progress)' }} />
            Running
            <span className="count">{stats?.in_progress ?? '—'}</span>
          </li>
          <li>
            <span className="dot" style={{ background: 'var(--stage-done)' }} />
            Shipped
            <span className="count">{stats?.done ?? '—'}</span>
          </li>
        </ul>
      </div>

      {stats?.overdue > 0 && (
        <div className="sidebar__overdue">
          <strong>{stats.overdue}</strong> task{stats.overdue === 1 ? '' : 's'} overdue
        </div>
      )}

      <div className="sidebar__spacer" />

      <div className="sidebar__user">
        <div className="sidebar__avatar">{initials}</div>
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">{user?.name}</div>
          <div className="sidebar__user-email">{user?.email}</div>
        </div>
      </div>
      <button className="sidebar__logout" onClick={logout}>
        Sign out
      </button>
    </aside>
  );
}
