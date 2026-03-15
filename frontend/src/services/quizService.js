import { getDb, saveDb } from './mockDb';

export const createQuiz = (quizData) => {
  const db = getDb();
  const newQuiz = {
    ...quizData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  db.quizzes.push(newQuiz);
  saveDb(db);
  return newQuiz;
};

export const getQuizzes = () => {
  const db = getDb();
  return db.quizzes;
};

export const getQuizById = (id) => {
  const db = getDb();
  return db.quizzes.find(q => q.id === id);
};

export const submitQuizResult = (resultData) => {
  const db = getDb();
  const newResult = {
    ...resultData,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  db.results.push(newResult);
  saveDb(db);
  return newResult;
};

export const getResultsByQuiz = (quizId) => {
  const db = getDb();
  const results = db.results.filter(r => r.quizId === quizId);
  // Sort by score desc, then by time taken asc (faster is better)
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.timeTaken || 999999) - (b.timeTaken || 999999);
  });
};

export const getResultsByUser = (userId) => {
  const db = getDb();
  return db.results.filter(r => r.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
