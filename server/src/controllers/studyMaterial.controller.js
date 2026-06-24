const studyMaterialService = require('../services/studyMaterial.service');

const createStudyMaterial = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, fileName, extractedText, wordCount } = req.body;

    if (!title || !extractedText) {
      return res.status(400).json({ success: false, message: 'Title and extractedText are required.' });
    }

    const material = await studyMaterialService.createStudyMaterial({
      userId,
      title,
      fileName,
      extractedText,
      wordCount
    });

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    next(error);
  }
};

const getStudyMaterials = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const materials = await studyMaterialService.getStudyMaterialsByUserId(userId);
    res.json(materials);
  } catch (error) {
    next(error);
  }
};

const getStudyMaterial = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const material = await studyMaterialService.getStudyMaterialById(id, userId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found.' });
    }

    res.json(material);
  } catch (error) {
    next(error);
  }
};

const deleteStudyMaterial = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await studyMaterialService.deleteStudyMaterial(id, userId);

    if (result.count === 0) {
      return res.status(404).json({ success: false, message: 'Study material not found.' });
    }

    res.json({ success: true, message: 'Study material deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudyMaterial,
  getStudyMaterials,
  getStudyMaterial,
  deleteStudyMaterial
};
