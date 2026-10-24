'use strict';

const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');
const { AppError } = require('../middleware/errorHandler');
const { getPaginationParams, paginate } = require('../utils/helpers');

// ─── THEATRE ────────────────────────────────────────────────────────────────

async function listTheatres(req, res, next) {
  try {
    const theatres = await Theatre.find({ isActive: true }).lean().sort({ name: 1 });
    res.json({ success: true, data: theatres });
  } catch (err) {
    next(err);
  }
}

async function getTheatre(req, res, next) {
  try {
    const theatre = await Theatre.findById(req.params.id).lean();
    if (!theatre) throw new AppError('Theatre not found', 404);
    const screens = await Screen.find({ theatre: theatre._id, isActive: true }).lean();
    res.json({ success: true, data: { ...theatre, screens } });
  } catch (err) {
    next(err);
  }
}

async function createTheatre(req, res, next) {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({ success: true, message: 'Theatre created', data: theatre });
  } catch (err) {
    next(err);
  }
}

async function updateTheatre(req, res, next) {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!theatre) throw new AppError('Theatre not found', 404);
    res.json({ success: true, message: 'Theatre updated', data: theatre });
  } catch (err) {
    next(err);
  }
}

async function deleteTheatre(req, res, next) {
  try {
    await Theatre.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Theatre deactivated' });
  } catch (err) {
    next(err);
  }
}

// ─── SCREEN ─────────────────────────────────────────────────────────────────

async function listScreens(req, res, next) {
  try {
    const filter = { isActive: true };
    if (req.query.theatre) filter.theatre = req.query.theatre;
    const screens = await Screen.find(filter).populate('theatre', 'name address').lean();
    res.json({ success: true, data: screens });
  } catch (err) {
    next(err);
  }
}

async function getScreen(req, res, next) {
  try {
    const screen = await Screen.findById(req.params.id)
      .populate('theatre', 'name address')
      .lean();
    if (!screen) throw new AppError('Screen not found', 404);
    res.json({ success: true, data: screen });
  } catch (err) {
    next(err);
  }
}

async function createScreen(req, res, next) {
  try {
    const { theatre, name, screenType, rows, columns, seatConfig } = req.body;
    // seatConfig: array of { row, columns: [{ category }] }
    // Auto-generate seat layout
    const seats = [];
    const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let r = 0; r < rows; r++) {
      const rowLabel = rowLabels[r] || `R${r + 1}`;
      for (let c = 1; c <= columns; c++) {
        const seatId = `${rowLabel}${c}`;
        // Determine category from config or default
        let category = 'regular';
        if (seatConfig) {
          const rowCfg = seatConfig.find((rc) => rc.row === rowLabel);
          if (rowCfg && rowCfg.category) category = rowCfg.category;
          else if (rowCfg && rowCfg.columns) {
            const colCfg = rowCfg.columns[c - 1];
            if (colCfg) category = colCfg;
          }
        }
        seats.push({ row: rowLabel, number: c, seatId, category });
      }
    }

    const screen = await Screen.create({
      theatre,
      name,
      screenType: screenType || '2D',
      totalSeats: rows * columns,
      rows,
      columns,
      seats,
    });

    res.status(201).json({ success: true, message: 'Screen created', data: screen });
  } catch (err) {
    next(err);
  }
}

async function updateScreen(req, res, next) {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!screen) throw new AppError('Screen not found', 404);
    res.json({ success: true, message: 'Screen updated', data: screen });
  } catch (err) {
    next(err);
  }
}

async function deleteScreen(req, res, next) {
  try {
    await Screen.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Screen deactivated' });
  } catch (err) {
    next(err);
  }
}

// ─── SHOWTIME ────────────────────────────────────────────────────────────────

async function listShowtimes(req, res, next) {
  try {
    const { movieId, theatreId, date } = req.query;
    const filter = { isActive: true };

    if (movieId) filter.movie = movieId;
    if (theatreId) filter.theatre = theatreId;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Default: only future or today's shows
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      filter.startTime = { $gte: startOfToday };
    }

    const showtimes = await Showtime.find(filter)
      .populate('movie', 'title posterUrl runtime certification')
      .populate('theatre', 'name address')
      .populate('screen', 'name screenType')
      .sort({ startTime: 1 })
      .lean();

    res.json({ success: true, data: showtimes });
  } catch (err) {
    next(err);
  }
}

async function getShowtime(req, res, next) {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title posterUrl backdropUrl runtime certification overview rating genres')
      .populate('theatre', 'name address city amenities')
      .populate('screen', 'name screenType rows columns seats')
      .lean();
    if (!showtime) throw new AppError('Showtime not found', 404);
    res.json({ success: true, data: showtime });
  } catch (err) {
    next(err);
  }
}

async function createShowtime(req, res, next) {
  try {
    const { movie, screen, theatre, startTime, pricing, language, format } = req.body;

    // Validate screen belongs to theatre
    const screenDoc = await Screen.findById(screen);
    if (!screenDoc) throw new AppError('Screen not found', 404);
    if (String(screenDoc.theatre) !== String(theatre)) {
      throw new AppError('Screen does not belong to this theatre', 400);
    }

    const start = new Date(startTime);
    const movie_ = await require('../models/Movie').findById(movie);
    if (!movie_) throw new AppError('Movie not found', 404);

    const runtimeMs = (movie_.runtime || 120) * 60 * 1000;
    const endTime = new Date(start.getTime() + runtimeMs + 15 * 60 * 1000); // +15 min buffer

    const showtime = await Showtime.create({
      movie,
      screen,
      theatre,
      startTime: start,
      endTime,
      pricing,
      language,
      format: format || screenDoc.screenType,
      totalSeats: screenDoc.totalSeats,
    });

    res.status(201).json({ success: true, message: 'Showtime created', data: showtime });
  } catch (err) {
    next(err);
  }
}

async function updateShowtime(req, res, next) {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!showtime) throw new AppError('Showtime not found', 404);
    res.json({ success: true, message: 'Showtime updated', data: showtime });
  } catch (err) {
    next(err);
  }
}

async function deleteShowtime(req, res, next) {
  try {
    await Showtime.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Showtime deactivated' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTheatres, getTheatre, createTheatre, updateTheatre, deleteTheatre,
  listScreens, getScreen, createScreen, updateScreen, deleteScreen,
  listShowtimes, getShowtime, createShowtime, updateShowtime, deleteShowtime,
};
