const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');

router //
  .route('/')
  .get(controller.getPosts)
  .post(controller.newPost); // By admin for debugging; later this will only exist on author route

router
  .route('/:postId')
  .get(controller.getPost)
  // Note that post update can only be done under the author route (by post author).
  .delete(controller.deletePost); // By admin

module.exports = router;
