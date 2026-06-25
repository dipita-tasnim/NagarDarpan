const Division = require('../models/Division');
const District = require('../models/District');
const Thana = require('../models/Thana');

/**
 * @route   POST /api/divisions
 * @access  Public
 * @desc    Create a new division
 */
exports.createDivision = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required',
      });
    }

    const division = new Division({ name, code });
    await division.save();

    res.status(201).json({
      success: true,
      message: 'Division created successfully',
      data: division,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Division code already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating division',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/divisions
 * @access  Public
 * @desc    Get all divisions
 */
exports.getAllDivisions = async (req, res) => {
  try {
    const divisions = await Division.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: divisions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching divisions',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/districts
 * @access  Public
 * @desc    Create a new district
 */
exports.createDistrict = async (req, res) => {
  try {
    const { name, code, division } = req.body;

    if (!name || !code || !division) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, and division are required',
      });
    }

    const districtExists = await District.findOne({ code });
    if (districtExists) {
      return res.status(400).json({
        success: false,
        message: 'District code already exists',
      });
    }

    const district = new District({ name, code, division });
    await district.save();

    res.status(201).json({
      success: true,
      message: 'District created successfully',
      data: district,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating district',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/districts/:divisionId
 * @access  Public
 * @desc    Get all districts for a specific division
 */
exports.getDistrictsByDivision = async (req, res) => {
  try {
    const { divisionId } = req.params;

    const districts = await District.find({ division: divisionId })
      .populate('division', 'name code')
      .sort({ name: 1 });

    if (districts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No districts found for this division',
      });
    }

    res.status(200).json({
      success: true,
      data: districts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching districts',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/thanas
 * @access  Public
 * @desc    Create a new thana
 */
exports.createThana = async (req, res) => {
  try {
    const { name, code, district } = req.body;

    if (!name || !code || !district) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, and district are required',
      });
    }

    const thanaExists = await Thana.findOne({ code });
    if (thanaExists) {
      return res.status(400).json({
        success: false,
        message: 'Thana code already exists',
      });
    }

    const thana = new Thana({ name, code, district });
    await thana.save();

    res.status(201).json({
      success: true,
      message: 'Thana created successfully',
      data: thana,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating thana',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/thanas/:districtId
 * @access  Public
 * @desc    Get all thanas for a specific district
 */
exports.getThanasByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    const thanas = await Thana.find({ district: districtId })
      .populate('district', 'name code')
      .sort({ name: 1 });

    if (thanas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No thanas found for this district',
      });
    }

    res.status(200).json({
      success: true,
      data: thanas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching thanas',
      error: error.message,
    });
  }
};
