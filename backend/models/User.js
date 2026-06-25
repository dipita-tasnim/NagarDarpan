const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Problem = require('./Problem');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['citizen', 'admin'],
    default: 'citizen',
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active',
  },
  warnings: {
    type: Number,
    default: 0,
  },
  isVerifiedCitizen: {
    type: Boolean,
    default: false,
  },
  suspensionEndDate: {
    type: Date,
  },
  trustScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100,
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Calculate and update trust score for a user.
 * Score logic:
 *   Base: 50
 *   +20 if verified citizen
 *   -10 per warning (max -30)
 *   +15 if resolved reports ratio > 50%
 *   +10 if account age > 30 days
 *   -25 if any fraud-flagged reports
 *   -20 if status is suspended, -40 if banned
 *   Clamped to 0-100
 */
userSchema.methods.calculateTrustScore = async function () {
  let score = 50;

  // Verified citizen bonus
  if (this.isVerifiedCitizen) score += 20;

  // Warning penalty (max -30)
  score -= Math.min(this.warnings * 10, 30);

  // Account age bonus
  const accountAgeDays = (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (accountAgeDays > 30) score += 10;

  // Status penalty
  if (this.status === 'suspended') score -= 20;
  if (this.status === 'banned') score -= 40;

  // Report-based scoring
  const totalReports = await Problem.countDocuments({ reportedBy: this._id });
  const resolvedReports = await Problem.countDocuments({ reportedBy: this._id, status: 'Resolved' });
  const fraudReports = await Problem.countDocuments({ reportedBy: this._id, isFraud: true });

  if (totalReports > 0) {
    // Good resolution ratio bonus
    const resolvedRatio = resolvedReports / totalReports;
    if (resolvedRatio > 0.5) score += 15;
    else if (resolvedRatio > 0.25) score += 5;

    // Fraud penalty
    if (fraudReports > 0) score -= 25;
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  this.trustScore = score;
  await this.save();
  return score;
};

/**
 * Get trust level label from score
 */
userSchema.methods.getTrustLevel = function () {
  if (this.trustScore >= 90) return 'Trusted Citizen';
  if (this.trustScore >= 60) return 'Normal User';
  if (this.trustScore >= 40) return 'Under Review';
  return 'Suspicious User';
};

module.exports = mongoose.model('User', userSchema);
