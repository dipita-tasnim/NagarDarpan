const Problem = require('../models/Problem');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReports = await Problem.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reportsToday = await Problem.countDocuments({ createdAt: { $gte: today } });
    
    const pendingReports = await Problem.countDocuments({ status: 'Acknowledged' });
    const inProgressReports = await Problem.countDocuments({ status: 'In Progress' });
    const resolvedReports = await Problem.countDocuments({ status: 'Resolved' });
    const escalatedReports = await Problem.countDocuments({ escalated: true });
    const fraudReports = await Problem.countDocuments({ isFraud: true });

    // Most Problematic Area (Aggregation)
    const areaStats = await Problem.aggregate([
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const mostProblematicArea = areaStats.length > 0 ? areaStats[0]._id : 'N/A';

    // All Category Stats
    const categoryStats = await Problem.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const mostCommonCategory = categoryStats.length > 0 ? categoryStats[0]._id : 'N/A';
    const categoryDistribution = categoryStats.map(stat => ({ name: stat._id, value: stat.count }));

    // Status Stats
    const statusStatsData = await Problem.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statusDistribution = statusStatsData.map(stat => ({ name: stat._id, value: stat.count }));

    // Priority Stats
    const priorityStatsData = await Problem.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);
    const priorityDistribution = priorityStatsData.map(stat => ({ name: stat._id || 'Unassigned', value: stat.count }));

    // Reports by Month (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await Problem.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const reportsByMonth = monthlyData.map(data => ({
      name: `${monthNames[data._id.month - 1]}`,
      count: data.count
    }));

    // Area-wise complaints mapping for charts
    const areaWiseComplaints = areaStats.map(stat => ({
      name: stat._id,
      value: stat.count
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalReports,
        reportsToday,
        pendingReports,
        inProgressReports,
        resolvedReports,
        escalatedReports,
        fraudReports,
        mostProblematicArea,
        mostCommonCategory,
        reportsByMonth,
        areaWiseComplaints,
        categoryDistribution,
        statusDistribution,
        priorityDistribution
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).select('-password');
    
    // Get report counts and calculate trust scores for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const reportCount = await Problem.countDocuments({ reportedBy: user._id });
      const resolvedCount = await Problem.countDocuments({ reportedBy: user._id, status: 'Resolved' });
      const fraudCount = await Problem.countDocuments({ reportedBy: user._id, isFraud: true });
      
      // Recalculate trust score
      await user.calculateTrustScore();
      const trustLevel = user.getTrustLevel();
      
      return { 
        ...user.toObject(), 
        reportCount,
        resolvedCount,
        fraudCount,
        trustLevel,
      };
    }));

    res.status(200).json({ success: true, data: usersWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isVerifiedCitizen } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (isVerifiedCitizen !== undefined) updateData.isVerifiedCitizen = isVerifiedCitizen;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Recalculate trust score after status change
    await user.calculateTrustScore();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.warnUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { $inc: { warnings: 1 } }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Recalculate trust score after warning
    await user.calculateTrustScore();
    
    // Note: In a real app, we would send an email warning here
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFraudProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ isFraud: true, isRejected: { $ne: true } })
      .sort({ fraudScore: -1, createdAt: -1 })
      .populate('reportedBy', 'name email trustScore warnings status');
    res.status(200).json({ success: true, data: problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFraudStats = async (req, res) => {
  try {
    const totalFlagged = await Problem.countDocuments({ isFraud: true });
    const autoFlagged = await Problem.countDocuments({ isFraud: true, fraudScore: { $gte: 50 } });
    const manualFlagged = totalFlagged - autoFlagged;
    const rejectedCount = await Problem.countDocuments({ isRejected: true });

    // High-risk users: more than 1 fraud report
    const highRiskUsers = await Problem.aggregate([
      { $match: { isFraud: true, reportedBy: { $ne: null } } },
      { $group: { _id: '$reportedBy', fraudCount: { $sum: 1 }, titles: { $push: '$title' } } },
      { $match: { fraudCount: { $gte: 2 } } },
      { $sort: { fraudCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          fraudCount: 1,
          name: '$user.name',
          email: '$user.email',
          status: '$user.status',
          trustScore: '$user.trustScore',
          warnings: '$user.warnings',
        },
      },
    ]);

    // Fraud by category
    const fraudByCategory = await Problem.aggregate([
      { $match: { isFraud: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Fraud trend last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentFlaggedByDay = await Problem.aggregate([
      { $match: { isFraud: true, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFlagged,
        autoFlagged,
        manualFlagged,
        rejectedCount,
        highRiskUsers,
        fraudByCategory,
        recentFlaggedByDay,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.runFraudScan = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let newlyFlagged = 0;

    // Find all non-fraud, non-rejected problems submitted in last 24h
    const recentProblems = await Problem.find({
      isFraud: false,
      isRejected: false,
      createdAt: { $gte: oneDayAgo },
    });

    for (const problem of recentProblems) {
      // Always recalculate from scratch so stale/old scores don't block detection
      let fraudScore = 0;
      const fraudReasons = [];

      // 1. Spam title (long string with no spaces)
      if (problem.title.length > 20 && !problem.title.includes(' ')) {
        fraudScore += 50;
        fraudReasons.push('Suspicious title: long string with no spaces (possible spam)');
      }

      // 2. Duplicate titles in last 24h
      const dupCount = await Problem.countDocuments({
        title: problem.title,
        _id: { $ne: problem._id },
        createdAt: { $gte: oneDayAgo },
      });
      if (dupCount > 0) {
        fraudScore += 30;
        fraudReasons.push(`Duplicate title: ${dupCount} similar reports in 24h`);
      }

      // 3. Mass reporting by same user (>= 5 in 1 hour)
      if (problem.reportedBy) {
        const userCount = await Problem.countDocuments({
          reportedBy: problem.reportedBy,
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
        });
        if (userCount >= 5) {
          fraudScore += 50;
          fraudReasons.push(`Mass reporting: ${userCount} reports in 1 hour`);
        }

        // 4. Same category+location abuse (>= 3 in 24h)
        const sameLocCat = await Problem.countDocuments({
          reportedBy: problem.reportedBy,
          category: problem.category,
          thana: problem.thana,
          _id: { $ne: problem._id },
          createdAt: { $gte: oneDayAgo },
        });
        if (sameLocCat >= 3) {
          fraudScore += 30;
          fraudReasons.push(`Repeated same category & location: ${sameLocCat} reports in 24h`);
        }
      }

      problem.fraudScore = fraudScore;
      problem.fraudReasons = fraudReasons;
      if (fraudScore >= 50) {
        problem.isFraud = true;
        newlyFlagged++;
      }
      await problem.save();
    }

    res.status(200).json({
      success: true,
      message: `Fraud scan complete. ${newlyFlagged} new problem(s) flagged.`,
      data: { scanned: recentProblems.length, newlyFlagged },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndUpdate(
      id,
      { isRejected: true, isHidden: true, isFraud: true },
      { new: true }
    );
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.status(200).json({ success: true, message: 'Problem rejected and hidden from public view', data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/admin/problems/:id/after-image
 * @access  Admin
 * @desc    Admin uploads "after fix" proof image when resolving a problem
 */
exports.adminUploadAfterImage = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    // Save after image
    problem.afterImage = {
      filename: req.file.filename,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
    };

    problem.timeline.push({
      status: problem.status,
      timestamp: new Date(),
      notes: 'Admin uploaded proof-of-fix image after resolution.',
    });

    await problem.save();

    res.status(200).json({
      success: true,
      message: 'After-fix proof image uploaded successfully by admin',
      data: problem,
    });
  } catch (error) {
    console.error('Error uploading admin after image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

