const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['faq', 'banner', 'policy'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // For text/HTML or image URL
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
