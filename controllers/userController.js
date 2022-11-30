const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const slug = require('slug');

const { checkIsAdmin } = require('../middleware/checkRoles');

exports.listUsers = [
  passport.authenticate('jwt', { session: false }),
  checkIsAdmin,
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
      slug: slug(req.body.displayName),
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
  checkIsAdmin,
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
      update.author = req.body.author;
    }
    if (req.body.admin) {
      update.admin = req.body.admin;
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
    console.log('URL request params are', req.params.userId);
    User.findById(req.params.userId, (err, user) => {
      if (err) {
        return next(err);
      }

      console.log('database fetchd user', user);

      if (!user) {
        return res.status(404).json({ error: 'Not found' });
      }

      console.log('Passport auth user', req.user);

      if (!req.user.admin && req.user.sub !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.status(200).json(user);
    });
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
    User.findById(req.params.userId).exec((err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!req.user.admin && req.user.sub !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      User.deleteOne({ _id: req.params.userId }, (err, result) => {
        if (err) {
          return next(err);
        }

        return res.status(200).json(result);
      });
    });
  },
];
