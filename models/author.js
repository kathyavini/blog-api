const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  tagline: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

AuthorSchema.virtual('url').get(function () {
  return `/authors/${this.slug}`;
});

module.exports = mongoose.model('Author', AuthorSchema);
