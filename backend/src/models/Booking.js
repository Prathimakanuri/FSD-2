'use strict';

const mongoose = require('mongoose');

const bookedSeatSchema = new mongoose.Schema(
  {
    seatId: { type: String, required: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    category: {
      type: String,
      enum: ['regular', 'premium', 'recliner', 'accessible'],
      required: true,
    },
    // Price paid for this seat in paise
    pricePaise: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
    },
    seats: {
      type: [bookedSeatSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one seat is required',
      },
    },
    // Totals in paise
    subtotalPaise: { type: Number, required: true },
    convenienceFeePaise: { type: Number, default: 0 },
    totalAmountPaise: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled', 'failed'],
      default: 'pending_payment',
    },

    paymentMethod: {
      type: String,
      enum: ['mock_payment', 'upi', 'card', 'netbanking', 'wallet'],
      default: 'mock_payment',
    },
    paymentId: { type: String },      // mock payment transaction ID
    paymentConfirmedAt: { type: Date },

    cancellationReason: { type: String },
    cancelledAt: { type: Date },

    // Idempotency key from client
    idempotencyKey: { type: String, unique: true, sparse: true },

    // Hold token used during checkout
    holdToken: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ showtime: 1, status: 1 });
bookingSchema.index({ bookingRef: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

// Ensure seats of a confirmed/pending booking are unique per showtime
bookingSchema.index(
  { showtime: 1, 'seats.seatId': 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending_payment', 'confirmed'] } },
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
