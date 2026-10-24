'use strict';

const express = require('express');
const router = express.Router();
const {
  listTheatres, getTheatre, createTheatre, updateTheatre, deleteTheatre,
  listScreens, getScreen, createScreen, updateScreen, deleteScreen,
  listShowtimes, getShowtime, createShowtime, updateShowtime, deleteShowtime,
} = require('../controllers/venueController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Theatre routes
router.get('/theatres', listTheatres);
router.get('/theatres/:id', getTheatre);
router.post('/theatres', verifyToken, requireAdmin, createTheatre);
router.put('/theatres/:id', verifyToken, requireAdmin, updateTheatre);
router.delete('/theatres/:id', verifyToken, requireAdmin, deleteTheatre);

// Screen routes
router.get('/screens', listScreens);
router.get('/screens/:id', getScreen);
router.post('/screens', verifyToken, requireAdmin, createScreen);
router.put('/screens/:id', verifyToken, requireAdmin, updateScreen);
router.delete('/screens/:id', verifyToken, requireAdmin, deleteScreen);

// Showtime routes
router.get('/showtimes', listShowtimes);
router.get('/showtimes/:id', getShowtime);
router.post('/showtimes', verifyToken, requireAdmin, createShowtime);
router.put('/showtimes/:id', verifyToken, requireAdmin, updateShowtime);
router.delete('/showtimes/:id', verifyToken, requireAdmin, deleteShowtime);

module.exports = router;
