const express = require('express');
const router = express.Router();
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, getVehicleStats } = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getVehicleStats);
router.get('/', protect, getVehicles);
router.get('/:id', protect, getVehicle);
router.post('/', protect, createVehicle);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

module.exports = router;
