'use strict';

const express = require('express');
const router = express.Router();
const {
  getSeatAvailability,
  holdSeats,
  confirmBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  adminListBookings,
} = require('../controllers/bookingController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');

// Seat availability (optional auth to mark own holds)
router.get('/showtimes/:id/seats', optionalAuth, getSeatAvailability);

// Booking operations (authenticated)
router.post('/bookings/hold', verifyToken, holdSeats);
router.post('/bookings/confirm', verifyToken, confirmBooking);
router.get('/bookings/my', verifyToken, getMyBookings);
router.get('/bookings/:id', verifyToken, getBooking);
router.post('/bookings/:id/cancel', verifyToken, cancelBooking);

// Admin booking list
router.get('/admin/bookings', verifyToken, requireAdmin, adminListBookings);

module.exports = router;
