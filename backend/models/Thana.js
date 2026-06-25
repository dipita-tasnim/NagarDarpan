const mongoose = require('mongoose');

const thanaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Thana name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Thana code is required'],
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: [true, 'District is required'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Thana', thanaSchema);
