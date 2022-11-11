const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const slug = require('slug');

const { checkAdmin } = require('../middleware/checkRoles');

exports.getPosts = (req, res) => {
  Post.find(
    // {},
    { published: true },
    'title slug url body published_at created_at author url'
  )
    .sort({ published_at: -1, created_at: -1 })
    .populate('author', 'displayName url')
    .exec((err, allPosts) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(allPosts);
    });
};

exports.newPost = [
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  body('title', 'Post title required').trim().isLength({ min: 1 }).escape(),
  body('body', 'Post body text required') //
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Save to database
  (req, res, next) => {
    // Extract the express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request – Client-side input fails validation
      return res.status(400).json({ errors: errors.array().map((x) => x.msg) });
    }

    // Check if title already exists
    Post.findOne({ title: req.body.title }).exec((err, found_post) => {
      if (err) {
        return next(err);
      }
      // 400 Bad Request – Client-side input fails validation.
      if (found_post) {
        return res.status(400).json({
          errors:
            'A blog post with that title already exists. Please pick another.',
        });
      } else {
        // Create and save post
        const post = new Post({
          title: req.body.title,
          body: req.body.body,
          created_at: new Date(),
          slug: slug(req.body.title),
          author: req.user.sub,
          published: false,
        });

        post.save((err) => {
          if (err) {
            return next(err);
          }
          res.status(201).json({ message: 'Successfully created post' });
        });
      }
    });
  },
];

exports.getPost = (req, res, next) => {
  Post.findOne(
    { slug: req.params.postId },
    'title slug url body published_at created_at updated_at author url published'
  )
    .populate('author', 'displayName url')
    .exec((err, post) => {
      if (err) {
        return next(err);
      }

      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }

      if (post.published) {
        res.status(200).json(post);
      } else {
        // Give a hint if the post exists but is unpublished
        res.status(404).json({
          message:
            'Post not found. If you are the post author, make sure that the post has been set to published',
        });
      }
    });
};

exports.deletePost = [
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  (req, res, next) => {
    Post.findOneAndDelete({ slug: req.params.postId }, (err) => {
      if (err) {
        return next(err);
      }

      res.status(200).json({ message: 'Post successfully deleted' });
    });
  },
];
