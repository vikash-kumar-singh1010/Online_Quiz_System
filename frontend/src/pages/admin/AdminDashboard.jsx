import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import { getQuizzes, getResultsByQuiz } from '../../services/quizService';
import { PlusCircle, Clock, Users, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        navigate('/admin/login');
        return;
      }
      setUser(currentUser);
      
      try {
        // Fetch quizzes and calculate stats
        // Endpoint returns only quizzes created by this admin due to backend logic
        const allQuizzes = await getQuizzes();
        setQuizzes(allQuizzes);

        const cData = [];
        const allAdminResults = [];
        
        // Fetch results for each quiz
        for (const quiz of allQuizzes) {
          const results = await getResultsByQuiz(quiz._id);
          allAdminResults.push(...results);
          
          let avgScore = 0;
          if (results.length > 0) {
             const sum = results.reduce((acc, r) => acc + (r.score / r.total) * 100, 0);
             avgScore = Math.round(sum / results.length);
          }
          
          cData.push({
            name: quiz.title.length > 15 ? quiz.title.substring(0, 15) + '...' : quiz.title,
            avgScore: avgScore,
            attempts: results.length
          });
        }
        
        setChartData(cData);

        // Process real trend data (Last 7 Days)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d;
        });

        const newTrendData = last7Days.map(date => {
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const startOfDay = new Date(date).setHours(0, 0, 0, 0);
          const endOfDay = new Date(date).setHours(23, 59, 59, 999);
          
          const attemptsThatDay = allAdminResults.filter(r => {
             const rt = new Date(r.createdAt).getTime();
             return rt >= startOfDay && rt <= endOfDay;
          }).length;

          return { day: dayName, attempts: attemptsThatDay };
        });

        setTrendData(newTrendData);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      }
    };

    fetchData();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.name}. Manage your quizzes here.</p>
        </div>
        <Link to="/admin/create-quiz" className="btn btn-primary" style={{ background: 'var(--secondary)' }}>
          <PlusCircle size={20} />
          Create New Quiz
        </Link>
      </div>

      {quizzes.length > 0 && chartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#fff' }}>
              <BarChart3 size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem' }}>Average Score per Quiz (%)</h3>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} angle={-45} textAnchor="end" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="avgScore" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#fff' }}>
              <TrendingUp size={20} color="var(--secondary)" />
              <h3 style={{ fontSize: '1.125rem' }}>Platform Engagement (Attempts)</h3>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="attempts" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--secondary)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--surface-border)' }}>Your Quizzes</h2>

      {quizzes.length === 0 ? (
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ padding: '1.5rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '50%', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
            <PlusCircle size={48} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Quizzes Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create your first quiz to start evaluating students.</p>
          <Link to="/admin/create-quiz" className="btn btn-primary" style={{ background: 'var(--secondary)' }}>Create Quiz</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{quiz.title}</h3>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
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

              <Link to={`/admin/quiz-results/${quiz._id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                View Results
                <ChevronRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
