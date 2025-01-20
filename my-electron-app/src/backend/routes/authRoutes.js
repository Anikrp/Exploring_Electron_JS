const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/user', auth, authController.getProfile);
router.put('/user', auth, authController.updateProfile);

module.exports = router;