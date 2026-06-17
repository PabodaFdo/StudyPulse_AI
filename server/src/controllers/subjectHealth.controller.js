const axios = require('axios');

exports.calculateSubjectHealth = async (req, res) => {
  try {
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${ML_SERVICE_URL}/subject-health`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error in calculateSubjectHealth:', error.message);
    res.status(500).json({ message: 'Failed to calculate subject health score' });
  }
};
