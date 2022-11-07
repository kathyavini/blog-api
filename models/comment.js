const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  published_at: Date,
  updated_at: Date,
  body: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
});

CommentSchema.virtual('url').get(function () {
  return `/comments/${this._id}`;
});

module.exports = mongoose.model('Comment', CommentSchema);
