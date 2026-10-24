'use strict';

const express = require('express');
const router = express.Router();
const {
  listMovies, getMovie, listGenres,
  createMovie, updateMovie, deleteMovie, fetchFromTMDB,
} = require('../controllers/movieController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', listMovies);
router.get('/genres', listGenres);
router.get('/:id', getMovie);

// Admin routes
router.post('/', verifyToken, requireAdmin, createMovie);
router.put('/:id', verifyToken, requireAdmin, updateMovie);
router.delete('/:id', verifyToken, requireAdmin, deleteMovie);
router.post('/tmdb/:tmdbId', verifyToken, requireAdmin, fetchFromTMDB);

module.exports = router;
