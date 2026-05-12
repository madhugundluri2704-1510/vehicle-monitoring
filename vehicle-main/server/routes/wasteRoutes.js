const express = require('express');
const router = express.Router();
const { getWasteCollections, getWasteCollection, createWasteCollection, updateWasteCollection, deleteWasteCollection, getWasteStats } = require('../controllers/wasteController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getWasteStats);
router.get('/', protect, getWasteCollections);
router.get('/:id', protect, getWasteCollection);
router.post('/', protect, createWasteCollection);
router.put('/:id', protect, updateWasteCollection);
router.delete('/:id', protect, deleteWasteCollection);

module.exports = router;
