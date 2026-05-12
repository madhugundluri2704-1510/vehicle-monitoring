const express = require('express');
const router = express.Router();
const { getAlerts, acknowledgeAlert, getAlertStats } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getAlertStats);
router.get('/', protect, getAlerts);
router.put('/:id/acknowledge', protect, acknowledgeAlert);

module.exports = router;
