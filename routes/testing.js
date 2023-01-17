// For clearing the database in e2e tests. See https://fullstackopen.com/en/part5/end_to_end_testing#controlling-the-state-of-the-database

const express = require('express');
const testingRouter = express.Router();

const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');

testingRouter.post('/reset', async (request, response) => {
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await User.deleteMany({});

  response.status(204).end(); // 204 = success, no content
});

module.exports = testingRouter;
