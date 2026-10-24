'use strict';
/**
 * update-posters.js
 * Fixes broken poster URLs for Pushpa, Stree 2, and Kalki in MongoDB.
 * Run: node scripts/update-posters.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Movie = require('../src/models/Movie');

const POSTER_FIXES = [
  {
    // Pushpa: The Rule – correct TMDB poster
    titlePattern: /pushpa/i,
    posterUrl: 'https://image.tmdb.org/t/p/w500/1T21FblunT0y8fz7YaW8JMYgUKm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/kvBbPJxMFVAaY6S5SsZ4CJAO8hV.jpg',
  },
  {
    // Stree 2 – correct TMDB poster
    titlePattern: /stree/i,
    posterUrl: 'https://image.tmdb.org/t/p/w500/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/b0yHfm85XsQADDUhMqnJKQKGdtf.jpg',
  },
  {
    // Kalki 2898-AD – correct TMDB poster
    titlePattern: /kalki/i,
    posterUrl: 'https://image.tmdb.org/t/p/w500/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/7bRH4Ee8cNRj0kNXqx7eM5FtE52.jpg',
  },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const fix of POSTER_FIXES) {
      const movie = await Movie.findOne({ title: { $regex: fix.titlePattern } });
      if (!movie) {
        console.log(`⚠️  Movie not found matching: ${fix.titlePattern}`);
        continue;
      }
      console.log(`🎬 Updating: ${movie.title}`);
      console.log(`   Old poster: ${movie.posterUrl}`);
      movie.posterUrl = fix.posterUrl;
      movie.backdropUrl = fix.backdropUrl;
      await movie.save();
      console.log(`   New poster: ${movie.posterUrl}`);
    }

    console.log('\n✅ Poster URLs updated successfully');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

run();
