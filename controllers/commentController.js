const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

// Maybe this won't be necessary
exports.getComments = (req, res, next) => {
  res.send('Implement all comments GET');
};

exports.newComment = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement new comment');
  },
];

exports.getComment = (req, res, next) => {
  res.send('Implement comment GET');
};

exports.updateComment = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement comment update to author only');
  },
];

exports.deleteComment = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement comment delete to author only');
  },
];
