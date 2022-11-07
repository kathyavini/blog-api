const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  published_at: Date,
  updated_at: Date,
  title: { type: String, required: true },
  slug: { type: String, required: true },
  body: { type: String, required: true },
  image: String,
  image_cloud_url: String,
  image_cloud_id: String,
  author: { type: Schema.Types.ObjectId, ref: 'Author' },
});

PostSchema.virtual('url').get(function () {
  return `/${this.slug}`;
});

module.exports = mongoose.model('Post', PostSchema);
