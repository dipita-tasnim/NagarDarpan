const Problem = require('../models/Problem');
const User = require('../models/User');
const { sendStatusChangeEmail } = require('../utils/emailService');

/**
 * @route   GET /api/problems/stats
 * @access  Public
 * @desc    Area-based statistics. groupBy=division|district|thana (default: division)
 *          Optional filters: division, district
 */
exports.getAreaStats = async (req, res) => {
  try {
    const groupBy = ['division', 'district', 'thana'].includes(req.query.groupBy)
      ? req.query.groupBy
      : 'division';

    const match = {};
    if (req.query.division) match.division = { $regex: new RegExp(`^${req.query.division}$`, 'i') };
    if (req.query.district) match.district = { $regex: new RegExp(`^${req.query.district}$`, 'i') };

    const pipeline = [
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      {
        $group: {
          _id: `$${groupBy}`,
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          categories: { $push: '$category' },
        },
      },
      { $sort: { total: -1 } },
    ];

    const raw = await Problem.aggregate(pipeline);

    // Find most common category for each area
    const data = raw.map((item) => {
      const freq = {};
      item.categories.forEach((c) => { if (c) freq[c] = (freq[c] || 0) + 1; });
      const topCategory = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      return {
        area: item._id || 'Unknown',
        total: item.total,
        resolved: item.resolved,
        unresolved: item.total - item.resolved,
        topCategory,
      };
    });

    res.status(200).json({ success: true, groupBy, data });
  } catch (error) {
    console.error('Error fetching area stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get problems reported by logged-in user
exports.getMyProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// FEATURE 1: Problem Reporting APIs

/**
 * @route   POST /api/problems
 * @access  Public
 * @desc    Create a new problem report
 */
exports.createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      division,
      district,
      thana,
      latitude,
      longitude,
      userName,
      userEmail,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !division || !district || !thana) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Handle image upload if provided
    let imageData = {};
    if (req.file) {
      imageData = {
        filename: req.file.filename,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`,
      };
    }

    // Create problem with timeline entry
    const problem = new Problem({
      title,
      description,
      category,
      division,
      district,
      thana,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      userName,
      userEmail,
      image: imageData,
      reportedBy: req.user ? req.user._id : undefined,
      status: 'Acknowledged',
      timeline: [
        {
          status: 'Acknowledged',
          timestamp: new Date(),
          notes: 'Problem reported and acknowledged',
        },
      ],
    });

    await problem.save();

    res.status(201).json({
      success: true,
      message: 'Problem reported successfully',
      data: {
        referenceNumber: problem.referenceNumber,
        problem: problem,
      },
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating problem report',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/problems
 * @access  Public
 * @desc    Get all problems with pagination and filters
 */
exports.getAllProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.division) filter.division = { $regex: new RegExp(`^${req.query.division}$`, 'i') };
    if (req.query.district) filter.district = { $regex: new RegExp(`^${req.query.district}$`, 'i') };
    if (req.query.thana)    filter.thana    = { $regex: new RegExp(`^${req.query.thana}$`, 'i') };

    const problems = await Problem.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Problem.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: problems,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problems',
      error: error.message,
    });
  }
};

// FEATURE 2: Issue Tracking APIs

/**
 * @route   GET /api/problems/:referenceNumber
 * @access  Public
 * @desc    Get problem details by reference number
 */
exports.getProblemByReference = async (req, res) => {
  try {
    const { referenceNumber } = req.params;

    const problem = await Problem.findOne({ referenceNumber });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problem',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/problems/:id/status
 * @access  Public
 * @desc    Get current status of a problem
 */
exports.getProblemStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id).select('referenceNumber status submissionTime');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        referenceNumber: problem.referenceNumber,
        currentStatus: problem.status,
        submissionTime: problem.submissionTime,
      },
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problem status',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/problems/:id/timeline
 * @access  Public
 * @desc    Get timeline/tracking history of a problem
 */
exports.getProblemTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id).select('referenceNumber submissionTime status timeline');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        referenceNumber: problem.referenceNumber,
        submissionTime: problem.submissionTime,
        currentStatus: problem.status,
        timeline: problem.timeline,
      },
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/problems/:id/status
 * @access  Admin
 * @desc    Update problem status (for admin/officials)
 */
exports.updateProblemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Acknowledged', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const problem = await Problem.findById(id).populate('reportedBy', 'name email');
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Update status
    problem.status = status;

    // Handle after image upload
    if (req.file) {
      problem.afterImage = {
        filename: req.file.filename,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`,
      };
    }

    // Add timeline entry
    problem.timeline.push({
      status,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status}`,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });

    await problem.save({ validateModifiedOnly: true });

    // Send email notification to the reporter (fire-and-forget)
    const reporterEmail = problem.reportedBy?.email || problem.userEmail;
    const reporterName  = problem.reportedBy?.name  || problem.userName;
    sendStatusChangeEmail({
      toEmail: reporterEmail,
      toName: reporterName,
      problemTitle: problem.title,
      referenceNumber: problem.referenceNumber,
      newStatus: status,
      notes: notes || '',
      changedByName: req.user.name,
    });

    res.status(200).json({
      success: true,
      message: 'Problem status updated successfully',
      data: problem,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/problems/:id
 * @access  Public
 * @desc    Get complete problem details by ID
 */
exports.getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id)
      .populate('division', 'name code')
      .populate('district', 'name code')
      .populate('thana', 'name code');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problem',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/problems/:id/support
 * @access  Authenticated
 * @desc    Toggle support (upvote) for a problem
 */
exports.supportProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    if (problem.reportedBy && problem.reportedBy.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot support your own problem' });
    }

    const alreadySupported = problem.supporters.some(
      (s) => s.toString() === userId.toString()
    );

    if (alreadySupported) {
      problem.supporters = problem.supporters.filter(
        (s) => s.toString() !== userId.toString()
      );
    } else {
      problem.supporters.push(userId);
    }
    problem.supportCount = problem.supporters.length;
    await problem.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      data: {
        supportCount: problem.supportCount,
        supported: !alreadySupported,
      },
    });
  } catch (error) {
    console.error('Error toggling support:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/problems/:id/escalate
 * @access  Authenticated
 * @desc    Escalate a problem to local authority
 */
exports.escalateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    if (problem.escalated) {
      return res.status(400).json({ success: false, message: 'Problem already escalated' });
    }

    // Check eligibility: 2+ supports OR 14+ days old and not resolved
    const daysSinceReport = (Date.now() - new Date(problem.submissionTime).getTime()) / (1000 * 60 * 60 * 24);
    const eligible = problem.supportCount >= 2 || (daysSinceReport >= 14 && problem.status !== 'Resolved');

    if (!eligible) {
      return res.status(400).json({
        success: false,
        message: 'Problem does not meet escalation criteria (2+ supports or 14+ days unresolved)',
      });
    }

    problem.escalated = true;
    problem.escalatedAt = new Date();
    problem.escalatedBy = userId;
    problem.timeline.push({
      status: problem.status,
      timestamp: new Date(),
      notes: 'Issue escalated to local authority',
    });
    await problem.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Problem escalated successfully',
      data: problem,
    });
  } catch (error) {
    console.error('Error escalating problem:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/problems/:id
 * @access  Admin
 * @desc    Delete a problem report
 */
exports.deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findByIdAndDelete(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting problem',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/problems/similar
 * @access  Public
 * @desc    Check for similar existing problems
 */
exports.checkSimilarProblems = async (req, res) => {
  try {
    const { category, thana } = req.query;
    if (!category || !thana) {
      return res.status(400).json({ success: false, message: 'Category and thana required' });
    }
    const similar = await Problem.find({
      category,
      thana,
      status: { $ne: 'Resolved' },
    }).select('title referenceNumber supportCount status').limit(5);

    res.status(200).json({ success: true, data: similar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/problems/:id/fraud
 * @access  Admin
 * @desc    Toggle fraud status of a problem
 */
exports.toggleFraudStatus = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    problem.isFraud = !problem.isFraud;
    problem.timeline.push({
      status: problem.status,
      timestamp: new Date(),
      notes: `Fraud status updated to ${problem.isFraud}`,
    });
    await problem.save();
    res.status(200).json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/problems/admin/all
 * @access  Admin
 * @desc    Get all problems for admin panel
 */
exports.getAdminProblems = async (req, res) => {
  try {
    const { division, district, thana, category, status, search } = req.query;

    let query = {};
    if (division) query.division = division;
    if (district) query.district = district;
    if (thana) query.thana = thana;
    if (category) query.category = category;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }

    const problems = await Problem.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/problems/admin/:id/moderate
 * @access  Admin
 * @desc    Moderate a problem (pin, hide, blur, priority, reset support)
 */
exports.moderateProblem = async (req, res) => {
  try {
    const { isPinned, isHidden, isBlurred, priority, resetSupport } = req.body;
    const problem = await Problem.findById(req.params.id);

    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    if (isPinned !== undefined) problem.isPinned = isPinned;
    if (isHidden !== undefined) problem.isHidden = isHidden;
    if (isBlurred !== undefined) problem.isBlurred = isBlurred;
    if (priority !== undefined) problem.priority = priority;

    // Support Control
    if (resetSupport) {
      problem.supportCount = 0;
      problem.supporters = [];
    }

    await problem.save();
    res.status(200).json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
