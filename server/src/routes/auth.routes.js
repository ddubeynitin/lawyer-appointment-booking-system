const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  requestRegistrationOtp,
  verifyRegistrationOtp,
  requestLoginOtp,
  verifyLoginOtp,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} = require('../controllers/auth.controller');

// Register route
router.post('/register', registerUser);
router.post('/register/request-otp', requestRegistrationOtp);
router.post('/register/verify-otp', verifyRegistrationOtp);
// Login route
router.post('/login', loginUser);
router.post('/login/request-otp', requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);
router.post('/password/request-otp', requestPasswordResetOtp);
router.post('/password/reset-with-otp', resetPasswordWithOtp);

module.exports = router;
