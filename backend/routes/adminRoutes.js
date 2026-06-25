const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

router.get('/dashboard-stats', auth, isAdmin, adminController.getDashboardStats);

// User Management Routes
router.get('/users', auth, isAdmin, adminController.getAdminUsers);
router.put('/users/:id/status', auth, isAdmin, adminController.updateUserStatus);
router.post('/users/:id/warn', auth, isAdmin, adminController.warnUser);

// Fraud Detection Routes
router.get('/fraud-problems', auth, isAdmin, adminController.getFraudProblems);
router.get('/fraud-stats', auth, isAdmin, adminController.getFraudStats);
router.post('/fraud/scan', auth, isAdmin, adminController.runFraudScan);
router.post('/problems/:id/reject', auth, isAdmin, adminController.rejectProblem);

// Admin After-Image Upload (proof of fix)
router.post('/problems/:id/after-image', auth, isAdmin, upload.single('afterImage'), adminController.adminUploadAfterImage);

// Authority Routes
const authorityController = require('../controllers/authorityController');
router.get('/authorities', auth, isAdmin, authorityController.getAllAuthorities);
router.post('/authorities', auth, isAdmin, authorityController.createAuthority);
router.put('/authorities/:id', auth, isAdmin, authorityController.updateAuthority);
router.delete('/authorities/:id', auth, isAdmin, authorityController.deleteAuthority);

// Content Routes
const contentController = require('../controllers/contentController');
router.get('/content', auth, isAdmin, contentController.getAllContent);
router.post('/content', auth, isAdmin, contentController.createContent);
router.put('/content/:id', auth, isAdmin, contentController.updateContent);
router.delete('/content/:id', auth, isAdmin, contentController.deleteContent);

// Notification Routes
const notificationController = require('../controllers/notificationController');
router.get('/notifications', auth, isAdmin, notificationController.getAllNotifications);
router.post('/notifications', auth, isAdmin, notificationController.createNotification);
router.delete('/notifications/:id', auth, isAdmin, notificationController.deleteNotification);

module.exports = router;
