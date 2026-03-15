import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import { getQuizById, getResultsByQuiz } from '../../services/quizService';
import { getDb } from '../../services/mockDb';
import { ArrowLeft, Users, TrendingUp, Award, ShieldAlert } from 'lucide-react';

const AdminQuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ average: 0, highest: 0, total: 0 });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    const quizData = getQuizById(id);
    if (!quizData || quizData.createdBy !== currentUser.id) {
      navigate('/admin/dashboard');
      return;
    }
    setQuiz(quizData);

    // Fetch and process results
    const quizResults = getResultsByQuiz(id);
    const db = getDb();
    
    // Enrich results with user names
    const enrichedResults = quizResults.map(r => {
      const student = db.users.find(u => u.id === r.userId);
      return {
        ...r,
        userName: student ? student.name : 'Unknown Student',
        percentage: Math.round((r.score / r.total) * 100)
      };
    });
    
    setResults(enrichedResults);

    // Calculate stats
    if (enrichedResults.length > 0) {
      const sum = enrichedResults.reduce((acc, curr) => acc + curr.percentage, 0);
      const avg = Math.round(sum / enrichedResults.length);
      const highest = Math.max(...enrichedResults.map(r => r.percentage));
      setStats({ average: avg, highest, total: enrichedResults.length });
    }
    
  }, [id, navigate]);

  if (!quiz) return <div className="flex-center" style={{ minHeight: '50vh' }}>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{quiz.title} - Results</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review student performance and rankings.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', color: 'var(--primary)' }}>
            <Users size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Attempts</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{stats.total}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: 'var(--warning)' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Average Score</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{stats.average}%</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--success)' }}>
            <Award size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Highest Score</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{stats.highest}%</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>Leaderboard</h2>
        
        {results.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No students have attempted this quiz yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Rank</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Student Name</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Score</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Accuracy</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Warnings</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, index) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--surface-border)', background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent' }}>
                    <td style={{ padding: '1rem' }}>
                      {index === 0 && <span style={{ color: 'gold', fontWeight: 700, marginRight: '0.5rem' }}>#1</span>}
                      {index === 1 && <span style={{ color: 'silver', fontWeight: 700, marginRight: '0.5rem' }}>#2</span>}
                      {index === 2 && <span style={{ color: '#cd7f32', fontWeight: 700, marginRight: '0.5rem' }}>#3</span>}
                      {index > 2 && <span style={{ color: 'var(--text-secondary)', marginLeft: '1.5rem' }}>#{index + 1}</span>}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{r.userName}</td>
                    <td style={{ padding: '1rem' }}>{r.score} / {r.total}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        background: r.percentage >= 80 ? 'rgba(16, 185, 129, 0.1)' : r.percentage >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: r.percentage >= 80 ? 'var(--success)' : r.percentage >= 60 ? 'var(--warning)' : 'var(--danger)'
                      }}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {r.warnings > 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: r.warnings >= 3 ? 'var(--danger)' : 'var(--warning)' }}>
                          <ShieldAlert size={16} />
                          {r.warnings}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuizResults;
