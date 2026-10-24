'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

async function update() {
  await mongoose.connect(process.env.MONGODB_URI);
  const coll = mongoose.connection.collection('movies');

  const r1 = await coll.updateOne(
    { title: 'Pushpa: The Rule' },
    { $set: { posterUrl: 'https://image.tmdb.org/t/p/w500/1T21FblunT0y8fz7YaW8JMYgUKm.jpg' } }
  );
  const r2 = await coll.updateOne(
    { title: 'Kalki 2898-AD' },
    { $set: { posterUrl: 'https://image.tmdb.org/t/p/w500/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg' } }
  );
  const r3 = await coll.updateOne(
    { title: 'Stree 2' },
    { $set: { posterUrl: 'https://image.tmdb.org/t/p/w500/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg' } }
  );

  console.log(`Updated Pushpa: ${r1.modifiedCount}, Kalki: ${r2.modifiedCount}, Stree 2: ${r3.modifiedCount}`);
  await mongoose.connection.close();
}

update().catch(console.error);
