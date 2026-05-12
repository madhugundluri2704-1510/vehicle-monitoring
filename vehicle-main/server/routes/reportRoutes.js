const express = require('express');
const router = express.Router();
const { getDashboardSummary, getPerformanceReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getDashboardSummary);
router.get('/performance', protect, getPerformanceReport);

module.exports = router;
