const express = require('express');
const router = express.Router();
const studyMaterialController = require('../controllers/studyMaterial.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', studyMaterialController.createStudyMaterial);
router.get('/', studyMaterialController.getStudyMaterials);
router.get('/:id', studyMaterialController.getStudyMaterial);
router.delete('/:id', studyMaterialController.deleteStudyMaterial);

module.exports = router;
