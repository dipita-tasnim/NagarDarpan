const mongoose = require('mongoose');

const authoritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Role is required (e.g. Ward Councillor, Mayor)'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  division: {
    type: String,
    required: [true, 'Division is required'],
  },
  district: {
    type: String,
    required: [true, 'District is required'],
  },
  thana: {
    type: String,
    required: [true, 'Thana is required'],
  },
  ward: {
    type: String,
    trim: true,
  },
  officeAddress: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Authority', authoritySchema);
