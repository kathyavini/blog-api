// App.js configuration to load into tests

const express = require('express');
const passport = require('passport');

require('dotenv').config();

const authRouter = require('../routes/auth');
const usersRouter = require('../routes/users');

const app = express();

require('../config/passport');

app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.use((err, req, res, next) => {
  res.json(err.message);
});

module.exports = app;
