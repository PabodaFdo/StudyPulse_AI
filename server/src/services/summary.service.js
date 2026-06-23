const axios = require('axios');

const generateSummary = async (text) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${mlServiceUrl}/generate-summary`, { text });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`ML Service Error: ${error.response.data.detail || error.message}`);
    } else {
      throw new Error(`Failed to connect to ML Service: ${error.message}`);
    }
  }
};

module.exports = {
  generateSummary
};
