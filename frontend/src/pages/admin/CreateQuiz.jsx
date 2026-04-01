import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../../services/quizService';
import { getCurrentUser } from '../../services/authService';
import { PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timer, setTimer] = useState(30);
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [isTimeBound, setIsTimeBound] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim() || !description.trim()) {
      return setError('Title and description are required.');
    }
    if (timer < 1) {
      return setError('Timer must be at least 1 minute.');
    }

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text.trim()) return setError(`Question ${i + 1} text is empty.`);
        if (q.options.some(opt => !opt.trim())) return setError(`All options for Question ${i + 1} must be filled.`);
    }

    if (isTimeBound) {
      if (!startTime || !endTime) {
        return setError('Start time and end time are required when Time Window is enabled.');
      }
      if (new Date(startTime) >= new Date(endTime)) {
        return setError('Start time must be before end time.');
      }
    }

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const quizData = {
      title,
      description,
      timer: Number(timer),
      questions,
      isTimeBound,
      startTime: isTimeBound ? startTime : undefined,
      endTime: isTimeBound ? endTime : undefined
    }; // createdBy is handled by backend JWT

    try {
      await createQuiz(quizData);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Create New Quiz</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Fill out the details below to create a new assessment.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#fff' }}>General Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Quiz Title</label>
              <input type="text" className="glass-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., React Fundamentals" required />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
              <textarea className="glass-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the quiz..." rows={3} required style={{ resize: 'vertical' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Timer (minutes)</label>
              <input type="number" className="glass-input" value={timer} onChange={e => setTimer(e.target.value)} min="1" required style={{ width: '150px' }} />
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none', color: '#fff', fontSize: '1rem' }}>
                <input 
                  type="checkbox" 
                  checked={isTimeBound} 
                  onChange={e => setIsTimeBound(e.target.checked)} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }} 
                />
                Enable Specific Date & Time Access Window
              </label>
              
              {isTimeBound && (
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                     <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Start Time</label>
                     <input type="datetime-local" className="glass-input" value={startTime} onChange={e => setStartTime(e.target.value)} required={isTimeBound} style={{ colorScheme: 'dark' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                     <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>End Time</label>
                     <input type="datetime-local" className="glass-input" value={endTime} onChange={e => setEndTime(e.target.value)} required={isTimeBound} style={{ colorScheme: 'dark' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Questions</h2>
          <button type="button" onClick={handleAddQuestion} className="btn btn-secondary" style={{ color: 'var(--secondary)', borderColor: 'var(--secondary)' }}>
            <PlusCircle size={18} /> Add Question
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', position: 'relative', borderLeft: '4px solid var(--secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', color: '#fff' }}>Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <input type="text" className="glass-input" value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} placeholder="Enter your question text here..." required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === oIndex} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)} style={{ cursor: 'pointer', width: '1.25rem', height: '1.25rem', accentColor: 'var(--secondary)' }} />
                  <input type="text" className="glass-input" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} required />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ background: 'var(--secondary)' }}>
            <Save size={18} />
            Save Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
