const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.getPosts = (req, res, next) => {
  res.send('Implement full post list');
};

exports.newPost = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement new post to registered authors');
  },
];

exports.getPost = (req, res, next) => {
  res.send('Implement post GET');
};

exports.updatePost = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement post update to author only');
  },
];

exports.deletePost = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement post delete to author only');
  },
];
