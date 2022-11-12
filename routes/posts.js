const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');

router //
  .route('/posts')
  .get(controller.getPosts)
  .post(controller.newPost);

router //
  .route('/posts/unpublished')
  .get(controller.getUnpublishedPosts);

router //
  .route('/posts/all')
  .get(controller.getAllPosts);

router
  .route('/:postId')
  .get(controller.getPost)
  .put(controller.updatePost)
  .delete(controller.deletePost); // By admin or post author

router //
  .route('/:postId/publish')
  .put(controller.publishPost); // by post author

router //
  .route('/:postId/unpublish')
  .put(controller.unpublishPost); // by post author

module.exports = router;
