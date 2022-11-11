const Comment = require('../models/comment');
const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.getComments = (req, res, next) => {
  Comment.find(
    { parentUrl: req.params.postId, commentReply: false },
    'body author parent_post child_comments'
  )
    .sort({ published_at: 1 })
    .populate('author', 'displayName')
    .populate('childComments', 'body author parent_post')
    .exec((err, allPostComments) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(allPostComments);
    });
};

exports.newComment = [
  passport.authenticate('jwt', { session: false }),
  body('body', 'Comment text required') //
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((x) => x.msg) });
    }

    // Create and save comment
    const comment = new Comment({
      body: req.body.body,
      published_at: new Date(),
      author: req.user.sub,
      parentUrl: req.params.postId,
      commentReply: false,
    });

    comment.save((err) => {
      if (err) {
        return next(err);
      }
      res.status(201).json(comment);
    });
  },
];

exports.getComment = (req, res, next) => {
  res.send('Implement comment GET');
};

exports.newCommentReply = [
  passport.authenticate('jwt', { session: false }),
  body('body', 'Comment text required') //
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((x) => x.msg) });
    }
    // Make sure that the parent comment is not already itself a reply to a comment (i.e. allow one level of comment nesting only)
    Comment.findOne({ _id: req.params.commentId }, (err, parentComment) => {
      if (err) {
        return next(err);
      }

      if (!parentComment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (parentComment.commentReply) {
        return res
          .status(400)
          .json({ error: 'Please reply to the parent comment' });
      }

      // Create and save comment
      const comment = new Comment({
        body: req.body.body,
        published_at: new Date(),
        author: req.user.sub,
        parentUrl: req.params.postId,
        commentReply: true,
      });

      comment.save((err, newComment) => {
        if (err) {
          return next(err);
        }

        // Update the parent comment to indicate it now has replies
        Comment.findOneAndUpdate(
          { _id: req.params.commentId },
          { $push: { childComments: newComment._id } },
          (err, updatedOldComment) => {
            if (err) {
              return next(err);
            }

            console.log('final updated comment is', updatedOldComment);

            res.status(201).json(newComment);
          }
        );
      });
    });
  },
];

exports.updateComment = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement comment update to author only');
  },
];

exports.deleteComment = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement comment delete to author only');
  },
];
