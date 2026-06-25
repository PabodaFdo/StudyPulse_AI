import api from './api';

const getNotes = async () => {
  const response = await api.get('/notes');
  return response.data;
};

const createNote = async (data) => {
  const response = await api.post('/notes', data);
  return response.data;
};

export const noteService = {
  getNotes,
  createNote,
};
