'use strict';
/**
 * refresh-showtimes.js
 * Moves all showtime dates forward so they are in the future.
 * Run this whenever showtimes go stale (more than 7 days after seed).
 *
 * Usage:  node scripts/refresh-showtimes.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Showtime = require('../src/models/Showtime');
const SeatHold = require('../src/models/SeatHold');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinebook';

// Show slots: 5 per day across 7 days
const SHOW_HOURS = [10, 13, 16, 19, 22];

function buildFutureSlots(days = 7) {
  const slots = [];
  const now = new Date();
  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d + 1); // start from tomorrow
    SHOW_HOURS.forEach((hour) => {
      const t = new Date(date);
      t.setHours(hour, 0, 0, 0);
      slots.push(t);
    });
  }
  return slots;
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear expired seat holds
    const holdResult = await SeatHold.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`🧹 Cleared ${holdResult.deletedCount} expired seat holds`);

    // Get all showtimes sorted by screen + original slot order
    const showtimes = await Showtime.find({}).sort({ screen: 1, startTime: 1 }).lean();
    console.log(`📅 Found ${showtimes.length} showtimes to refresh`);

    if (showtimes.length === 0) {
      console.log('⚠️  No showtimes found — run seed.js first');
      process.exit(0);
    }

    // Group by screen
    const byScreen = {};
    showtimes.forEach((st) => {
      const key = String(st.screen);
      if (!byScreen[key]) byScreen[key] = [];
      byScreen[key].push(st);
    });

    const futureSlots = buildFutureSlots(7);
    let updated = 0;

    for (const screenId of Object.keys(byScreen)) {
      const screenShowtimes = byScreen[screenId];
      for (let i = 0; i < screenShowtimes.length; i++) {
        const st = screenShowtimes[i];
        const slot = futureSlots[i % futureSlots.length];
        if (!slot) continue;

        const runtimeMs = 120 * 60 * 1000; // default 2h if not set
        const endTime = new Date(slot.getTime() + runtimeMs + 15 * 60 * 1000);

        await Showtime.findByIdAndUpdate(st._id, {
          startTime: slot,
          endTime,
          isActive: true,
          bookedSeatsCount: 0,
        });
        updated++;
      }
    }

    console.log(`✅ Updated ${updated} showtimes to future dates (starting tomorrow)`);
    console.log('🎬 First slot:', futureSlots[0].toLocaleString('en-IN'));
    console.log('🎬 Last slot:', futureSlots[futureSlots.length - 1].toLocaleString('en-IN'));
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

run();
