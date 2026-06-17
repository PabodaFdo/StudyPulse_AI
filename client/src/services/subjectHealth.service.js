import api from './api';

const calculateSubjectHealth = async (payload) => {
  const response = await api.post('/subject-health/calculate', payload);
  return response.data;
};

export const subjectHealthService = {
  calculateSubjectHealth,
};
