const express = require('express');
const router = express.Router();
const { getDrivers, getDriver, createDriver, updateDriver, deleteDriver, getDriverStats } = require('../controllers/driverController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getDriverStats);
router.get('/', protect, getDrivers);
router.get('/:id', protect, getDriver);
router.post('/', protect, createDriver);
router.put('/:id', protect, updateDriver);
router.delete('/:id', protect, deleteDriver);

module.exports = router;
