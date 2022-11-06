const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

exports.listUsers = (req, res, next) => {
  res.send('List of users');
};

exports.newUser = [
  body('displayName', 'Display name required')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('username', 'Username required').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password required').trim().isLength({ min: 1 }).escape(),
  body('passwordConfirm', 'Password confirmation must match password')
    .trim()
    .exists()
    .escape()
    .custom((value, { req }) => value === req.body.password),

  // Save to database
  (req, res, next) => {
    console.log(req.body);
    // Extract the express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request – Client-side input fails validation
      return res.status(400).json({ errors: errors.array().map((x) => x.msg) });
    }

    // Create new user with sanitized data
    const user = new User({
      displayName: req.body.displayName,
      username: req.body.username,
      password: req.body.password,
      editor: false,
      admin: false,
    });

    // Check if username already exists
    User.findOne({ username: req.body.username }).exec((err, found_user) => {
      if (err) {
        return next(err);
      }
      // 400 Bad Request – Client-side input fails validation.
      if (found_user) {
        return res.status(400).json({ errors: 'Username already exists' });
      } else {
        // Encrypt password before saving to database
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
          if (err) {
            return next(err);
          }
          user.password = hashedPassword;

          user.save((err) => {
            if (err) {
              return next(err);
            }
            res.status(201).json(user);
          });
        });
      }
    });
  },
];
