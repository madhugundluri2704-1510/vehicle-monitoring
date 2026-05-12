const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);
router.get('/users', protect, roleCheck('admin'), getUsers);

module.exports = router;
