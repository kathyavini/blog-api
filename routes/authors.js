const express = require('express');
const router = express.Router();
const controller = require('../controllers/authorController');

router //
  .route('/')
  .get(controller.getAuthors)
  .post(controller.newAuthor);

router
  .route('/:articleId')
  .get(controller.getAuthor)
  .put(controller.updateAuthor)
  .delete(controller.deleteAuthor);

module.exports = router;
