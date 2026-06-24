import api from './api';

const PREFIX = '/ai-library';

export const saveSummary = async (data) => {
  const response = await api.post(`${PREFIX}/summaries`, data);
  return response.data;
};

export const getSavedSummaries = async () => {
  const response = await api.get(`${PREFIX}/summaries`);
  return response.data;
};

export const getSavedSummaryById = async (id) => {
  const response = await api.get(`${PREFIX}/summaries/${id}`);
  return response.data;
};

export const deleteSavedSummary = async (id) => {
  const response = await api.delete(`${PREFIX}/summaries/${id}`);
  return response.data;
};

export const saveQuiz = async (data) => {
  const response = await api.post(`${PREFIX}/quizzes`, data);
  return response.data;
};

export const getSavedQuizzes = async () => {
  const response = await api.get(`${PREFIX}/quizzes`);
  return response.data;
};

export const getSavedQuizById = async (id) => {
  const response = await api.get(`${PREFIX}/quizzes/${id}`);
  return response.data;
};

export const deleteSavedQuiz = async (id) => {
  const response = await api.delete(`${PREFIX}/quizzes/${id}`);
  return response.data;
};

export const saveFlashcards = async (data) => {
  const response = await api.post(`${PREFIX}/flashcards`, data);
  return response.data;
};

export const getSavedFlashcards = async () => {
  const response = await api.get(`${PREFIX}/flashcards`);
  return response.data;
};

export const getSavedFlashcardsById = async (id) => {
  const response = await api.get(`${PREFIX}/flashcards/${id}`);
  return response.data;
};

export const deleteSavedFlashcards = async (id) => {
  const response = await api.delete(`${PREFIX}/flashcards/${id}`);
  return response.data;
};
