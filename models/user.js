const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  displayName: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  editor: { type: Boolean, required: true },
  admin: { type: Boolean, required: true },
});

module.exports = mongoose.model('User', UserSchema);
