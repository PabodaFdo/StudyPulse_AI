import api from './api';

const questService = {
  getQuests: async () => {
    const response = await api.get('/quests');
    return response.data;
  },
  completeQuest: async (id) => {
    const response = await api.patch(`/quests/${id}/complete`);
    return response.data;
  }
};

export default questService;
