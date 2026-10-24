'use strict';

/**
 * CineBook Database Seed Script
 * Seeds: admin user, curated movies, theatres, screens, showtimes
 *
 * Usage:
 *   node scripts/seed.js
 *   node scripts/seed.js --reset   (clears existing data first)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Movie = require('../src/models/Movie');
const Theatre = require('../src/models/Theatre');
const Screen = require('../src/models/Screen');
const Showtime = require('../src/models/Showtime');
const Booking = require('../src/models/Booking');
const SeatHold = require('../src/models/SeatHold');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinebook';
const RESET = process.argv.includes('--reset');

// ── Curated Movie Data ────────────────────────────────────────────────────────
// Poster URLs from TMDB (w500 format). Attribution required: https://www.themoviedb.org
const MOVIES = [
  {
    title: 'Oppenheimer',
    tmdbId: 872585,
    overview: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.',
    tagline: 'The world forever changes.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    genres: ['Drama', 'History', 'Thriller'],
    runtime: 180,
    language: 'en',
    releaseDate: new Date('2023-07-21'),
    rating: 8.1,
    voteCount: 18200,
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Cillian Murphy', character: 'J. Robert Oppenheimer' },
      { name: 'Emily Blunt', character: 'Katherine "Kitty" Oppenheimer' },
      { name: 'Matt Damon', character: 'Leslie Groves' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: true,
    dataSource: 'manual',
  },
  {
    title: 'Dune: Part Two',
    tmdbId: 693134,
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    tagline: 'Long live the fighters.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    genres: ['Science Fiction', 'Adventure'],
    runtime: 166,
    language: 'en',
    releaseDate: new Date('2024-03-01'),
    rating: 8.5,
    voteCount: 9800,
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    director: 'Denis Villeneuve',
    cast: [
      { name: 'Timothée Chalamet', character: 'Paul Atreides' },
      { name: 'Zendaya', character: 'Chani' },
      { name: 'Rebecca Ferguson', character: 'Lady Jessica' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: true,
    dataSource: 'manual',
  },
  {
    title: 'Interstellar',
    tmdbId: 157336,
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    genres: ['Adventure', 'Drama', 'Science Fiction'],
    runtime: 169,
    language: 'en',
    releaseDate: new Date('2014-11-07'),
    rating: 8.4,
    voteCount: 34500,
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Matthew McConaughey', character: 'Cooper' },
      { name: 'Anne Hathaway', character: 'Brand' },
      { name: 'Jessica Chastain', character: 'Murph' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: false,
    dataSource: 'manual',
  },
  {
    title: 'The Dark Knight',
    tmdbId: 155,
    overview: 'When a menace known as the Joker wreaks havoc on Gotham City, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    tagline: 'Why so serious?',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsqX7An9LM.jpg',
    genres: ['Drama', 'Action', 'Crime', 'Thriller'],
    runtime: 152,
    language: 'en',
    releaseDate: new Date('2008-07-18'),
    rating: 9.0,
    voteCount: 31000,
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Christian Bale', character: 'Bruce Wayne / Batman' },
      { name: 'Heath Ledger', character: 'Joker' },
      { name: 'Aaron Eckhart', character: 'Harvey Dent' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: false,
    dataSource: 'manual',
  },
  {
    title: 'Avatar: The Way of Water',
    tmdbId: 76600,
    overview: 'Set more than a decade after the events of the first film, the Sully family must flee their home on Pandora.',
    tagline: 'Return to Pandora.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    genres: ['Science Fiction', 'Action', 'Adventure'],
    runtime: 192,
    language: 'en',
    releaseDate: new Date('2022-12-16'),
    rating: 7.6,
    voteCount: 15600,
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    director: 'James Cameron',
    cast: [
      { name: 'Sam Worthington', character: 'Jake Sully' },
      { name: 'Zoe Saldaña', character: 'Neytiri' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: true,
    dataSource: 'manual',
  },
  {
    title: 'Spider-Man: No Way Home',
    tmdbId: 634649,
    overview: 'Peter Parker asks Doctor Strange to help everyone forget he is Spider-Man, but the spell tears a hole in the multiverse.',
    tagline: 'The Multiverse Unleashed.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg',
    genres: ['Action', 'Adventure', 'Science Fiction'],
    runtime: 148,
    language: 'en',
    releaseDate: new Date('2021-12-17'),
    rating: 8.3,
    voteCount: 22100,
    trailerUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    director: 'Jon Watts',
    cast: [
      { name: 'Tom Holland', character: 'Peter Parker / Spider-Man' },
      { name: 'Zendaya', character: 'MJ' },
      { name: 'Benedict Cumberbatch', character: 'Doctor Strange' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: false,
    dataSource: 'manual',
  },
  {
    title: 'Inception',
    tmdbId: 27205,
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
    tagline: 'Your mind is the scene of the crime.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    genres: ['Action', 'Science Fiction', 'Adventure'],
    runtime: 148,
    language: 'en',
    releaseDate: new Date('2010-07-16'),
    rating: 8.4,
    voteCount: 35800,
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Leonardo DiCaprio', character: 'Cobb' },
      { name: 'Joseph Gordon-Levitt', character: 'Arthur' },
      { name: 'Elliot Page', character: 'Ariadne' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: false,
    dataSource: 'manual',
  },
  {
    title: 'Deadpool & Wolverine',
    tmdbId: 533535,
    overview: 'Deadpool is offered a place in the Marvel Cinematic Universe by the Time Variance Authority, but instead recruits a variant of Wolverine.',
    tagline: 'The end of an era.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    genres: ['Action', 'Comedy', 'Science Fiction'],
    runtime: 128,
    language: 'en',
    releaseDate: new Date('2024-07-26'),
    rating: 7.7,
    voteCount: 6200,
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    director: 'Shawn Levy',
    cast: [
      { name: 'Ryan Reynolds', character: 'Wade Wilson / Deadpool' },
      { name: 'Hugh Jackman', character: 'Logan / Wolverine' },
    ],
    status: 'now_showing',
    certification: 'A',
    isFeatured: true,
    dataSource: 'manual',
  },
  {
    title: 'Pushpa: The Rule',
    tmdbId: 1119091,
    overview: 'Pushpa Raj continues his rise to power in the red sandalwood smuggling world, facing new enemies and challenges.',
    tagline: 'Rule begins.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1T21FblunT0y8fz7YaW8JMYgUKm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/kvBbPJxMFVAaY6S5SsZ4CJAO8hV.jpg',
    genres: ['Action', 'Drama', 'Crime'],
    runtime: 190,
    language: 'te',
    releaseDate: new Date('2024-12-05'),
    rating: 7.8,
    voteCount: 1200,
    trailerUrl: 'https://www.youtube.com/watch?v=YCgGnkDzRpQ',
    director: 'Sukumar',
    cast: [
      { name: 'Allu Arjun', character: 'Pushpa Raj' },
      { name: 'Rashmika Mandanna', character: 'Srivalli' },
      { name: 'Fahadh Faasil', character: 'Bhanwar Singh Shekhawat IPS' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: true,
    dataSource: 'manual',
  },
  {
    title: 'Kalki 2898-AD',
    tmdbId: 1153789,
    overview: 'Set in a post-apocalyptic world in 2898 AD, the story follows the avatar of the god Vishnu, Kalki, who is prophesied to defeat a tyrant.',
    tagline: 'The rebirth of the world.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/7bRH4Ee8cNRj0kNXqx7eM5FtE52.jpg',
    genres: ['Action', 'Science Fiction', 'Fantasy'],
    runtime: 181,
    language: 'te',
    releaseDate: new Date('2024-06-27'),
    rating: 7.5,
    voteCount: 2800,
    trailerUrl: 'https://www.youtube.com/watch?v=Of4XxesTG_Y',
    director: 'Nag Ashwin',
    cast: [
      { name: 'Prabhas', character: 'Kalki / Bhairava' },
      { name: 'Deepika Padukone', character: 'Sumathi / SUM-80' },
      { name: 'Amitabh Bachchan', character: 'Ashwatthama' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: false,
    dataSource: 'manual',
  },
  {
    title: 'Stree 2',
    tmdbId: 1084792,
    overview: 'The men of Chanderi must once again face a supernatural threat as Stree returns in a new avatar.',
    tagline: 'Sarkate Ka Aatank.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/b0yHfm85XsQADDUhMqnJKQKGdtf.jpg',
    genres: ['Horror', 'Comedy'],
    runtime: 135,
    language: 'hi',
    releaseDate: new Date('2024-08-15'),
    rating: 8.0,
    voteCount: 3100,
    trailerUrl: 'https://www.youtube.com/watch?v=2nkJSlQ3g9I',
    director: 'Amar Kaushik',
    cast: [
      { name: 'Rajkummar Rao', character: 'Vicky' },
      { name: 'Shraddha Kapoor', character: 'Stree' },
    ],
    status: 'now_showing',
    certification: 'UA',
    isFeatured: false,
    dataSource: 'manual',
  },
  {
    title: 'Alien: Romulus',
    tmdbId: 945961,
    overview: 'A group of young space colonizers face the most terrifying life form in the universe while scavenging an abandoned space station.',
    tagline: 'Do not open.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg',
    genres: ['Horror', 'Science Fiction', 'Thriller'],
    runtime: 119,
    language: 'en',
    releaseDate: new Date('2024-08-16'),
    rating: 7.3,
    voteCount: 4100,
    trailerUrl: 'https://www.youtube.com/watch?v=x1glD8lm_Cc',
    director: 'Fede Álvarez',
    cast: [
      { name: 'Cailee Spaeny', character: 'Rain Carradine' },
      { name: 'David Jonsson', character: 'Andy' },
    ],
    status: 'coming_soon',
    certification: 'A',
    isFeatured: false,
    dataSource: 'manual',
  },
  {
    title: 'The Wild Robot',
    tmdbId: 1184918,
    overview: 'After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island where it must learn to adapt to the harsh environment.',
    tagline: 'Experience nature. Be nature.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/417X5NRCE4ObkQMZZMeGFbPoOxE.jpg',
    genres: ['Animation', 'Science Fiction', 'Family'],
    runtime: 102,
    language: 'en',
    releaseDate: new Date('2024-09-27'),
    rating: 8.4,
    voteCount: 3400,
    trailerUrl: 'https://www.youtube.com/watch?v=01FFoBMRKd4',
    director: 'Chris Sanders',
    cast: [
      { name: 'Lupita Nyong\'o', character: 'Roz (voice)' },
      { name: 'Pedro Pascal', character: 'Fink (voice)' },
    ],
    status: 'coming_soon',
    certification: 'U',
    isFeatured: false,
    dataSource: 'manual',
  },
];

// ── Theatre & Screen Data ─────────────────────────────────────────────────────
const THEATRES = [
  {
    name: 'CineBook Grand — Hyderabad',
    address: { street: 'Banjara Hills Road No. 12', city: 'Hyderabad', state: 'Telangana', pincode: '500034' },
    phone: '+91-40-2345-6789',
    amenities: ['Parking', 'Food Court', 'Recliner Seats', 'Dolby Atmos', 'IMAX'],
  },
  {
    name: 'CineBook PVR — Mumbai',
    address: { street: 'Phoenix Marketcity, LBS Marg', city: 'Mumbai', state: 'Maharashtra', pincode: '400070' },
    phone: '+91-22-6789-0123',
    amenities: ['Parking', 'Food Court', 'Premium Lounge'],
  },
  {
    name: 'CineBook Inox — Bengaluru',
    address: { street: '1 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
    phone: '+91-80-2222-3333',
    amenities: ['Parking', 'Food Court', '4DX'],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateSeats(rows, columns, premiumRows = 3, reclineRows = 2) {
  const seats = [];
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < rows; r++) {
    const rowLabel = rowLabels[r] || `R${r + 1}`;
    let category = 'regular';
    if (r >= rows - reclineRows) category = 'recliner';
    else if (r >= rows - reclineRows - premiumRows) category = 'premium';
    for (let c = 1; c <= columns; c++) {
      seats.push({ row: rowLabel, number: c, seatId: `${rowLabel}${c}`, category, isActive: true });
    }
  }
  return seats;
}

function getShowtimesForDays(days = 7) {
  const times = [];
  const now = new Date();
  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    [10, 13, 16, 19, 22].forEach((hour) => {
      const t = new Date(date);
      t.setHours(hour, 0, 0, 0);
      times.push(t);
    });
  }
  return times;
}

// ── Main Seed ─────────────────────────────────────────────────────────────────
async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('[Seed] Connected.');

  if (RESET) {
    console.log('[Seed] Resetting database...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Screen.deleteMany({}),
      Showtime.deleteMany({}),
      Booking.deleteMany({}),
      SeatHold.deleteMany({}),
    ]);
    console.log('[Seed] Database cleared.');
  }

  // Admin user
  let admin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@cinebook.com' });
  if (!admin) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || 'CineBook Admin',
      email: process.env.ADMIN_EMAIL || 'admin@cinebook.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
    });
    console.log(`[Seed] Admin created: ${admin.email}`);
  } else {
    console.log(`[Seed] Admin already exists: ${admin.email}`);
  }

  // Demo customer
  let customer = await User.findOne({ email: 'demo@cinebook.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Demo Customer',
      email: 'demo@cinebook.com',
      password: 'Demo@123456',
      role: 'customer',
    });
    console.log(`[Seed] Demo customer created: ${customer.email}`);
  }

  // Movies
  console.log('[Seed] Seeding movies...');
  const movieIds = [];
  for (const movieData of MOVIES) {
    const movie = await Movie.findOneAndUpdate(
      { title: movieData.title },
      { $setOnInsert: movieData },
      { upsert: true, new: true }
    );
    movieIds.push(movie._id);
  }
  console.log(`[Seed] ${movieIds.length} movies seeded.`);

  // Theatres and screens
  console.log('[Seed] Seeding theatres and screens...');
  const createdTheatres = [];
  const createdScreens = [];

  for (const theatreData of THEATRES) {
    let theatre = await Theatre.findOne({ name: theatreData.name });
    if (!theatre) {
      theatre = await Theatre.create(theatreData);
    }
    createdTheatres.push(theatre);

    // Create 2 screens per theatre
    for (let i = 1; i <= 2; i++) {
      let screen = await Screen.findOne({ theatre: theatre._id, name: `Screen ${i}` });
      if (!screen) {
        const rows = i === 1 ? 10 : 8;
        const columns = i === 1 ? 15 : 12;
        const seats = generateSeats(rows, columns, 2, 2);
        screen = await Screen.create({
          theatre: theatre._id,
          name: `Screen ${i}`,
          screenType: i === 1 ? 'IMAX' : '2D',
          totalSeats: rows * columns,
          rows,
          columns,
          seats,
        });
      }
      createdScreens.push({ screen, theatre });
    }
  }
  console.log(`[Seed] ${createdTheatres.length} theatres, ${createdScreens.length} screens seeded.`);

  // Showtimes
  console.log('[Seed] Seeding showtimes...');
  let showtimesCreated = 0;
  const nowShowingMovies = await Movie.find({ status: 'now_showing' }).limit(6);
  const showSlots = getShowtimesForDays(7);

  // Assign 2 movies per screen with alternating slots
  for (let si = 0; si < createdScreens.length; si++) {
    const { screen, theatre } = createdScreens[si];
    const moviesForScreen = [
      nowShowingMovies[si % nowShowingMovies.length],
      nowShowingMovies[(si + 1) % nowShowingMovies.length],
    ];

    for (let slotIdx = 0; slotIdx < Math.min(showSlots.length, 14); slotIdx++) {
      const movie = moviesForScreen[slotIdx % 2];
      if (!movie) continue;
      const startTime = showSlots[slotIdx];
      const existing = await Showtime.findOne({ screen: screen._id, startTime });
      if (existing) continue;

      const runtimeMs = (movie.runtime || 120) * 60 * 1000;
      const endTime = new Date(startTime.getTime() + runtimeMs + 15 * 60 * 1000);

      const isIMAX = screen.screenType === 'IMAX';
      await Showtime.create({
        movie: movie._id,
        screen: screen._id,
        theatre: theatre._id,
        startTime,
        endTime,
        language: movie.language === 'te' ? 'Telugu' : movie.language === 'hi' ? 'Hindi' : 'English',
        format: screen.screenType,
        totalSeats: screen.totalSeats,
        pricing: [
          { category: 'regular', pricePaise: isIMAX ? 35000 : 25000 },
          { category: 'premium', pricePaise: isIMAX ? 50000 : 35000 },
          { category: 'recliner', pricePaise: isIMAX ? 75000 : 55000 },
          { category: 'accessible', pricePaise: isIMAX ? 30000 : 20000 },
        ],
      });
      showtimesCreated++;
    }
  }
  console.log(`[Seed] ${showtimesCreated} showtimes seeded.`);

  await mongoose.connection.close();
  console.log('\n[Seed] ✅ Done! CineBook database seeded successfully.');
  console.log('\n Demo credentials:');
  console.log(`  Admin:    ${process.env.ADMIN_EMAIL || 'admin@cinebook.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
  console.log('  Customer: demo@cinebook.com / Demo@123456');
  console.log('\n Pricing:');
  console.log('  Regular: ₹250 | Premium: ₹350 | Recliner: ₹550');
  console.log('  IMAX Regular: ₹350 | IMAX Premium: ₹500 | IMAX Recliner: ₹750');
}

seed().catch((err) => {
  console.error('[Seed] Error:', err.message);
  process.exit(1);
});
