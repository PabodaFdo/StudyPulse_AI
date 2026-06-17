import api from './api';

const predictWeakTopic = async (payload) => {
  const response = await api.post('/weak-topics/predict', payload);
  return response.data;
};

export const weakTopicService = {
  predictWeakTopic,
};
