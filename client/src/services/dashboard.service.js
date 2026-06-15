import api from './api';

const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
  getCharts: async () => {
    const response = await api.get('/dashboard/charts');
    return response.data;
  }
};

export default dashboardService;
