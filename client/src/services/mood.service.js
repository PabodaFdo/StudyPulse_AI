import api from './api';

const createCheckIn = async (payload) => {
  const response = await api.post('/mood/check-ins', payload);
  return response.data;
};

const getCheckIns = async () => {
  const response = await api.get('/mood/check-ins');
  return response.data;
};

const getSummary = async () => {
  const response = await api.get('/mood/summary');
  return response.data;
};

const deleteCheckIn = async (id) => {
  const response = await api.delete(`/mood/check-ins/${id}`);
  return response.data;
};

export const moodService = {
  createCheckIn,
  getCheckIns,
  getSummary,
  deleteCheckIn,
};
