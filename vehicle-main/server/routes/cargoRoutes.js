const express = require('express');
const router = express.Router();
const { getCargos, getCargo, createCargo, updateCargo, deleteCargo, getCargoStats } = require('../controllers/cargoController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/stats', protect, getCargoStats);
router.get('/', protect, getCargos);
router.get('/:id', protect, getCargo);
router.post('/', protect, roleCheck('admin'), createCargo);
router.put('/:id', protect, roleCheck('admin'), updateCargo);
router.delete('/:id', protect, roleCheck('admin'), deleteCargo);

module.exports = router;
