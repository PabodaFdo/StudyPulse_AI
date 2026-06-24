import api from './api';

export const generateFlashcards = async ({ text, card_count, difficulty }) => {
  const response = await api.post('/flashcards/generate', {
    text,
    card_count: parseInt(card_count, 10),
    difficulty
  });
  return response.data;
};
