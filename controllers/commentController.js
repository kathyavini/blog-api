const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.getComments = (req, res, next) => {
  Comment.find({ parentUrl: req.params.postId, commentReply: false })
    .sort({ published_at: 1 })
    .populate('author', 'displayName')
    .populate({
      path: 'childComments',
      select: 'body published_at updated_at',
      populate: { path: 'author', select: 'displayName' },
    })
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
    .isLength({ min: 1 }),

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
  Comment.findOne({ _id: req.params.commentId })
    .sort({ published_at: 1 })
    .populate('author', 'displayName')
    .populate('childComments', 'body author parent_post')
    .exec((err, comment) => {
      if (err) {
        return next(err);
      }

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      res.status(200).json(comment);
    });
};

exports.newCommentReply = [
  passport.authenticate('jwt', { session: false }),
  body('body', 'Comment text required') //
    .trim()
    .isLength({ min: 1 }),

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
        parentComment: parentComment._id,
      });

      comment.save((err, newComment) => {
        if (err) {
          return next(err);
        }

        // Update the parent comment to indicate the new reply
        parentComment.childComments.push(newComment._id);

        parentComment.save((err, updatedOldComment) => {
          if (err) {
            return next(err);
          }

          console.log('final updated comment is', updatedOldComment);

          res.status(201).json(newComment);
        });
      });
    });
  },
];

exports.updateComment = [
  passport.authenticate('jwt', { session: false }),
  body('body', 'Comment text required') //
    .trim()
    .isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((x) => x.msg) });
    }

    // Logged in user must match comment author to update
    Comment.findOne({ _id: req.params.commentId })
      .populate('author')
      .exec((err, comment) => {
        if (err) {
          return next(err);
        }

        if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        // Whether this is possible depends on how comment deletion is implemented for comments with replies (if the whole reply chain is removed or the parent comment's text and author are removed only)
        // if (comment.author == null) {
        //   return res.status(404).json({ error: 'Comment has been deleted' });
        // }

        if (comment.author.id !== req.user.sub) {
          return res
            .status(403)
            .json({ error: 'You can only edit your own comments' });
        }

        // Apply updates
        comment.body = req.body.body;
        comment.updated_at = new Date();

        comment.save((err, updatedComment) => {
          if (err) {
            return next(err);
          }
          return res.status(200).json(updatedComment);
        });
      });
  },
];

exports.deleteComment = [
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    // Logged in user must match comment author to delete
    Comment.findOne({ _id: req.params.commentId })
      .populate('author childComments')
      .exec((err, comment) => {
        if (err) {
          return next(err);
        }

        if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        // Whether this is possible depends on how comment deletion is implemented (if the reference is removed or the text removed and author set to null)
        // if (comment.author == null) {
        //   return res.status(404).json({ error: 'Comment has been deleted' });
        // }

        if (comment.author.id !== req.user.sub) {
          return res
            .status(403)
            .json({ error: 'You can only delete your own comments' });
        }

        if (comment.childComments.length > 0) {
          // FIRST IMPLEMENTATION: If there is a reply chain, only change the text to "Comment Deleted" (so replies can continue to be seen)
          // comment.body = 'Comment Deleted';
          // comment.author = null;
          // comment.updated_at = new Date();

          // comment.save((err, updatedComment) => {
          //   if (err) {
          //     return next(err);
          //   }

          //   return res.status(200).json(updatedComment);
          // });

          // SECOND IMPLEMENTATION: Just delete the reply chain as well
          Comment.deleteMany(
            { parentComment: comment.id },
            (err, refResult) => {
              if (err) {
                return next(err);
              }

              Comment.deleteOne(
                { _id: req.params.commentId },
                (err, mainResult) => {
                  if (err) {
                    return next(err);
                  }

                  return res.status(200).json({
                    childCommentDeletion: refResult,
                    commentDeletion: mainResult,
                  });
                }
              );
            }
          );
          return;
        }

        Comment.deleteOne({ _id: req.params.commentId }, (err, mainResult) => {
          if (err) {
            return next(err);
          }

          return res.status(200).json(mainResult);
        });
      });
  },
];
