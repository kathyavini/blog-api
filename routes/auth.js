const express = require('express');
const router = express.Router();
const passport = require('passport');

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/fail',
    failureMessage: true,
  })
);

router.get('/fail', (req, res) => {
  console.log(req.session);
  res.status(400).json(req.session.messages);
});

router.get('/success', (req, res) => {
  console.log(req.session);
  res.status(200).json(req.user);
});

router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    console.log(req.session);
    res.status(200).send('Logout successful');
  });
});

module.exports = router;
