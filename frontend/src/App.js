import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Lazy loaded components for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const TakeQuiz = lazy(() => import('./pages/student/TakeQuiz'));
const ResultPage = lazy(() => import('./pages/student/ResultPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CreateQuiz = lazy(() => import('./pages/admin/CreateQuiz'));
const AdminQuizResults = lazy(() => import('./pages/admin/AdminQuizResults'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading Portal...</p>
    <style>{`
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App">
        <Navbar />
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              
              {/* Auth Routes */}
              <Route path="/student/login" element={<AuthPage role="student" mode="login" />} />
              <Route path="/student/signup" element={<AuthPage role="student" mode="signup" />} />
              <Route path="/admin/login" element={<AuthPage role="admin" mode="login" />} />
              <Route path="/admin/signup" element={<AuthPage role="admin" mode="signup" />} />
              
              {/* Student Routes */}
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/quiz/:id" element={<TakeQuiz />} />
              <Route path="/student/result/:id" element={<ResultPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/create-quiz" element={<CreateQuiz />} />
              <Route path="/admin/quiz-results/:id" element={<AdminQuizResults />} />

              {/* Catch-all route for 404/Debugging */}
              <Route path="*" element={
                <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', minHeight: '60vh' }}>
                  <h2 className="heading">404 - Page Not Found</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>The page you are looking for does not exist or has been moved.</p>
                  <a href={process.env.PUBLIC_URL || "/"} className="btn btn-primary">Go Home</a>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default App;
