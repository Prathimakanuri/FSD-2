'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const SeatHold = require('../models/SeatHold');
const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');
const { AppError } = require('../middleware/errorHandler');
const {
  calculateConvenienceFee,
  generateBookingRef,
  generatePaymentId,
} = require('../utils/currency');
const { getPaginationParams, paginate } = require('../utils/helpers');

const HOLD_DURATION_MINUTES = 5;
const MAX_SEATS_PER_BOOKING = 8;

/**
 * GET /api/showtimes/:id/seats
 * Returns full seat layout with current availability.
 */
async function getSeatAvailability(req, res, next) {
  try {
    const { id: showtimeId } = req.params;

    const showtime = await Showtime.findById(showtimeId)
      .populate('screen', 'seats rows columns name screenType')
      .lean();

    if (!showtime) throw new AppError('Showtime not found', 404);
    if (!showtime.isActive) throw new AppError('This showtime is no longer active', 410);
    if (new Date(showtime.startTime) < new Date()) {
      throw new AppError('This show has already started', 410);
    }

    // Get all confirmed/pending booked seats for this show
    const bookedDocs = await Booking.find(
      { showtime: showtimeId, status: { $in: ['confirmed', 'pending_payment'] } },
      { 'seats.seatId': 1 }
    ).lean();
    const bookedSeatIds = new Set(
      bookedDocs.flatMap((b) => b.seats.map((s) => s.seatId))
    );

    // Get held seats (unexpired)
    const heldDocs = await SeatHold.find({ showtime: showtimeId }).lean();
    const heldMap = {};
    heldDocs.forEach((h) => {
      heldMap[h.seatId] = {
        heldBy: String(h.user),
        expiresAt: h.expiresAt,
        isOwnHold: req.user ? String(h.user) === String(req.user._id) : false,
      };
    });

    // Build seat map
    const seats = (showtime.screen.seats || []).map((seat) => {
      const isBooked = bookedSeatIds.has(seat.seatId);
      const holdInfo = heldMap[seat.seatId];
      const isHeld = !!holdInfo;
      const isOwnHold = holdInfo?.isOwnHold || false;

      // Price for this seat
      const pricing = showtime.pricing.find((p) => p.category === seat.category);
      const pricePaise = pricing?.pricePaise || 0;

      return {
        seatId: seat.seatId,
        row: seat.row,
        number: seat.number,
        category: seat.category,
        pricePaise,
        isActive: seat.isActive,
        status: isBooked ? 'booked' : isHeld && !isOwnHold ? 'held' : isOwnHold ? 'own_hold' : 'available',
        expiresAt: isOwnHold ? holdInfo.expiresAt : undefined,
      };
    });

    res.json({
      success: true,
      data: {
        showtimeId,
        screen: {
          name: showtime.screen.name,
          screenType: showtime.screen.screenType,
          rows: showtime.screen.rows,
          columns: showtime.screen.columns,
        },
        pricing: showtime.pricing,
        seats,
        holdDurationMinutes: HOLD_DURATION_MINUTES,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookings/hold
 * Atomically hold selected seats for 5 minutes.
 */
async function holdSeats(req, res, next) {
  try {
    const { showtimeId, seatIds } = req.body;

    if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
      throw new AppError('showtimeId and seatIds are required', 400);
    }
    if (seatIds.length > MAX_SEATS_PER_BOOKING) {
      throw new AppError(`Cannot select more than ${MAX_SEATS_PER_BOOKING} seats`, 400);
    }

    const showtime = await Showtime.findById(showtimeId)
      .populate('screen', 'seats')
      .lean();

    if (!showtime) throw new AppError('Showtime not found', 404);
    if (!showtime.isActive) throw new AppError('This showtime is inactive', 410);
    if (new Date(showtime.startTime) < new Date()) {
      throw new AppError('This show has already started', 410);
    }

    // Validate seat IDs against screen layout
    const screenSeats = showtime.screen.seats;
    const validSeatMap = {};
    screenSeats.forEach((s) => { validSeatMap[s.seatId] = s; });

    const invalidSeats = seatIds.filter((id) => !validSeatMap[id]);
    if (invalidSeats.length > 0) {
      throw new AppError(`Invalid seat IDs: ${invalidSeats.join(', ')}`, 400);
    }

    // Check for already booked
    const booked = await Booking.findOne({
      showtime: showtimeId,
      status: { $in: ['confirmed', 'pending_payment'] },
      'seats.seatId': { $in: seatIds },
    });
    if (booked) {
      const conflicts = booked.seats.filter((s) => seatIds.includes(s.seatId)).map((s) => s.seatId);
      throw new AppError(`Seats already booked: ${conflicts.join(', ')}`, 409);
    }

    // Release this user's previous holds for this showtime
    await SeatHold.deleteMany({ showtime: showtimeId, user: req.user._id });

    const holdToken = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

    // Atomically insert holds using ordered: false to capture partial conflicts
    const holdDocs = seatIds.map((seatId) => ({
      showtime: showtimeId,
      seatId,
      seatCategory: validSeatMap[seatId].category,
      user: req.user._id,
      holdToken,
      expiresAt,
    }));

    try {
      await SeatHold.insertMany(holdDocs, { ordered: true });
    } catch (dupErr) {
      if (dupErr.code === 11000) {
        // Find which seats are held by others
        const held = await SeatHold.find({
          showtime: showtimeId,
          seatId: { $in: seatIds },
          user: { $ne: req.user._id },
        }).lean();
        const heldIds = held.map((h) => h.seatId);
        throw new AppError(
          `Seats are held by another user: ${heldIds.join(', ')}. Please choose different seats.`,
          409
        );
      }
      throw dupErr;
    }

    // Calculate price summary
    const selectedSeats = seatIds.map((sid) => {
      const seat = validSeatMap[sid];
      const pricing = showtime.pricing.find((p) => p.category === seat.category);
      return {
        seatId: sid,
        row: seat.row,
        number: seat.number,
        category: seat.category,
        pricePaise: pricing?.pricePaise || 0,
      };
    });

    const subtotalPaise = selectedSeats.reduce((sum, s) => sum + s.pricePaise, 0);
    const convenienceFeePaise = calculateConvenienceFee(subtotalPaise);
    const totalAmountPaise = subtotalPaise + convenienceFeePaise;

    res.status(201).json({
      success: true,
      message: 'Seats held successfully',
      data: {
        holdToken,
        expiresAt,
        showtimeId,
        selectedSeats,
        subtotalPaise,
        convenienceFeePaise,
        totalAmountPaise,
        holdDurationMinutes: HOLD_DURATION_MINUTES,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookings/confirm
 * Confirms booking after mock payment.
 * Server calculates total; never trusts client price.
 */
async function confirmBooking(req, res, next) {
  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    const { showtimeId, seatIds, holdToken, paymentMethod, idempotencyKey } = req.body;

    if (!showtimeId || !seatIds || !holdToken) {
      throw new AppError('showtimeId, seatIds, and holdToken are required', 400);
    }

    // Idempotency check
    if (idempotencyKey) {
      const existing = await Booking.findOne({ idempotencyKey }).lean();
      if (existing) {
        return res.json({
          success: true,
          message: 'Booking already confirmed (idempotent)',
          data: existing,
        });
      }
    }

    // Verify holds
    const holds = await SeatHold.find({
      showtime: showtimeId,
      seatId: { $in: seatIds },
      user: req.user._id,
      holdToken,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (holds.length !== seatIds.length) {
      throw new AppError('Seat hold expired or invalid. Please reselect seats.', 410);
    }

    // Fetch showtime with screen and pricing
    const showtime = await Showtime.findById(showtimeId)
      .populate('screen', 'seats')
      .populate('movie', 'title')
      .populate('theatre', 'name')
      .lean();

    if (!showtime || !showtime.isActive) {
      throw new AppError('Showtime not found or inactive', 404);
    }

    // Server-side price calculation
    const screenSeatMap = {};
    showtime.screen.seats.forEach((s) => { screenSeatMap[s.seatId] = s; });

    const bookedSeats = seatIds.map((sid) => {
      const seat = screenSeatMap[sid];
      if (!seat) throw new AppError(`Invalid seat: ${sid}`, 400);
      const pricing = showtime.pricing.find((p) => p.category === seat.category);
      return {
        seatId: sid,
        row: seat.row,
        number: seat.number,
        category: seat.category,
        pricePaise: pricing?.pricePaise || 0,
      };
    });

    const subtotalPaise = bookedSeats.reduce((s, b) => s + b.pricePaise, 0);
    const convenienceFeePaise = calculateConvenienceFee(subtotalPaise);
    const totalAmountPaise = subtotalPaise + convenienceFeePaise;

    // Attempt transaction (works with replica set; falls back gracefully)
    try {
      session.startTransaction();
      transactionStarted = true;
    } catch (_) {
      // Standalone MongoDB - proceed without transaction
      transactionStarted = false;
    }

    const opts = transactionStarted ? { session } : {};

    // Create booking
    const bookingRef = generateBookingRef();
    const paymentId = generatePaymentId();

    const [booking] = await Booking.create(
      [
        {
          bookingRef,
          user: req.user._id,
          showtime: showtimeId,
          movie: showtime.movie._id,
          theatre: showtime.theatre._id,
          screen: showtime.screen._id || showtime.screen,
          seats: bookedSeats,
          subtotalPaise,
          convenienceFeePaise,
          totalAmountPaise,
          status: 'confirmed',
          paymentMethod: paymentMethod || 'mock_payment',
          paymentId,
          paymentConfirmedAt: new Date(),
          holdToken,
          idempotencyKey: idempotencyKey || undefined,
        },
      ],
      opts
    );

    // Increment booked count on showtime
    await Showtime.findByIdAndUpdate(
      showtimeId,
      { $inc: { bookedSeatsCount: seatIds.length } },
      opts
    );

    // Delete holds
    await SeatHold.deleteMany({ showtime: showtimeId, holdToken }, opts);

    if (transactionStarted) {
      await session.commitTransaction();
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title posterUrl certification')
      .populate('theatre', 'name address')
      .populate('screen', 'name screenType')
      .populate('showtime', 'startTime endTime language format')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Booking confirmed',
      data: populatedBooking,
    });
  } catch (err) {
    if (transactionStarted) {
      try { await session.abortTransaction(); } catch (_) {}
    }
    next(err);
  } finally {
    session.endSession();
  }
}

/**
 * GET /api/bookings/my
 * Current user's bookings.
 */
async function getMyBookings(req, res, next) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query, 10);
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('movie', 'title posterUrl certification genres')
        .populate('theatre', 'name address')
        .populate('screen', 'name screenType')
        .populate('showtime', 'startTime endTime language format')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      ...paginate({ data: bookings, total, page, limit }),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/:id
 */
async function getBooking(req, res, next) {
  try {
    const query = { _id: req.params.id };
    // Non-admins can only see their own bookings
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const booking = await Booking.findOne(query)
      .populate('movie', 'title posterUrl backdropUrl certification genres runtime')
      .populate('theatre', 'name address')
      .populate('screen', 'name screenType')
      .populate('showtime', 'startTime endTime language format pricing')
      .populate('user', 'name email phone')
      .lean();

    if (!booking) throw new AppError('Booking not found', 404);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookings/:id/cancel
 */
async function cancelBooking(req, res, next) {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.user = req.user._id;

    const booking = await Booking.findOne(query);
    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.status !== 'confirmed') {
      throw new AppError(`Cannot cancel a booking with status: ${booking.status}`, 400);
    }

    // Cancellation policy: must be at least 2 hours before showtime
    const showtime = await Showtime.findById(booking.showtime);
    const now = new Date();
    const cutoff = new Date(showtime.startTime.getTime() - 2 * 60 * 60 * 1000);

    if (req.user.role !== 'admin' && now > cutoff) {
      throw new AppError(
        'Cancellation window has passed. Cancellations must be made at least 2 hours before showtime.',
        400
      );
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    // Release seats
    await Showtime.findByIdAndUpdate(booking.showtime, {
      $inc: { bookedSeatsCount: -booking.seats.length },
    });

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/bookings
 */
async function adminListBookings(req, res, next) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query, 20);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.movie) filter.movie = req.query.movie;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email')
        .populate('movie', 'title')
        .populate('theatre', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      ...paginate({ data: bookings, total, page, limit }),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSeatAvailability,
  holdSeats,
  confirmBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  adminListBookings,
};
