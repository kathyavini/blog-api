const mongoose = require('mongoose');

const mongoDb = process.env.MONGO_URI;

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
