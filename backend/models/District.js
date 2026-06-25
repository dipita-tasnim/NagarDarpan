const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'District name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'District code is required'],
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    required: [true, 'Division is required'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('District', districtSchema);
