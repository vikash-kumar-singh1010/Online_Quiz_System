import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, signup } from '../services/authService';
import { LogIn, UserPlus } from 'lucide-react';

const AuthPage = ({ role, mode }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isLogin = mode === 'login';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password, role);
      } else {
        result = await signup(formData.name, formData.email, formData.password, role);
      }

      if (result.success) {
        navigate(`/${role}/dashboard`);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  const themeColor = role === 'admin' ? 'var(--secondary)' : 'var(--primary)';

  return (
    <div className="animate-fade-in flex-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div className="text-center mb-8">
          <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${themeColor}20`, margin: '0 auto 1rem', color: themeColor }}>
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#fff', textTransform: 'capitalize' }}>
            {role} {mode}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Welcome back! Please enter your details.' : 'Create your account to get started.'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="glass-input"
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="glass-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="glass-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn" style={{ background: themeColor, color: 'white', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-8 text-secondary" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isLogin ? (
            <p>Don't have an account? <Link to={`/${role}/signup`} style={{ color: themeColor }}>Sign up</Link></p>
          ) : (
            <p>Already have an account? <Link to={`/${role}/login`} style={{ color: themeColor }}>Log in</Link></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
