'use strict';

const User = require('../models/User');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { AppError } = require('../middleware/errorHandler');
const { getPaginationParams, paginate } = require('../utils/helpers');

/**
 * GET /api/admin/dashboard
 */
async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalMovies,
      totalBookings,
      confirmedBookings,
      recentBookings,
      revenueAgg,
      popularMovies,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer', isActive: true }),
      Movie.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.find({ createdAt: { $gte: thirtyDaysAgo } })
        .populate('user', 'name email')
        .populate('movie', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Booking.aggregate([
        { $match: { status: 'confirmed', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, totalRevenuePaise: { $sum: '$totalAmountPaise' } } },
      ]),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: '$movie', count: { $sum: 1 }, revenue: { $sum: '$totalAmountPaise' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
        { $unwind: '$movie' },
        { $project: { 'movie.title': 1, 'movie.posterUrl': 1, count: 1, revenue: 1 } },
      ]),
    ]);

    const revenueThisMonth = revenueAgg[0]?.totalRevenuePaise || 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalMovies,
          totalBookings,
          confirmedBookings,
          revenueThisMonthPaise: revenueThisMonth,
        },
        recentBookings,
        popularMovies,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 */
async function listUsers(req, res, next) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query, 20);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, ...paginate({ data: users, total, page, limit }) });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/users/:id/status
 */
async function updateUserStatus(req, res, next) {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') throw new AppError('isActive (boolean) required', 400);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, listUsers, updateUserStatus };
