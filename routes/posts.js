const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');

router //
  .route('/')
  .get(controller.getPosts)
  .post(controller.newPost);

router
  .route('/:postId')
  .get(controller.getPost)
  .put(controller.updatePost)
  .delete(controller.deletePost);

module.exports = router;
