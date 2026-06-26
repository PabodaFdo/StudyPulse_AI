import api from './api';

export const saveQuizAttempt = async (data) => {
  const response = await api.post('/quiz-attempts', data);
  return response.data;
};

export const getQuizAttempts = async () => {
  const response = await api.get('/quiz-attempts');
  return response.data;
};

export const getQuizAttemptStats = async () => {
  const response = await api.get('/quiz-attempts/stats');
  return response.data;
};

export const getTopicQuizAttemptStats = async (noteId) => {
  const response = await api.get(`/quiz-attempts/topic/${noteId}`);
  return response.data;
};

export const quizAttemptService = {
  saveQuizAttempt,
  getQuizAttempts,
  getQuizAttemptStats,
  getTopicQuizAttemptStats,
};
