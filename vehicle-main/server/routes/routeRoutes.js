const express = require('express');
const router = express.Router();
const { getRoutes, getRoute, createRoute, updateRoute, deleteRoute } = require('../controllers/routeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRoutes);
router.get('/:id', protect, getRoute);
router.post('/', protect, createRoute);
router.put('/:id', protect, updateRoute);
router.delete('/:id', protect, deleteRoute);

module.exports = router;
