import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import './LoginPage.css';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) { await register(form.username, form.email, form.password); }
      else { await login(form.email, form.password); }
      navigate('/');
    } catch (err) { setError(err.message); }
  };

  const fillDemo = () => { setForm({ username: '', email: 'admin@kmc.gov.in', password: 'admin123' }); };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-shape shape-1"></div>
        <div className="login-bg-shape shape-2"></div>
        <div className="login-bg-shape shape-3"></div>
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🏛️</div>
            <h1 className="login-title">KMC SwachthTrack</h1>
            <p className="login-subtitle">Kurnool Municipal Corporation<br/>Smart Cleaning Vehicle Monitoring System</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="input-group">
                <label className="input-label">Username</label>
                <input type="text" className="input" placeholder="Enter username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" className="input" placeholder="admin@kmc.gov.in" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
            <div className="login-footer">
              <button type="button" className="login-switch" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
              {!isRegister && (<button type="button" className="demo-btn" onClick={fillDemo}>Use demo credentials</button>)}
            </div>
          </form>
          <div className="login-features">
            <div className="feature-item"><span>📍</span> Live Vehicle Tracking</div>
            <div className="feature-item"><span>♻️</span> Waste Monitoring</div>
            <div className="feature-item"><span>🗺️</span> Zone Management</div>
            <div className="feature-item"><span>🔔</span> Smart Alerts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
