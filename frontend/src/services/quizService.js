import { apiFetch } from './api';

export const createQuiz = async (quizData) => {
  return apiFetch('/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData),
  });
};

export const getQuizzes = async () => {
  return apiFetch('/quizzes');
};

export const getQuizById = async (id) => {
  return apiFetch(`/quizzes/${id}`);
};

export const submitQuizResult = async (resultData) => {
  return apiFetch('/results', {
    method: 'POST',
    body: JSON.stringify(resultData),
  });
};

export const getResultsByQuiz = async (quizId) => {
  return apiFetch(`/results/quiz/${quizId}`);
};

export const getResultsByUser = async () => {
  return apiFetch('/results/user');
};
