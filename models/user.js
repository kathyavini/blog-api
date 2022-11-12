const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  displayName: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  author: { type: Boolean, required: true },
  admin: { type: Boolean, required: true },
  slug: { type: String, required: true },
});

module.exports = mongoose.model('User', UserSchema);
