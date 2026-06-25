const mongoose = require('mongoose');
const crypto = require('crypto');

const problemSchema = new mongoose.Schema({
  // Feature 1 - Problem Reporting Fields
  referenceNumber: {
    type: String,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
  },
  category: {
    type: String,
    enum: [
      'Road Damage',
      'Water Supply',
      'Sewage',
      'Street Light',
      'Waste Management',
      'Public Health',
      'Safety',
      'Other',
      'Construction',
    ],
    required: [true, 'Category is required'],
  },
  // Location (plain text)
  division: {
    type: String,
    required: [true, 'Division is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  thana: {
    type: String,
    required: [true, 'Thana is required'],
    trim: true,
  },
  // GPS coordinates (optional)
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  // Image support (optional)
  image: {
    filename: String,
    path: String,
    url: String,
  },
  // After image (when resolved)
  afterImage: {
    filename: String,
    path: String,
    url: String,
  },
  // Who reported
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Feature 2 - Issue Tracking Fields
  status: {
    type: String,
    enum: ['Acknowledged', 'In Progress', 'Resolved'],
    default: 'Acknowledged',
  },
  submissionTime: {
    type: Date,
    default: Date.now,
  },
  // Timeline for tracking updates
  timeline: [
    {
      status: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      notes: String,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      changedByName: String,
    },
  ],
  // Support / upvote
  supporters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  supportCount: {
    type: Number,
    default: 0,
  },

  // Escalation
  escalated: {
    type: Boolean,
    default: false,
  },
  escalatedAt: {
    type: Date,
  },
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // User info (optional)
  userName: String,
  userEmail: String,

  // Fraud Detection
  isFraud: {
    type: Boolean,
    default: false,
  },
  fraudScore: {
    type: Number,
    default: 0,
  },
  fraudReasons: {
    type: [String],
    default: [],
  },
  isRejected: {
    type: Boolean,
    default: false,
  },

  // Moderation & Control
  isPinned: {
    type: Boolean,
    default: false,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  isBlurred: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Middleware to generate reference number before saving
problemSchema.pre('save', async function (next) {
  if (!this.referenceNumber) {
    this.referenceNumber = 'ND-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Problem', problemSchema);
