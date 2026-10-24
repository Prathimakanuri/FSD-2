'use strict';

const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      maxlength: 150,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true, required: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    amenities: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

theatreSchema.index({ 'address.city': 1, isActive: 1 });

const Theatre = mongoose.model('Theatre', theatreSchema);
module.exports = Theatre;
