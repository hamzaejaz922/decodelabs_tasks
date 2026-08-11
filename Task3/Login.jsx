import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <BrandPanel />
      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-card__sub">Sign in to pick up where you left off.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-switch">
            New to TaskFlow? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandPanel() {
  return (
    <div className="auth-brand">
      <div className="auth-brand__logo">
        <div className="auth-brand__dots">
          <span /><span /><span />
        </div>
        TaskFlow
      </div>
      <h1>Every task moves through a pipeline.</h1>
      <p>
        Track work the way a build moves through CI — queued, running, shipped.
        Clear stages, no clutter, nothing stuck in limbo.
      </p>
      <div className="auth-brand__pipeline">
        <span className="auth-brand__stage">
          <span className="auth-brand__stage-dot" style={{ background: 'var(--stage-todo)' }} />
          queued
        </span>
        <span className="auth-brand__connector" />
        <span className="auth-brand__stage">
          <span className="auth-brand__stage-dot" style={{ background: 'var(--stage-progress)' }} />
          running
        </span>
        <span className="auth-brand__connector" />
        <span className="auth-brand__stage">
          <span className="auth-brand__stage-dot" style={{ background: 'var(--stage-done)' }} />
          shipped
        </span>
      </div>
    </div>
  );
}
