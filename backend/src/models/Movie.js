'use strict';

const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    originalTitle: { type: String, trim: true },
    tmdbId: { type: Number, unique: true, sparse: true },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      maxlength: [2000, 'Overview too long'],
    },
    tagline: { type: String, trim: true },
    posterPath: { type: String }, // TMDB path e.g. /abc.jpg
    backdropPath: { type: String },
    posterUrl: { type: String },  // Full URL fallback
    backdropUrl: { type: String },
    genres: [{ type: String }],
    runtime: { type: Number, min: 1 }, // minutes
    language: { type: String, default: 'en' },
    releaseDate: { type: Date },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'ended'],
      default: 'now_showing',
    },
    rating: { type: Number, min: 0, max: 10 },  // TMDB vote_average
    voteCount: { type: Number, default: 0 },
    trailerUrl: { type: String },
    cast: [
      {
        name: String,
        character: String,
        profilePath: String,
      },
    ],
    director: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    // Certification / parental guidance (U, UA, A, S)
    certification: { type: String, default: 'UA' },
    // Source of movie data
    dataSource: {
      type: String,
      enum: ['tmdb', 'manual'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text', overview: 'text' }, { default_language: 'none', language_override: 'none' });
movieSchema.index({ status: 1, isActive: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ rating: -1 });

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
