const INITIAL_DATA = {
  users: [], // { id, name, email, password, role }
  quizzes: [], // { id, title, description, timer, questions: [], createdBy }
  results: [] // { id, userId, quizId, score, total, rank, timestamp }
};

export const initializeDb = () => {
  if (!localStorage.getItem('quiz_portal_data')) {
    localStorage.setItem('quiz_portal_data', JSON.stringify(INITIAL_DATA));
  }
};

export const getDb = () => {
  initializeDb();
  return JSON.parse(localStorage.getItem('quiz_portal_data'));
};

export const saveDb = (data) => {
  localStorage.setItem('quiz_portal_data', JSON.stringify(data));
};
