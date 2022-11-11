const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');

router //
  .route('/:postSlug/comments')
  .get(controller.getComments) // might not be necessary
  .post(controller.newComment);

router
  .route('/:postSlug/comments/:commentId')
  .get(controller.getComment)
  .put(controller.updateComment)
  .delete(controller.deleteComment);

module.exports = router;
