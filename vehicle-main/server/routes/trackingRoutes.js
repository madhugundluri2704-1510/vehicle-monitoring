const express = require('express');
const router = express.Router();
const { getTrackingHistory, getLatestPositions, addTrackingPoint } = require('../controllers/trackingController');
const { protect } = require('../middleware/auth');

router.get('/latest', protect, getLatestPositions);
router.get('/:vehicleId', protect, getTrackingHistory);
router.post('/', protect, addTrackingPoint);

module.exports = router;
