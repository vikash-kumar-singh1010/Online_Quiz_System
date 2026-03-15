import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import { getQuizzes, getResultsByUser } from '../../services/quizService';
import { PlayCircle, Clock, Users, CheckCircle, Target } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState({});
  const [skillData, setSkillData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/student/login');
      return;
    }
    setUser(currentUser);
    
    // Fetch all quizzes and user results
    const allQuizzes = getQuizzes();
    setQuizzes(allQuizzes);

    const userResults = getResultsByUser(currentUser.id);
    const completedMap = {};
    let totalScore = 0;
    let maxScore = 0;

    userResults.forEach(r => {
      completedMap[r.quizId] = r;
      totalScore += r.score;
      maxScore += r.total;
    });
    setCompletedQuizzes(completedMap);

    // Generate mock skill data based on actual performance for the radar chart
    const baseSkill = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 50;
    
    setSkillData([
      { subject: 'Logic', A: Math.min(100, baseSkill + Math.floor(Math.random() * 20)), fullMark: 100 },
      { subject: 'Memory', A: Math.min(100, baseSkill - Math.floor(Math.random() * 15)), fullMark: 100 },
      { subject: 'Speed', A: Math.min(100, baseSkill + Math.floor(Math.random() * 10)), fullMark: 100 },
      { subject: 'Accuracy', A: baseSkill, fullMark: 100 },
      { subject: 'Problem Solving', A: Math.min(100, baseSkill + Math.floor(Math.random() * 25)), fullMark: 100 },
    ]);

  }, [navigate]);

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
        <div>
          <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.name}. Ready to test your knowledge?</p>
        </div>

        {Object.keys(completedQuizzes).length > 0 && (
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fff' }}>
                <Target size={24} color="var(--primary)" />
                <h2 style={{ fontSize: '1.5rem' }}>Your Skill Analysis</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Based on your recent quiz performances, here is a breakdown of your core competencies. Keep taking quizzes to improve your metrics across the board!
              </p>
            </div>
            
            <div style={{ height: '300px', flex: '1 1 400px', minWidth: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                  <Radar name="Student" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--surface-border)' }}>Available Quizzes</h2>
      
      {quizzes.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No quizzes available at the moment. Please check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {quizzes.map((quiz) => {
            const hasCompleted = completedQuizzes[quiz.id];
            
            return (
              <div key={quiz.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{quiz.title}</h3>
                  {hasCompleted ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '4px' }}>
                      <CheckCircle size={14} /> Completed
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '4px' }}>
                      New
                    </span>
                  )}
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {quiz.description}
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Clock size={16} />
                    {quiz.timer} mins
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Users size={16} />
                    {quiz.questions.length} Qs
                  </div>
                </div>

                {hasCompleted ? (
                  <Link to={`/student/result/${quiz.id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                    View Results
                  </Link>
                ) : (
                  <Link to={`/student/quiz/${quiz.id}`} className="btn btn-primary" style={{ width: '100%', gap: '0.5rem' }}>
                    <PlayCircle size={18} />
                    Start Quiz
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
