'use strict';

const Movie = require('../models/Movie');
const { AppError } = require('../middleware/errorHandler');
const { getPaginationParams, paginate, successResponse } = require('../utils/helpers');
const { env } = require('../config/env');

/**
 * GET /api/movies
 * Public: list movies with search, filter, sort, paginate
 */
async function listMovies(req, res, next) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, genre, status, sort, featured } = req.query;

    const filter = { isActive: true };

    if (status && ['now_showing', 'coming_soon', 'ended'].includes(status)) {
      filter.status = status;
    }
    if (genre) {
      filter.genres = { $regex: genre, $options: 'i' };
    }
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    let query;
    if (search && search.trim()) {
      query = Movie.find(
        { ...filter, $text: { $search: search.trim() } },
        { score: { $meta: 'textScore' } }
      );
      if (!sort) {
        query = query.sort({ score: { $meta: 'textScore' } });
      }
    } else {
      query = Movie.find(filter);
    }

    // Sorting
    const sortMap = {
      newest: { releaseDate: -1 },
      oldest: { releaseDate: 1 },
      rating: { rating: -1 },
      title: { title: 1 },
      popular: { voteCount: -1 },
    };
    if (sort && sortMap[sort]) {
      query = query.sort(sortMap[sort]);
    } else if (!search) {
      query = query.sort({ isFeatured: -1, rating: -1, releaseDate: -1 });
    }

    const [movies, total] = await Promise.all([
      query.skip(skip).limit(limit).lean(),
      Movie.countDocuments(filter),
    ]);

    res.json({
      success: true,
      ...paginate({ data: movies, total, page, limit }),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/movies/:id
 */
async function getMovie(req, res, next) {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!movie) throw new AppError('Movie not found', 404);
    res.json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/movies/genres
 */
async function listGenres(req, res, next) {
  try {
    const genres = await Movie.distinct('genres', { isActive: true });
    res.json({ success: true, data: genres.filter(Boolean).sort() });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/movies
 */
async function createMovie(req, res, next) {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, message: 'Movie created', data: movie });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/movies/:id
 */
async function updateMovie(req, res, next) {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) throw new AppError('Movie not found', 404);
    res.json({ success: true, message: 'Movie updated', data: movie });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/movies/:id
 */
async function deleteMovie(req, res, next) {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!movie) throw new AppError('Movie not found', 404);
    res.json({ success: true, message: 'Movie removed' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/movies/fetch-tmdb/:tmdbId
 * Fetch movie from TMDB and save to DB
 */
async function fetchFromTMDB(req, res, next) {
  try {
    if (!env.TMDB_API_KEY) {
      throw new AppError('TMDB API key not configured', 501);
    }
    const axios = require('axios');
    const { tmdbId } = req.params;

    // Fetch movie details + credits
    const [movieRes, creditsRes, videosRes] = await Promise.all([
      axios.get(`${env.TMDB_BASE_URL}/movie/${tmdbId}`, {
        params: { api_key: env.TMDB_API_KEY, language: 'en-US' },
      }),
      axios.get(`${env.TMDB_BASE_URL}/movie/${tmdbId}/credits`, {
        params: { api_key: env.TMDB_API_KEY },
      }),
      axios.get(`${env.TMDB_BASE_URL}/movie/${tmdbId}/videos`, {
        params: { api_key: env.TMDB_API_KEY, language: 'en-US' },
      }),
    ]);

    const tmdb = movieRes.data;
    const credits = creditsRes.data;
    const videos = videosRes.data;

    const trailer = videos.results?.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    );
    const director = credits.crew?.find((c) => c.job === 'Director')?.name;
    const cast = (credits.cast || []).slice(0, 10).map((c) => ({
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    }));

    const movieData = {
      title: tmdb.title,
      originalTitle: tmdb.original_title,
      tmdbId: tmdb.id,
      overview: tmdb.overview,
      tagline: tmdb.tagline,
      posterPath: tmdb.poster_path,
      backdropPath: tmdb.backdrop_path,
      posterUrl: tmdb.poster_path
        ? `${env.TMDB_IMAGE_BASE}/w500${tmdb.poster_path}`
        : null,
      backdropUrl: tmdb.backdrop_path
        ? `${env.TMDB_IMAGE_BASE}/original${tmdb.backdrop_path}`
        : null,
      genres: tmdb.genres?.map((g) => g.name) || [],
      runtime: tmdb.runtime,
      language: tmdb.original_language,
      releaseDate: tmdb.release_date ? new Date(tmdb.release_date) : null,
      rating: tmdb.vote_average,
      voteCount: tmdb.vote_count,
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      cast,
      director,
      dataSource: 'tmdb',
      status: 'now_showing',
    };

    const movie = await Movie.findOneAndUpdate(
      { tmdbId: tmdb.id },
      { $set: movieData },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, message: 'Movie fetched from TMDB', data: movie });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMovies,
  getMovie,
  listGenres,
  createMovie,
  updateMovie,
  deleteMovie,
  fetchFromTMDB,
};
