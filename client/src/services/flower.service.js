import api from './api';

const getCollection = async () => {
  const response = await api.get('/flowers/collection');
  return response.data;
};

const checkUnlocks = async () => {
  const response = await api.post('/flowers/check-unlocks');
  return response.data;
};

export const flowerService = {
  getCollection,
  checkUnlocks,
};
