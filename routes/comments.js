const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');

router //
  .route('/:postId/comments')
  .get(controller.getComments) // might not be necessary
  .post(controller.newComment);

router
  .route('/:postId/comments/:commentId')
  .post(controller.newCommentReply)
  .get(controller.getComment)
  .put(controller.updateComment)
  .delete(controller.deleteComment);

module.exports = router;
