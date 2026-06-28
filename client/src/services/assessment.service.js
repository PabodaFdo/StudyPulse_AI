import api from './api';

export const assessmentService = {
  createAssessment: async (data) => {
    const response = await api.post('/assessments', data);
    return response.data;
  },

  getAssessments: async () => {
    const response = await api.get('/assessments');
    return response.data;
  },

  getAssessmentsBySubject: async (subjectId) => {
    const response = await api.get(`/assessments/subject/${subjectId}`);
    return response.data;
  },

  getAssessmentSummary: async (subjectId) => {
    const response = await api.get(`/assessments/subject/${subjectId}/summary`);
    return response.data;
  },

  updateAssessment: async (id, data) => {
    const response = await api.put(`/assessments/${id}`, data);
    return response.data;
  },

  deleteAssessment: async (id) => {
    const response = await api.delete(`/assessments/${id}`);
    return response.data;
  }
};
