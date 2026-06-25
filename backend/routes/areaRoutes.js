const express = require('express');
const areaController = require('../controllers/areaController');

const router = express.Router();

// Division endpoints
router.post('/divisions', areaController.createDivision);
router.get('/divisions', areaController.getAllDivisions);

// District endpoints
router.post('/districts', areaController.createDistrict);
router.get('/districts/:divisionId', areaController.getDistrictsByDivision);

// Thana endpoints
router.post('/thanas', areaController.createThana);
router.get('/thanas/:districtId', areaController.getThanasByDistrict);

module.exports = router;
