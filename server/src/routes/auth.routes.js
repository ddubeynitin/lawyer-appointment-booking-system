const express = require('express');
const router = express.Router();
const env = require('../config/env');
const { createRateLimiter } = require('../middlewares/rateLimit');
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

const authRouteLimiter = createRateLimiter({
  windowMs: Number(env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 60,
  message: "Too many authentication requests from this IP. Please try again later.",
});

const otpRequestLimiter = createRateLimiter({
  windowMs: Number(env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(env.AUTH_OTP_RATE_LIMIT_MAX_REQUESTS) || 10,
  message: "Too many OTP requests from this IP. Please try again later.",
});

router.use(authRouteLimiter);

// Register route
router.post('/register', registerUser);
router.post('/register/request-otp', otpRequestLimiter, requestRegistrationOtp);
router.post('/register/verify-otp', verifyRegistrationOtp);
// Login route
router.post('/login', loginUser);
router.post('/login/request-otp', otpRequestLimiter, requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);
router.post('/password/request-otp', otpRequestLimiter, requestPasswordResetOtp);
router.post('/password/reset-with-otp', resetPasswordWithOtp);

module.exports = router;
