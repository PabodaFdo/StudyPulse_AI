import api from './api';

export const generateSummary = async (text) => {
  const response = await api.post('/summaries/generate', { text });
  return response.data;
};

export default {
  generateSummary
};
