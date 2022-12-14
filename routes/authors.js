const express = require('express');
const router = express.Router();
const controller = require('../controllers/authorController');

router //
  .route('/')
  .get(controller.getAllAuthors);

router //
  .route('/:authorId')
  .get(controller.getAuthorArticles);

module.exports = router;
