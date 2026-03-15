import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="animate-fade-in flex-center" style={{ minHeight: 'calc(100vh - 120px)', flexDirection: 'column' }}>
      <div className="text-center mb-8">
        <h1 className="heading" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Welcome to QuizPortal</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          An advanced, dynamic online examination system built for modern education. Choose your portal below to get started.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', width: '320px', textAlign: 'center', transition: 'transform 0.3s ease' }}
             onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
             onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
          <div className="flex-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <GraduationCap size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>For Students</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Take quizzes assigned by your instructors, track your performance, and compare ranks in real-time.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/student/login" className="btn btn-primary">Student Login</Link>
            <Link to="/student/signup" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Create Account</Link>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '3rem', width: '320px', textAlign: 'center', transition: 'transform 0.3s ease' }}
             onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
             onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
          <div className="flex-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.2)', margin: '0 auto 1.5rem', color: 'var(--secondary)' }}>
            <Briefcase size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>For Admins</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Create comprehensive exams, set time limits, and evaluate student performance effortlessly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/admin/login" className="btn" style={{ background: 'var(--secondary)', color: 'white' }}>Admin Login</Link>
            <Link to="/admin/signup" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
