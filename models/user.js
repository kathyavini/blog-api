const mongoose = require('mongoose');
const slug = require('slug');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  displayName: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  author: { type: Boolean, required: true },
  admin: { type: Boolean, required: true },
  authorTagline: String,
});

UserSchema.virtual('url').get(function () {
  if (this.author === true) {
    return `/authors/${slug(this.displayName)}`;
  } else {
    return null;
  }
});

module.exports = mongoose.model('User', UserSchema);
