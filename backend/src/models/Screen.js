'use strict';

const mongoose = require('mongoose');

// Individual seat definition within a screen
const seatSchema = new mongoose.Schema(
  {
    row: { type: String, required: true },        // e.g. "A"
    number: { type: Number, required: true },      // e.g. 1
    seatId: { type: String, required: true },      // e.g. "A1"
    category: {
      type: String,
      enum: ['regular', 'premium', 'recliner', 'accessible'],
      default: 'regular',
    },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
    },
    screenType: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby'],
      default: '2D',
    },
    totalSeats: { type: Number, required: true },
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    seats: [seatSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

screenSchema.index({ theatre: 1, isActive: 1 });

const Screen = mongoose.model('Screen', screenSchema);
module.exports = Screen;
