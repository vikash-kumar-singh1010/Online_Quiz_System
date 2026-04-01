import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import { getQuizById, getResultsByQuiz, getResultsByUser } from '../../services/quizService';
import { Trophy, ArrowLeft, Target, Award, Zap, Timer, X } from 'lucide-react';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [rank, setRank] = useState(null);
  const [showScoreboard, setShowScoreboard] = useState(true);
  const [scoreboardResults, setScoreboardResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'student') {
        navigate('/student/login');
        return;
      }

      try {
        const quizData = await getQuizById(id);
        if (!quizData) {
          navigate('/student/dashboard');
          return;
        }
        setQuiz(quizData);

        const userResults = await getResultsByUser();
        const quizResult = userResults.find(r => r.quizId === id);
        if (!quizResult) {
          navigate(`/student/quiz/${id}`);
          return;
        }
        setResult(quizResult);

        // Calculate rank and scoreboard
        const allResults = await getResultsByQuiz(id);
        
        // Results are already enriched and sorted by score/time from the backend
        setScoreboardResults(allResults.slice(0, 5)); // Show top 5
        const userRank = allResults.findIndex(r => r.userId === currentUser.id) + 1;
        setRank(userRank);
        
      } catch (err) {
        console.error('Failed to fetch results:', err);
        navigate('/student/dashboard');
      }
    };

    fetchData();
  }, [id, navigate]);

  if (!quiz || !result) return <div className="flex-center" style={{ minHeight: '50vh' }}>Loading...</div>;

  const percentage = Math.round((result.score / result.total) * 100);
  
  let gradeColor = 'var(--danger)';
  if (percentage >= 80) gradeColor = 'var(--success)';
  else if (percentage >= 60) gradeColor = 'var(--warning)';

  const isWinner = rank === 1;

  const formatTimeTaken = (seconds) => {
     if (!seconds) return '--';
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      
      {/* Scoreboard Overlay (Menti-style) */}
      {showScoreboard && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)',
          zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '4rem',
          paddingBottom: '2rem',
          overflowY: 'auto',
          animation: 'fadeIn 0.5s ease'
        }}>
          <div className="glass-panel" style={{ 
            width: '90%', maxWidth: '500px', padding: '2.5rem', 
            border: '2px solid var(--primary)', borderRadius: '24px',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
          }}>
            <button 
              onClick={() => setShowScoreboard(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Zap size={40} className="animate-bounce" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                {isWinner ? "You're the Winner! 🏆" : "Fastest Fingers First!"}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Score & Speed Leaderboard</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {scoreboardResults.map((r, i) => {
                const isCurrentUser = r.userId === result.userId;
                return (
                  <div key={i} style={{ 
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                    background: isCurrentUser ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrentUser ? '1px solid var(--primary)' : '1px solid var(--surface-border)',
                    borderRadius: '12px',
                    animation: `slideInUp 0.3s ease forwards ${i * 0.1}s`,
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}>
                    <div style={{ 
                      width: '2.5rem', height: '2.5rem', borderRadius: '50%', 
                      background: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? '#cd7f32' : 'var(--surface-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: i < 3 ? '#000' : 'var(--text-secondary)'
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: isCurrentUser ? 'var(--primary)' : '#fff' }}>
                        {r.userName} {isCurrentUser && '(You)'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Timer size={12} /> {formatTimeTaken(r.timeTaken)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{r.score}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)' }}>Points</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setShowScoreboard(false)}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '2.5rem', padding: '1.25rem', fontSize: '1.125rem', fontWeight: 700 }}
            >
              Continue to Analysis
            </button>
          </div>
          
          <style>{`
            @keyframes slideInUp {
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/student/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <div style={{ marginLeft: '1rem' }}>
          <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Quiz Results</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{quiz.title}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '2rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Target size={32} />
          </div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Score</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: gradeColor }}>
            {result.score} <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {result.total}</span>
          </div>
        </div>

        <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '2rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '50%', color: 'var(--secondary)', marginBottom: '1rem' }}>
            <Award size={32} />
          </div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Accuracy</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>
            {percentage}%
          </div>
        </div>

        <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '2rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: 'var(--warning)', marginBottom: '1rem' }}>
            <Trophy size={32} />
          </div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Rank</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>
            #{rank}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Question Review</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {quiz.questions.map((q, qIndex) => {
          const userAnswer = result.answers[qIndex];
          const isCorrect = userAnswer === q.correctAnswer;
          
          return (
            <div key={qIndex} className="glass-panel" style={{ padding: '1.5rem', borderLeft: isCorrect ? '4px solid var(--success)' : '4px solid var(--danger)' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#fff' }}>
                {qIndex + 1}. {q.text}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {q.options.map((opt, oIndex) => {
                  let bg = 'var(--surface)';
                  let border = '1px solid var(--surface-border)';

                  if (oIndex === q.correctAnswer) {
                    bg = 'rgba(16, 185, 129, 0.1)';
                    border = '1px solid var(--success)';
                  } else if (oIndex === userAnswer && !isCorrect) {
                    bg = 'rgba(239, 68, 68, 0.1)';
                    border = '1px solid var(--danger)';
                  }

                  return (
                    <div key={oIndex} style={{ padding: '1rem', borderRadius: '8px', background: bg, border, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', border: oIndex === userAnswer ? '5px solid var(--text-primary)' : '2px solid var(--text-secondary)' }}></div>
                      <span>{opt}</span>
                      {oIndex === q.correctAnswer && <span style={{ marginLeft: 'auto', color: 'var(--success)', fontSize: '0.875rem' }}>Correct Answer</span>}
                      {oIndex === userAnswer && !isCorrect && <span style={{ marginLeft: 'auto', color: 'var(--danger)', fontSize: '0.875rem' }}>Your Answer</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center', paddingBottom: '2rem' }}>
        <Link to="/student/dashboard" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
          <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Return to Home Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ResultPage;
