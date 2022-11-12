const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  published_at: { type: Date, required: true },
  updated_at: Date,
  body: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  // parentPost: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  childComments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  parentUrl: { type: String, required: true },
  commentReply: { type: Boolean, required: true },
  parentComment: String,
});

module.exports = mongoose.model('Comment', CommentSchema);
