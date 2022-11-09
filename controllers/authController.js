const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const secret = `${process.env.JWT_SECRET}`; // jwt.sign() throws an an error if it's not provided in a template literal, despite already being a string?

exports.loginUser = (req, res, next) => {
  let { username, password } = req.body;

  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username' });
    }

    bcrypt.compare(password, user.password, (err, results) => {
      if (results) {
        const token = jwt.sign(
          {
            sub: user._id,
            admin: user.admin,
            author: user.author,
          },
          secret,
          { expiresIn: '1h' }
        );
        return res.status(200).json({
          message: 'Authentication Successful',
          token,
        });
      } else {
        // passwords do not match!
        return res.status(401).json({ message: 'Incorrect password' });
      }
    });
  });
};

exports.testProtectedRoute = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res
      .status(200)
      .json({ message: 'You have made it to the protected route' });
  },
];
