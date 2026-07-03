import api from './api';

export const saveFlashcardReviewAttempt = async (attemptData) => {
  try {
    const response = await api.post('/flashcards/review-attempts', attemptData);
    return response.data;
  } catch (error) {
    console.error('Error saving flashcard review attempt:', error);
    throw error;
  }
};

export const getFlashcardReviewAttempts = async (limit = 20) => {
  try {
    const response = await api.get(`/flashcards/review-attempts?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error getting flashcard review attempts:', error);
    throw error;
  }
};

export const getFlashcardReviewSummary = async () => {
  try {
    const response = await api.get('/flashcards/review-attempts/summary');
    return response.data;
  } catch (error) {
    console.error('Error getting flashcard review summary:', error);
    throw error;
  }
};
