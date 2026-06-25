const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Division name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Division code is required'],
    unique: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Division', divisionSchema);
