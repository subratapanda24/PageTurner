const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, firebaseLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/firebase', firebaseLogin);
router.get('/me', protect, getUserProfile);

module.exports = router;
