const express = require('express');
const problemController = require('../controllers/problemController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

// Stats
router.get('/stats', problemController.getAreaStats);

// FEATURE 1: Problem Reporting
router.post('/', auth, upload.single('image'), problemController.createProblem);
router.get('/my', auth, problemController.getMyProblems);
router.get('/similar', problemController.checkSimilarProblems);
router.get('/', problemController.getAllProblems);

// Admin: moderation, fraud & listing (must precede '/:id')
router.get('/admin/all', auth, isAdmin, problemController.getAdminProblems);
router.put('/admin/:id/status', auth, isAdmin, upload.single('afterImage'), problemController.updateProblemStatus);
router.put('/admin/:id/moderate', auth, isAdmin, problemController.moderateProblem);
router.put('/:id/fraud', auth, isAdmin, problemController.toggleFraudStatus);

router.get('/:id', problemController.getProblemById);

// FEATURE 2: Issue Tracking
router.get('/reference/:referenceNumber', problemController.getProblemByReference);
router.get('/:id/status', problemController.getProblemStatus);
router.get('/:id/timeline', problemController.getProblemTimeline);
router.put('/:id/status', auth, upload.single('afterImage'), problemController.updateProblemStatus);

// Support & Escalation
router.post('/:id/support', auth, problemController.supportProblem);
router.post('/:id/escalate', auth, problemController.escalateProblem);

// Admin
router.delete('/:id', problemController.deleteProblem);

module.exports = router;
