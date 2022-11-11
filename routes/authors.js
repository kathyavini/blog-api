const express = require('express');
const router = express.Router();
const controller = require('../controllers/authorController');

router //
  .route('/')
  .get(controller.getAllAuthors);

router //
  .route('/:authorId')
  .get(controller.getAuthorArticles)
  .post(controller.authorNewPost);

router //
  .route('/:authorId/:postId')
  .get(controller.getAuthorPost)
  .put(controller.updateAuthorPost)
  .delete(controller.deleteAuthorPost);

module.exports = router;
