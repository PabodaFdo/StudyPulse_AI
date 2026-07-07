import api from './api';

const getReminders = async (filters = {}) => {
  const response = await api.get('/revision/reminders', { params: filters });
  return response.data;
};

const generateReminders = async () => {
  const response = await api.post('/revision/reminders/generate');
  return response.data;
};

const completeReminder = async (id) => {
  const response = await api.patch(`/revision/reminders/${id}/complete`);
  return response.data;
};

const snoozeReminder = async (id, snoozeUntil) => {
  const response = await api.patch(`/revision/reminders/${id}/snooze`, {
    snoozeUntil,
  });
  return response.data;
};

const deleteReminder = async (id) => {
  const response = await api.delete(`/revision/reminders/${id}`);
  return response.data;
};

export const revisionService = {
  getReminders,
  generateReminders,
  completeReminder,
  snoozeReminder,
  deleteReminder,
};
