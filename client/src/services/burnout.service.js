import api from './api';

export const burnoutService = {
  getSummary: async () => {
    const response = await api.get('/burnout/summary');
    return response.data;
  },
};
