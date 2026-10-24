'use strict';

const express = require('express');
const router = express.Router();
const { getDashboard, listUsers, updateUserStatus } = require('../controllers/adminController');
const {
  listTheatres, createTheatre, updateTheatre, deleteTheatre,
  listScreens, createScreen, updateScreen, deleteScreen,
  listShowtimes, createShowtime, updateShowtime, deleteShowtime,
} = require('../controllers/venueController');
const { createMovie, updateMovie, deleteMovie, fetchFromTMDB } = require('../controllers/movieController');
const { adminListBookings, cancelBooking } = require('../controllers/bookingController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', listUsers);
router.put('/users/:id/status', updateUserStatus);

router.get('/bookings', adminListBookings);
router.post('/bookings/:id/cancel', cancelBooking);

// Admin movie management
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);
router.post('/movies/tmdb/:tmdbId', fetchFromTMDB);

// Admin venue management
router.post('/theatres', createTheatre);
router.put('/theatres/:id', updateTheatre);
router.delete('/theatres/:id', deleteTheatre);

router.post('/screens', createScreen);
router.put('/screens/:id', updateScreen);
router.delete('/screens/:id', deleteScreen);

router.get('/showtimes', listShowtimes);
router.post('/showtimes', createShowtime);
router.put('/showtimes/:id', updateShowtime);
router.delete('/showtimes/:id', deleteShowtime);

module.exports = router;
