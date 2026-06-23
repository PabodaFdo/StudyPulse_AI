import api from './api';

export const extractPdfText = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/pdf/extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
