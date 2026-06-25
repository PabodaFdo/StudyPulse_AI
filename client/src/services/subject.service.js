import api from './api';

const getSubjects = async () => {
  const response = await api.get('/subjects');
  return response.data;
};

const getSubjectAnalytics = async (subjectId) => {
  const response = await api.get(`/subjects/${subjectId}/analytics`);
  return response.data;
};

export const subjectService = {
  getSubjects,
  getSubjectAnalytics,
};
