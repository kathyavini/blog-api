const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const { checkAdmin } = require('../middleware/checkRoles');

exports.listUsers = [
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  (req, res, next) => {
    User.find({}, (err, userList) => {
      res.status(200).json(userList);
    });
  },
];

exports.newUser = [
  body('displayName', 'Display name required')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('username', 'Username required') //
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('password', 'Password required') //
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('passwordConfirm', 'Password confirmation must match password')
    .trim()
    .exists()
    .escape()
    .custom((value, { req }) => value === req.body.password),

  // Save to database
  (req, res, next) => {
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
      author: false,
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

exports.updateUserPermissions = [
  passport.authenticate('jwt', {
    session: false,
  }),
  checkAdmin,
  body('user_id', 'User id required') //
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body('admin', 'Permissions format invalid')
    .trim()
    .optional({ checkFalsy: true })
    .exists()
    .isBoolean()
    .escape(),

  body('author', 'Permissions format invalid')
    .trim()
    .optional({ checkFalsy: true })
    .exists()
    .isBoolean()
    .escape(),

  (req, res, next) => {
    // Extract the express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((x) => x.msg) });
    }
    // Neither permissions value has been provided
    if (!req.body.admin && !req.body.author) {
      return res
        .status(400)
        .json({ error: 'No user permissions values provided' });
    }

    let update = {};

    if (req.body.author) {
      update.author = true;
    }
    if (req.body.admin) {
      update.admin = true;
    }

    User.findByIdAndUpdate(req.body.user_id, update, (err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: 'Successfully updated permissions' });
    });
  },
];

exports.getUser = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement user details to authorized user');
  },
];

exports.updateUser = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement user update to authorized user');
  },
];

exports.deleteUser = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send('Implement user delete to authorized user');
  },
];
