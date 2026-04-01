import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, BookOpen, UserCircle } from 'lucide-react';
import { getCurrentUser, logout } from '../services/authService';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUser(getCurrentUser());
  }, [location]); // Re-check user when route changes

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      borderRadius: 0,
      borderTop: 'none', borderLeft: 'none', borderRight: 'none',
      zIndex: 100,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
        <BookOpen className="heading" />
        <span className="heading">BrainDash</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
            <Link to={`/${user.role}/dashboard`} style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', borderLeft: '1px solid var(--surface-border)', paddingLeft: '1.5rem' }}>
              <UserCircle size={20} />
              <span style={{ fontWeight: 500 }}>{user.name}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/student/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Student Login</Link>
            <Link to="/admin/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Admin Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
