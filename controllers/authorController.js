const Post = require('../models/post');
const User = require('../models/user');

exports.getAllAuthors = (req, res, next) => {
  User.find({ author: true }, (err, listAuthors) => {
    if (err) {
      return next(err);
    }
    return res.status(200).json(listAuthors);
  });
};

exports.getAuthorArticles = (req, res, next) => {
  User.findOne({ slug: req.params.authorId }, (err, author) => {
    if (err) {
      return next(err);
    }

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    Post.find({ author: author._id, published: true }, (err, posts) => {
      if (err) {
        return next(err);
      }

      console.log('post search returned', posts);

      return res.status(200).json(posts);
    });
  });
};
