const axios = require('axios');
const { formatQuizResponse } = require('../utils/quizUtils');

const generateQuiz = async (text, questionCount = 5, difficulty = 'medium') => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${mlServiceUrl}/generate-quiz`, { 
      text,
      question_count: questionCount,
      difficulty
    });
    return formatQuizResponse(response.data);
  } catch (error) {
    if (error.response) {
      throw new Error(`ML Service Error: ${error.response.data.detail || error.message}`);
    } else {
      throw new Error(`Failed to connect to ML Service: ${error.message}`);
    }
  }
};

module.exports = {
  generateQuiz
};
