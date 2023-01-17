const mongoose = require('mongoose');

mongoose.set('toObject', { virtuals: true });
mongoose.set('toJSON', { virtuals: true });

const mongoDb =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGO_URI // for e2e tests
    : process.env.MONGO_URI;

let db;

const connectDb = async () => {
  mongoose.connect(mongoDb, { useNewUrlParser: true });

  db = mongoose.connection;

  db.on('error', console.error.bind(console, 'mongo connection error'));
};

const closeDb = async () => {
  if (db) {
    await mongoose.connection.close();
  }
};

module.exports = { connectDb, closeDb };
