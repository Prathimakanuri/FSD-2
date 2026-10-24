'use strict';

const mongoose = require('mongoose');

// Pricing per seat category for a showtime
const pricingSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['regular', 'premium', 'recliner', 'accessible'],
      required: true,
    },
    // Price stored in paise (integer). 1 INR = 100 paise
    pricePaise: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    pricing: {
      type: [pricingSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one pricing entry is required',
      },
    },
    language: { type: String, default: 'Hindi' },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby'],
      default: '2D',
    },
    isActive: { type: Boolean, default: true },
    totalSeats: { type: Number, required: true },
    bookedSeatsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

showtimeSchema.index({ movie: 1, startTime: 1, isActive: 1 });
showtimeSchema.index({ theatre: 1, startTime: 1 });
showtimeSchema.index({ startTime: 1 });

// Virtual for available seats
showtimeSchema.virtual('availableSeats').get(function () {
  return this.totalSeats - this.bookedSeatsCount;
});

const Showtime = mongoose.model('Showtime', showtimeSchema);
module.exports = Showtime;
