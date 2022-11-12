const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const slug = require('slug');

const { checkIsAuthor, checkIsAdmin } = require('../middleware/checkRoles');

exports.getPosts = (req, res) => {
  Post.find(
    { published: true },
    'title slug url body published published_at created_at author url'
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

exports.getUnpublishedPosts = [
  passport.authenticate('jwt', { session: false }),
  checkIsAdmin,
  (req, res) => {
    Post.find(
      { published: false },
      'title slug url body published published_at created_at author url'
    )
      .sort({ published_at: -1, created_at: -1 })
      .populate('author', 'displayName url')
      .exec((err, allPosts) => {
        if (err) {
          return next(err);
        }
        res.status(200).json(allPosts);
      });
  },
];

exports.getAllPosts = [
  passport.authenticate('jwt', { session: false }),
  checkIsAdmin,
  (req, res) => {
    Post.find(
      {},
      'title slug url body published published_at created_at author url'
    )
      .sort({ published_at: -1, created_at: -1 })
      .populate('author', 'displayName url')
      .exec((err, allPosts) => {
        if (err) {
          return next(err);
        }
        res.status(200).json(allPosts);
      });
  },
];

exports.newPost = [
  passport.authenticate('jwt', { session: false }),
  checkIsAuthor,
  body('title', 'Post title required') //
    .trim()
    .isLength({ min: 1 })
    .escape(),
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
          res.status(201).json(post);
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

exports.updatePost = [
  passport.authenticate('jwt', { session: false }),
  checkIsAuthor,
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

    Post.findOne({ slug: req.params.postId })
      .populate('author published')
      .exec((err, post) => {
        if (err) {
          return next(err);
        }

        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author.id !== req.user.sub) {
          return res
            .status(403)
            .json({ error: 'You can only update your own posts' });
        }

        // Apply updates
        post.body = req.body.body;
        post.updated_at = new Date();

        post.save((err, updatedPost) => {
          if (err) {
            return next(err);
          }
          return res.status(200).json(updatedPost);
        });
      });
  },
];

exports.publishPost = [
  passport.authenticate('jwt', { session: false }),
  checkIsAuthor,
  (req, res, next) => {
    // Logged in user must match post author to update
    Post.findOne({ slug: req.params.postId })
      .populate('author published')
      .exec((err, post) => {
        if (err) {
          return next(err);
        }

        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author.id !== req.user.sub) {
          return res
            .status(403)
            .json({ error: 'You can only publish your own posts' });
        }

        if (post.published) {
          return res.status(400).json({ error: 'Post already published' });
        }

        // Apply updates
        post.published = true;

        post.save((err, updatedPost) => {
          if (err) {
            return next(err);
          }
          return res.status(200).json(updatedPost);
        });
      });
  },
];

exports.unpublishPost = [
  passport.authenticate('jwt', { session: false }),
  checkIsAuthor,
  (req, res, next) => {
    // Logged in user must match comment author to update
    Post.findOne({ slug: req.params.postId })
      .populate('author published')
      .exec((err, post) => {
        if (err) {
          return next(err);
        }

        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author.id !== req.user.sub) {
          return res
            .status(403)
            .json({ error: 'You can only unpublish your own posts' });
        }

        if (!post.published) {
          return res.status(400).json({ error: 'Post is already unpublished' });
        }

        // Apply updates
        post.published = false;

        post.save((err, updatedPost) => {
          if (err) {
            return next(err);
          }
          return res.status(200).json(updatedPost);
        });
      });
  },
];

exports.deletePost = [
  passport.authenticate('jwt', { session: false }),
  checkIsAuthor,
  (req, res, next) => {
    Post.findOne({ slug: req.params.postId })
      .populate('author')
      .exec((err, post) => {
        if (err) {
          return next(err);
        }

        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author.id !== req.user.sub) {
          return res
            .status(403)
            .json({ error: 'You can only delete your own posts' });
        }

        // Delete associated comment items
        Comment.deleteMany({ parentUrl: post.slug }, (err, refResult) => {
          if (err) {
            return next(err);
          }

          // Delete the post itself
          Post.deleteOne({ slug: req.params.postId }, (err, mainResult) => {
            if (err) {
              return next(err);
            }

            return res.status(200).json({
              referencingCommentDeletion: refResult,
              postDeletion: mainResult,
            });
          });
        });
      });
  },
];
