// For clearing the database in e2e tests. See https://fullstackopen.com/en/part5/end_to_end_testing#controlling-the-state-of-the-database

const express = require('express');
const testingRouter = express.Router();

const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');

let authorObjId;

testingRouter.post('/reset', async (request, response) => {
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await User.deleteMany({});

  response.status(204).end(); // 204 = success, no content
});

testingRouter.post('/newadminauthor', async (request, response) => {
  const adminAuthor = new User({
    displayName: 'Test Admin-Author',
    username: 'testadminauthor',
    password: 'testadminauthor',
    author: true,
    admin: true,
    slug: 'test-admin-author',
  });

  const result = await adminAuthor.save();
  console.log(result);

  authorObjId = result._id;

  response.status(204).end();
});

testingRouter.post('/newPost', async (request, response) => {
  const newPost = new Post({
    created_at: new Date(),
    published: true,
    published_at: new Date(),
    title: 'Test Post',
    slug: 'test-post',
    body: 'Test post content',
    author: authorObjId,
  });

  const result = await newPost.save();
  console.log(result);

  response.status(204).end();
});

module.exports = testingRouter;
