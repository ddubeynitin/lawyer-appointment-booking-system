const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Register route
router.post('/register', registerUser);
// Login route
router.post('/login', authMiddleware, loginUser);

module.exports = router;