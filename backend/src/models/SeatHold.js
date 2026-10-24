'use strict';

const mongoose = require('mongoose');

/**
 * SeatHold — temporary hold placed while user is in checkout.
 * Expires after HOLD_DURATION_MINUTES (default 5 min).
 * Unique compound index prevents double-booking of same seat for same showtime.
 */
const seatHoldSchema = new mongoose.Schema(
  {
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
    },
    seatId: {
      type: String,
      required: true,
    },
    seatCategory: {
      type: String,
      enum: ['regular', 'premium', 'recliner', 'accessible'],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    holdToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index - auto-delete at expiresAt
    },
  },
  { timestamps: true }
);

// Prevent two holds for the same seat in the same show
seatHoldSchema.index({ showtime: 1, seatId: 1 }, { unique: true });
seatHoldSchema.index({ holdToken: 1 });
seatHoldSchema.index({ user: 1, showtime: 1 });

const SeatHold = mongoose.model('SeatHold', seatHoldSchema);
module.exports = SeatHold;
