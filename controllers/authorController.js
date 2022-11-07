const Author = require('../models/author');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.getAuthors = (req, res, next) => {
  res.send('Implement full author list');
};

exports.newAuthor = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement new author only (author sets up their display page)');
  },
];

exports.getAuthor = (req, res, next) => {
  res.send('Implement author GET');
};

exports.updateAuthor = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement author update to author/admin only');
  },
];

exports.deleteAuthor = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement author delete to author/admin only');
  },
];
