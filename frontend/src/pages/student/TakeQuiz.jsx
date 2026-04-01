import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';
import { getQuizById, submitQuizResult, getResultsByUser } from '../../services/quizService';
import { Clock, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle } from 'lucide-react';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRestored, setIsRestored] = useState(false);
  
  // Proctoring State
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const MAX_WARNINGS = 3;

  useEffect(() => {
    const fetchQuiz = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'student') {
        navigate('/student/login');
        return;
      }
      setUser(currentUser);

      try {
        const quizData = await getQuizById(id);
        if (!quizData) {
          navigate('/student/dashboard');
          return;
        }

        // Check if already taken
        const userResults = await getResultsByUser();
        if (userResults.find(r => r.quizId === id)) {
          navigate(`/student/result/${id}`);
          return;
        }

        setQuiz(quizData);

        // Auto-Save Restoration Logic
        const savedState = localStorage.getItem(`quiz_progress_${currentUser.id}_${id}`);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setAnswers(parsedState.answers || {});
          setCurrentQuestion(parsedState.currentQuestion || 0);
          setTimeLeft(parsedState.timeLeft || quizData.timer * 60);
          setWarningCount(parsedState.warningCount || 0);
          setIsRestored(true);
        } else {
          setTimeLeft(quizData.timer * 60);
        }
        
        enterFullscreen();
      } catch (err) {
        console.error('Failed to fetch quiz details:', err);
        alert(err.message || 'Failed to access quiz. It may be restricted or unavailable.');
        navigate('/student/dashboard');
      }
    };

    fetchQuiz();

    // Proctoring Events
    const handleVisibilityChange = () => { if (document.hidden) handleViolation(); };
    const handleWindowBlur = () => { handleViolation(); };
    const handleCopyPaste = (e) => { e.preventDefault(); alert('Copy/Paste is disabled during the quiz for security reasons.'); };
    const handleContextMenu = (e) => { e.preventDefault(); };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [id, navigate]); // Intentionally omitting handleViolation to avoid deep re-binding issues

  // Handle Timer Countdown safely avoiding stale closures
  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, timeLeft]);

  const handleSubmit = useCallback(async (questionsData = quiz.questions, userId = user.id, quizId = quiz._id) => {
    const timeTaken = (quiz.timer * 60) - timeLeft;

    try {
      await submitQuizResult({
        quizId,
        answers,
        warnings: warningCount,
        timeTaken
      });

      // Clear auto-save data upon successful submission
      localStorage.removeItem(`quiz_progress_${userId}_${quizId}`);

      if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error(err));
      }

      navigate(`/student/result/${quizId}`);
    } catch (err) {
      alert(err.message || 'Failed to submit quiz');
    }
  }, [quiz, user, answers, warningCount, navigate, timeLeft]);

  // Handle Auto Submit safely avoiding stale closures
  useEffect(() => {
    if (quiz && user && timeLeft === 0) {
      handleSubmit(quiz.questions, user.id, quiz._id);
    }
  }, [timeLeft, quiz, handleSubmit, user]);

  // Secondary effect to continuously auto-save progress whenever state changes
  useEffect(() => {
    if (user && quiz) {
      const stateToSave = {
        answers,
        currentQuestion,
        timeLeft,
        warningCount
      };
      localStorage.setItem(`quiz_progress_${user.id}_${quiz._id}`, JSON.stringify(stateToSave));
    }
  }, [answers, currentQuestion, timeLeft, warningCount, user, quiz]);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const handleViolation = useCallback(() => {
    setWarningCount(prev => {
      const newCount = prev + 1;
      if (newCount >= MAX_WARNINGS) {
        // Auto-submit on max violations
        alert(`Maximum warnings (${MAX_WARNINGS}) reached. Your quiz has been automatically submitted.`);
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error(err));
        }
        // Small delay to ensure state can be read
        setTimeout(() => {
           document.getElementById("submit-quiz-btn")?.click();
        }, 100);
      } else {
        setShowWarningModal(true);
      }
      return newCount;
    });
  }, [MAX_WARNINGS]);

  const handleOptionSelect = (qIndex, oIndex) => {
    setAnswers({ ...answers, [qIndex]: oIndex });
  };



  if (!quiz) return <div className="flex-center" style={{ minHeight: '50vh' }}>Loading...</div>;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const q = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  const isLowTime = timeLeft < 60; // less than 1 minute

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="heading" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{quiz.title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Question {currentQuestion + 1} of {quiz.questions.length}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isRestored && (
            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '4px', border: '1px solid var(--success)' }}>
              Progress Auto-Restored
            </span>
          )}
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: isLowTime ? 'var(--danger)' : 'var(--surface-border)', color: isLowTime ? 'var(--danger)' : 'var(--text-primary)', transition: 'all 0.3s ease' }}>
            <Clock size={20} className={isLowTime ? 'animate-fade-in' : ''} style={{ animationIterationCount: isLowTime ? 'infinite' : '1' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {warningCount > 0 && (
         <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '8px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
           <AlertTriangle size={16} />
           Security Warning: Tab switching detected. Warning {warningCount} of {MAX_WARNINGS}.
         </div>
      )}

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: '1.5' }}>
          {currentQuestion + 1}. {q.text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {q.options.map((opt, oIndex) => {
            const isSelected = answers[currentQuestion] === oIndex;
            return (
              <div 
                key={oIndex} 
                onClick={() => handleOptionSelect(currentQuestion, oIndex)}
                className={`glass-panel ${isSelected ? 'selected-option' : ''}`}
                style={{ 
                  padding: '1.25rem', 
                  cursor: 'pointer', 
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--surface-border)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--surface)',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', border: isSelected ? '5px solid var(--primary)' : '2px solid var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                </div>
                <span style={{ fontSize: '1.125rem' }}>{opt}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} 
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
          style={{ opacity: currentQuestion === 0 ? 0.5 : 1, pointerEvents: currentQuestion === 0 ? 'none' : 'auto' }}
        >
          <ChevronLeft size={18} /> Previous
        </button>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {quiz.questions.map((_, i) => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === currentQuestion ? 'var(--primary)' : answers[i] !== undefined ? 'var(--success)' : 'var(--surface-border)' }} />
          ))}
        </div>

        {isLastQuestion ? (
          <button id="submit-quiz-btn" onClick={() => handleSubmit(quiz.questions, user.id, quiz.id)} className="btn btn-primary" style={{ background: 'var(--success)' }}>
            <CheckCircle size={18} /> Submit Quiz
          </button>
        ) : (
          <button onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))} className="btn btn-primary">
            Next <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Warning Modal Overlay */}
      {showWarningModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '400px', textAlign: 'center', borderColor: 'var(--danger)' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <AlertTriangle size={48} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Violation Detected</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
              You have navigated away from the quiz environment. This is your <strong>{warningCount}</strong> of <strong>{MAX_WARNINGS}</strong> warnings. 
              Further violations will result in automatic submission.
            </p>
            <button onClick={() => { setShowWarningModal(false); enterFullscreen(); }} className="btn btn-primary" style={{ width: '100%', background: 'var(--danger)' }}>
              Acknowledge & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
