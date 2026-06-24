import api from './api';

export const saveStudyMaterial = async (data) => {
  const response = await api.post('/study-materials', data);
  return response.data;
};

export const getStudyMaterials = async () => {
  const response = await api.get('/study-materials');
  return response.data;
};

export const getStudyMaterialById = async (id) => {
  const response = await api.get(`/study-materials/${id}`);
  return response.data;
};

export const deleteStudyMaterial = async (id) => {
  const response = await api.delete(`/study-materials/${id}`);
  return response.data;
};
