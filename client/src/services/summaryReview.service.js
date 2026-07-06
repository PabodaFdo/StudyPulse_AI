import api from './api';

export const saveSummaryReviewAttempt = async (attemptData) => {
  try {
    const response = await api.post('/summaries/review-attempts', attemptData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'API Error' };
  }
};

export const getSummaryReviewAttempts = async () => {
  try {
    const response = await api.get('/summaries/review-attempts');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'API Error' };
  }
};

export const getSummaryReviewAnalytics = async () => {
  try {
    const response = await api.get('/summaries/review-attempts/summary');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'API Error' };
  }
};
