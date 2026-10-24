'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { env } = require('../config/env');
const {
  register, registerValidation,
  login, loginValidation,
  getMe, updateMe, changePassword,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
