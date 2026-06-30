import api from './api';

const predictRisk = async (payload) => {
  const response = await api.post('/risk/predict', payload);
  return response.data;
};

const saveRiskHistory = async (payload) => {
  const response = await api.post('/risk/history', payload);
  return response.data;
};

const getRiskHistory = async (subjectId) => {
  const response = await api.get(`/risk/history/${subjectId}`);
  return response.data;
};

const getLatestRiskPrediction = async (subjectId) => {
  const response = await api.get(`/risk/history/${subjectId}/latest`);
  return response.data;
};

const getRiskSummary = async () => {
  const response = await api.get('/risk/history/summary');
  return response.data;
};

export const riskService = {
  predictRisk,
  saveRiskHistory,
  getRiskHistory,
  getLatestRiskPrediction,
  getRiskSummary,
};
