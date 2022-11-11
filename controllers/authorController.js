const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const slug = require('slug');

const { checkAuthor, checkAdmin } = require('../middleware/checkRoles');

exports.getAllAuthors = (req, res, next) => {
  res.send('Implement full author list');
};

exports.getAuthorArticles = (req, res, next) => {
  res.send('Implement author GET (return all articles)');
};

exports.authorNewPost = (req, res, next) => {
  res.send('Implement POST new post by this author');
};

exports.getAuthorPost = (req, res, next) => {
  res.send('Implement post GET by post author');
};

exports.updateAuthorPost = (req, res, next) => {
  res.send('Implement post PUT (update) by post author');
};

exports.deleteAuthorPost = (req, res, next) => {
  res.send('Implement post DELETE by post author');
};
