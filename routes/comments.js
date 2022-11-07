const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');

router //
  .route('/')
  .get(controller.getComments) // might not be necessary
  .post(controller.newComment);

router
  .route('/:commentId')
  .get(controller.getComment)
  .put(controller.updateComment)
  .delete(controller.deleteComment);

module.exports = router;
